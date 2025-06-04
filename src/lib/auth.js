
//src/utilities/auth.js
import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";


import { getServerSession } from "next-auth";


export const authOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  // debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
};
export const getAuthSession = () => getServerSession(authOptions);


