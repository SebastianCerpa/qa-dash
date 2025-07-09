/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Extract the ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // Get the ID from the path
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Validar que el ID es válido
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: "ID de caso de prueba inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, bug_report, notes } = body;

    // Validar el estado proporcionado
    if (!status || !['PASSED', 'FAILED', 'BLOCKED', 'NOT_EXECUTED'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid State. Must be one of: PASSED, FAILED, BLOCKED, NOT_EXECUTED" },
        { status: 400 }
      );
    }

    // Verificar que el caso de prueba existe
    const testCase = await prisma.test_cases.findUnique({
      where: { id },
    });

    if (!testCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    // Actualizar el estado del caso de prueba
    const updatedTestCase = await prisma.test_cases.update({
      where: { id },
      data: {
        status,
        last_executed: new Date(),
        last_executed_by: session.user.email,
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        test_plans: {
          select: { id: true, title: true },
        },
        linked_task: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    // Crear un registro de ejecución
    await prisma.test_executions.create({
      data: {
        test_case_id: id,
        executed_by: session.user.email,
        status,
        execution_date: new Date(),
        notes: body.notes || null,
      },
    });

    // Si el caso de prueba falló y se solicitó un informe de error, crearlo
    if (status === 'FAILED' && bug_report) {
      try {
        // Obtener el usuario por email
        const user = await prisma.users.findUnique({
          where: { email: session.user.email },
        });

        if (!user) {
          console.error("Usuario no encontrado para crear informe de error");
        } else {
          await prisma.bug_reports.create({
            data: {
              title: bug_report.title || `Bug en caso de prueba: ${testCase.title}`,
              description: bug_report.description || '',
              status: 'OPEN',
              priority: 'MEDIUM',
              reporter_id: user.id,
              test_case_link: id,
            },
          });
        }
      } catch (bugError) {
        console.error("Error creating bug report:", bugError);
        // Continuamos aunque falle la creación del informe de error
      }
    }

    // Procesar los campos JSON antes de devolver la respuesta
    try {
      // Obtener las ejecuciones del caso de prueba
      const testExecutions = await prisma.test_executions.findMany({
        where: { test_case_id: id },
        orderBy: { execution_date: 'desc' },
        include: {
          created_bug: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

      const processedTestCase = {
        ...updatedTestCase,
        steps: updatedTestCase.steps ? (typeof updatedTestCase.steps === 'string' ? JSON.parse(updatedTestCase.steps) : updatedTestCase.steps) : [],
        tags: updatedTestCase.tags ? (typeof updatedTestCase.tags === 'string' ? JSON.parse(updatedTestCase.tags) : []) : [],
        test_executions: testExecutions,
      };

      return NextResponse.json(processedTestCase);
    } catch (parseError) {
      console.error("Error parsing JSON fields:", parseError);
      return NextResponse.json(
        { error: "Error al procesar los datos del caso de prueba" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error executing test case:", error);
    return NextResponse.json(
      { error: "Error al ejecutar el caso de prueba" },
      { status: 500 }
    );
  }
}