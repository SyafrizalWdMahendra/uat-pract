import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
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

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).send("Token tidak valid atau kedaluwarsa");
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
