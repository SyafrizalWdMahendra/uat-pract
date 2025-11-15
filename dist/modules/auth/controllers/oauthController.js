"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthController = exports.redirectToGoogle = void 0;
const google_auth_library_1 = require("google-auth-library");
const jose_1 = require("jose");
const client_1 = require("../../../prisma/client");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
const getSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET tidak diatur di environment variables.");
    }
    return new TextEncoder().encode(secret);
};
const redirectToGoogle = (req, res) => {
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
exports.redirectToGoogle = redirectToGoogle;
const oauthController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send("Otentikasi gagal: Tidak ada kode.");
    }
    try {
        const { tokens } = yield client.getToken(code);
        if (!tokens.id_token) {
            throw new Error("Google tidak mengembalikan id_token.");
        }
        client.setCredentials(tokens);
        const ticket = yield client.verifyIdToken({
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
        let user = yield client_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = yield client_1.prisma.user.create({
                data: {
                    email,
                    name,
                    avatar: picture !== null && picture !== void 0 ? picture : null,
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
        const jwtToken = yield new jose_1.SignJWT(tokenPayload)
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
});
exports.oauthController = oauthController;
