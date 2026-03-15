
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@utils/database';
import User from '@models/user';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=Google login failed', req.url));
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${url.origin}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }).toString(),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('Google token error:', tokenData.error_description);
            return NextResponse.redirect(new URL(`/login?error=${tokenData.error_description}`, req.url));
        }

        const { access_token, id_token } = tokenData;

        // Fetch user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userInfo = await userInfoResponse.json();

        if (userInfo.error) {
            console.error('Google user info error:', userInfo.error.message);
            return NextResponse.redirect(new URL(`/login?error=${userInfo.error.message}`, req.url));
        }

        await connectToDB();

        let user = await User.findOne({ email: userInfo.email });

        if (!user) {
            // Create new user if not exists
            user = new User({
                email: userInfo.email,
                username: userInfo.name || userInfo.email.split('@')[0],
                image: userInfo.picture,
                googleId: userInfo.sub, // Google user ID
            });
            await user.save();
        } else {
            // Update existing user with Google ID and image if not present
            if (!user.googleId) user.googleId = userInfo.sub;
            if (!user.image) user.image = userInfo.picture;
            await user.save();
        }

        // Generate and set JWT
        const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });

        const response = NextResponse.redirect(new URL('/', req.url));
        response.cookies.set('token', appToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=Google login failed', req.url));
    }
}
