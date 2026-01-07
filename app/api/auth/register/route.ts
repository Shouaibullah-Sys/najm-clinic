// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models/User";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const {
      name,
      email,
      password,
      phone,
      role = "staff",
    } = await request.json();

    // Validate input
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9+()\-\s]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      approved: role === "admin" ? true : false, // Auto-approve admins
      active: true,
    });

    await newUser.save();

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Account pending admin approval.",
        userId: newUser._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
