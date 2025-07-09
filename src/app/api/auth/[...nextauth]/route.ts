/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import { authOptions } from "../../../../../lib/auth";

// Enable debug mode in development
if (process.env.NODE_ENV !== 'production') {
  authOptions.debug = true;
}

// Increase session duration for better user experience
authOptions.session = {
  ...authOptions.session,
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
