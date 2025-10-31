// file: src/controllers/authController.ts

import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/client";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

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
          role: "manager",
        },
      });
    }

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    console.error("Error pada Google OAuth callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};
