// src/app/api/auth/signup/route.js
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma.ts";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
                emailVerified: new Date(), // Auto-verify for now, implement OTP later
            }
        });

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}