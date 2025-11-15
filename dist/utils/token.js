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
exports.authenticateToken = void 0;
const jose_1 = require("jose");
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 🔥 Tambahkan log disini
    console.log("====== Incoming Request Headers ======");
    console.log("Authorization Header:", req.headers["authorization"]);
    console.log("All Headers:", req.headers);
    console.log("=====================================");
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
        const { payload } = yield (0, jose_1.jwtVerify)(token, secretKeyBytes);
        req.user = payload;
        next();
    }
    catch (error) {
        let errorMessage = "Token tidak valid atau kedaluwarsa";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(`[authenticateToken] Verifikasi token gagal: ${errorMessage}`);
        return res.status(401).send("Token tidak valid atau kedaluwarsa");
    }
});
exports.authenticateToken = authenticateToken;
