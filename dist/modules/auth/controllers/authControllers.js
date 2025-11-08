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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registDto_1 = require("../dto/registDto");
const loginDto_1 = require("../dto/loginDto");
const responses_1 = require("../../../utils/responses");
const client_1 = require("../../../prisma/client");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const registValidation = registDto_1.registerSchema.parse(req.body);
    const { name, email, password, role } = registValidation;
    const existingUser = yield client_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        return (0, responses_1.responses)(res, 409, "Email already registered", null);
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const newUser = yield client_1.prisma.user.create({
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
    return (0, responses_1.responses)(res, 201, "User successfully registered", newUser);
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const loginValidation = loginDto_1.loginSchema.parse(req.body);
    const { email, password } = loginValidation;
    const user = yield client_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return (0, responses_1.responses)(res, 404, "Pengguna tidak ditemukan", null);
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, (_a = user.password) !== null && _a !== void 0 ? _a : "null");
    if (!isPasswordValid) {
        return (0, responses_1.responses)(res, 401, "Email atau password salah", null);
    }
    const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    const secret = process.env.JWT_SECRET;
    const expiresIn = "1h";
    const token = jsonwebtoken_1.default.sign(tokenPayload, secret, { expiresIn });
    return (0, responses_1.responses)(res, 200, "Login berhasil", { token });
});
exports.login = login;
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return (0, responses_1.responses)(res, 400, "Email dan nama wajib diisi dari Google", null);
        }
        let user = yield client_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = yield client_1.prisma.user.create({
                data: {
                    name,
                    email,
                    password: "",
                    avatar: null,
                    role: "users",
                },
            });
        }
        if (!user) {
            return (0, responses_1.responses)(res, 500, "Gagal membuat user baru", null);
        }
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const secret = process.env.JWT_SECRET;
        const expiresIn = "1h";
        const token = jsonwebtoken_1.default.sign(tokenPayload, secret, { expiresIn });
        return (0, responses_1.responses)(res, 200, "Login Google berhasil", { token });
    }
    catch (error) {
        console.error("Google login error:", error);
        return (0, responses_1.responses)(res, 500, "Terjadi kesalahan pada server", null);
    }
});
exports.googleLogin = googleLogin;
