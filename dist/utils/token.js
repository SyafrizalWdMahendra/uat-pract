"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
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
    jsonwebtoken_1.default.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).send("Token tidak valid atau kedaluwarsa");
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
