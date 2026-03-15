
import { NextResponse } from 'next/server';

export const POST = async () => {
    try {
        const response = new NextResponse("Successfully logged out", { status: 200 });

        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: -1,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Error logging out:", error);
        return new NextResponse("Failed to log out", { status: 500 });
    }
}
