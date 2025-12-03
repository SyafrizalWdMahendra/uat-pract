import { jwtVerify } from "jose";
const authenticateToken = async (req, res, next) => {
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
};
export { authenticateToken };
