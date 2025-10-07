import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema } from "../dto/registDto";
import { loginSchema } from "../dto/loginDto";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";

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
    console.error("Register error:", error);
    return responses(res, 500, "Internal server error", null);
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return responses(res, 401, "Email atau password salah", null);
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET!;
    const expiresIn = "1h";

    const token = jwt.sign(tokenPayload, secret, { expiresIn });

    return responses(res, 200, "Login berhasil", { token });
  } catch (error) {
    console.error("Login error:", error);
    return responses(res, 500, "Terjadi kesalahan pada server", null);
  }
};
