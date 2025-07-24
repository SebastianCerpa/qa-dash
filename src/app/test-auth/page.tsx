"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Test de Autenticación</h1>
        
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Estado de la Sesión:</h2>
            <p className="text-sm">
              <strong>Status:</strong> {status}
            </p>
          </div>

          {session ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">[OK] Usuario Autenticado</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>ID:</strong> {session.user?.id}</p>
                  <p><strong>Nombre:</strong> {session.user?.name}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Rol:</strong> {session.user?.role}</p>
                  <p><strong>Imagen:</strong> {session.user?.image}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => signOut()} 
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Cerrar Sesión
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/test-plans/new'} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Ir a Crear Test Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">[WARNING] Usuario No Autenticado</h3>
                <p className="text-sm text-yellow-700">
                  No hay una sesión activa. Necesitas iniciar sesión.
                </p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => signIn()} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Iniciar Sesión
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/login'} 
                  className="w-full bg-gray-600 hover:bg-gray-700"
                >
                  Ir a Página de Login
                </Button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">[DEBUG] Información de Debug</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
              <p><strong>URL:</strong> {window.location.href}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}