import { OAuth2Client } from "google-auth-library";
import { SignJWT } from "jose";
import { prisma } from "../../../prisma/client";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
const getSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET tidak diatur di environment variables.");
    }
    return new TextEncoder().encode(secret);
};
export const redirectToGoogle = (req, res) => {
    try {
        const authUrl = client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
        });
        res.redirect(authUrl);
    }
    catch (error) {
        console.error("Error creating Google auth URL:", error);
        res.status(500).send("Gagal memulai autentikasi Google");
    }
};
export const oauthController = async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send("Otentikasi gagal: Tidak ada kode.");
    }
    try {
        const { tokens } = await client.getToken(code);
        if (!tokens.id_token) {
            throw new Error("Google tidak mengembalikan id_token.");
        }
        client.setCredentials(tokens);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.name) {
            return res
                .status(400)
                .send("Gagal mendapatkan info pengguna dari Google.");
        }
        const { email, name, picture } = payload;
        let user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    avatar: picture ?? null,
                    role: "users",
                    password: null,
                },
            });
        }
        const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        const secret = getSecretKey();
        const jwtToken = await new SignJWT(tokenPayload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(secret);
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);
    }
    catch (error) {
        console.error("Error pada Google OAuth callback:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
};
