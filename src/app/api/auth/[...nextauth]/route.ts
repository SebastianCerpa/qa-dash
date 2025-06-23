/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/prisma";

// Validar variables de entorno
if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.NEXTAUTH_SECRET
) {
  throw new Error("Faltan variables de entorno requeridas");
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Buscar usuario en la base de datos
          const user = await prisma.users.findUnique({
            where: { email: credentials.email },
          });

          if (!user) return null;

          // Comparar contraseña hasheada
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!isValidPassword) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image:
              user.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=random`,
          };
        } catch (error) {
          console.error("Database authentication error:", {
            message: error instanceof Error ? error.message : "Unknown error",
            code: (error as any)?.code,
            meta: (error as any)?.meta,
            email: credentials?.email,
          });

          // Return null to indicate authentication failure
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = token.image as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permite URLs relativas
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Permite URLs del mismo origen
      else if (new URL(url).origin === baseUrl) return url;
      // Redirige a la página principal (dashboard) por defecto
      return `${baseUrl}/`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hora
    updateAge: 60 * 30, // 30 minutos
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
