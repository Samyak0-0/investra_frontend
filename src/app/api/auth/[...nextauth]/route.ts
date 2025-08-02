// import NextAuth from "next-auth"
// import { authOptions } from "@/lib/auth"

// const handler = NextAuth(authOptions)

// export { handler as GET, handler as POST }


// src/app/api/auth/[...nextauth]/route.ts
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "../../../../lib/auth.js";

const handler = NextAuth(authOptions as NextAuthOptions);

export { handler as GET, handler as POST };