"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authControllers_1 = require("../../modules/auth/controllers/authControllers");
const userControllers_1 = require("../../modules/auth/controllers/userControllers");
const oauthController_1 = require("../../modules/auth/controllers/oauthController");
// import { catchAsync } from "../../utils/catchAsync";
const router = (0, express_1.Router)();
router.post("/register", authControllers_1.register);
router.post("/login", authControllers_1.login);
router.post("/loginGoogle", authControllers_1.googleLogin);
router.get("/getUsers", userControllers_1.getUsers);
router.delete("/deleteUsers/:id", userControllers_1.deleteUser);
// Rute untuk memulai login
// Frontend akan mengarah ke sini
router.get("/auth/google", oauthController_1.redirectToGoogle);
// Rute callback yang akan dipanggil oleh Google
// Ini harus sama dengan 'GOOGLE_CALLBACK_URL' di .env Anda
router.get("/auth/google/callback", oauthController_1.oauthController);
exports.default = router;
