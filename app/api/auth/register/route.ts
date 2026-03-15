import { connectToDB } from '@utils/database';
import User from '@models/user';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const POST = async (req: NextRequest) => {
    const { username, email, password } = await req.json();

    try {
        await connectToDB();

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        return new NextResponse(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ message: "Failed to create new user" }, { status: 500 });
    }
}
