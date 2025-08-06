// //src/utilities/auth.js
// import Credentials from "next-auth/providers/credentials";
// import GithubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import { prisma } from "./prisma";
// import { PrismaAdapter } from "@auth/prisma-adapter";


// import { getServerSession } from "next-auth";


// export const authOptions = {
//   // Configure one or more authentication providers
//   adapter: PrismaAdapter(prisma),
//   session: {
//     strategy: "database",
//   },
//   // debug: true,
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//     }),
//     GithubProvider({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//   ],
//   callbacks: {
//     session: ({ session, user }) => {
//       session.user.id = user.id;
//       return session;
//     },
//   },
// };
// export const getAuthSession = () => getServerSession(authOptions);

//src/lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        console.log("User found:", user);
        if (!user) return null;
        console.log("User hashedPassword:", user.hashedPassword);
        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isValid) return null;
        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  pages: {
    signIn: '/login', // Custom login page
    signUp: '/signup', // Custom signup page
  },
  callbacks: {
    async session({ session, token, user }) {
      // Use token.sub for user id in JWT sessions
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);