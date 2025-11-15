import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { registerSchema } from "../dto/registDto";
import { loginSchema } from "../dto/loginDto";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET tidak diatur di environment variables.");
  }
  return new TextEncoder().encode(secret);
};

export const register = async (req: Request, res: Response) => {
  try {
    const registValidation = registerSchema.parse(req.body);
    const { name, email, password, role } = registValidation;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return responses(res, 409, "Email already registered", null);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return responses(res, 201, "User successfully registered", newUser);
  } catch (error) {
    console.error("[register] Error:", error);
    return responses(res, 500, "Terjadi kesalahan pada server", null);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const loginValidation = loginSchema.parse(req.body);
    const { email, password } = loginValidation;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return responses(res, 404, "Pengguna tidak ditemukan", null);
    }

    if (!user.password) {
      return responses(res, 401, "Email atau password salah", null);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return responses(res, 401, "Email atau password salah", null);
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const secretKey = getSecretKey();
    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secretKey);

    return responses(res, 200, "Login berhasil", { token });
  } catch (error) {
    console.error("[login] Error:", error);
    return responses(res, 500, "Terjadi kesalahan pada server", null);
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return responses(
        res,
        400,
        "Email dan nama wajib diisi dari Google",
        null
      );
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: null,
          avatar: null,
          role: "users",
        },
      });
    }

    if (!user) {
      return responses(res, 500, "Gagal memproses user", null);
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const secretKey = getSecretKey();
    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secretKey);

    return responses(res, 200, "Login Google berhasil", { token });
  } catch (error) {
    console.error("[googleLogin] Error:", error);
    return responses(res, 500, "Terjadi kesalahan pada server", null);
  }
};
