import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { CustomJwtPayload } from "../types/express";

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    console.error("JWT_SECRET tidak terdefinisi di environment variables.");
    return res.status(500).send("Kesalahan konfigurasi server.");
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Token dibutuhkan");
  }

  try {
    const secretKeyBytes = new TextEncoder().encode(secretKey);

    const { payload } = await jwtVerify(token, secretKeyBytes);

    req.user = payload as CustomJwtPayload;
    next();
  } catch (error: any) {
    console.error(
      `[authenticateToken] Verifikasi token gagal: ${error.message}`
    );

    return res.status(403).send("Token tidak valid atau kedaluwarsa");
  }
};

export { authenticateToken };
