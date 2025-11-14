import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { SignJWT } from "jose";
import { prisma } from "../../../prisma/client.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET tidak diatur di environment variables.");
  }
  return new TextEncoder().encode(secret);
};

/**
 * Controller untuk memulai proses Google Login.
 * Ini mengarahkan pengguna ke halaman persetujuan Google.
 */
export const redirectToGoogle = (req: Request, res: Response) => {
  try {
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error creating Google auth URL:", error);
    res.status(500).send("Gagal memulai autentikasi Google");
  }
};

/**
 * Controller untuk menangani callback dari Google OAuth.
 */
export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Otentikasi gagal: Tidak ada kode.");
  }

  try {
    const { tokens } = await client.getToken(code as string);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
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
          email: email,
          name: name,
          avatar: picture,
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

    const secretKey = getSecretKey();
    const jwtToken = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS265" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secretKey);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    console.error("Error pada Google OAuth callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};
