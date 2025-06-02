import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Save ID token on first login
      if (account?.id_token) {
        token.idToken = account.id_token;

        // Send token to backend on sign in
        try {
          await fetch("http://localhost:5000/api/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: account.id_token }),
          });
        } catch (err) {
          console.error("Error sending token to backend:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Make it available to the client
      session.idToken = token.idToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
