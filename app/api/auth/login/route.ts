
import { connectToDB } from '@utils/database';
import User from '@models/user';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const POST = async (req: NextRequest) => {
    const { email, password } = await req.json();

    try {
        await connectToDB();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
        }

        // Check if user has a password (users who signed up with Google don't have passwords)
        if (!user.password) {
            return NextResponse.json({ message: "Please sign in with Google" }, { status: 400 });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });

        const response = new NextResponse(JSON.stringify(user), { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 3600,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Error logging in:", error);
        return NextResponse.json({ message: "Failed to log in" }, { status: 500 });
    }
}
