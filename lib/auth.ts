import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Validate environment variables
if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.NEXTAUTH_SECRET ||
  !process.env.NEXTAUTH_URL
) {
  throw new Error("Missing required environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL");
}

export const authOptions: NextAuthOptions = {
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
          // Find user in database
          const user = await prisma.users.findUnique({
            where: { email: credentials.email },
          });

          if (!user) return null;

          // Compare hashed password
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
  // Note: In Next.js 15 App Router, custom pages are handled differently
  // The pages config can cause conflicts with App Router
  // Custom auth pages should be implemented as app routes instead
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
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow URLs from the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Redirect to main page (dashboard) by default
      return `${baseUrl}/`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV !== 'production',
  secret: process.env.NEXTAUTH_SECRET,
};