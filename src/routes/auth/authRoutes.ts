import { Router } from "express";
import {
  register,
  login,
} from "../../modules/auth/controllers/authControllers";
import { getUsers } from "../../modules/auth/controllers/userControllers";
import {
  oauthController,
  redirectToGoogle,
} from "../../modules/auth/controllers/oauthController";
// import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getUsers", getUsers);
// Rute untuk memulai login
// Frontend akan mengarah ke sini
router.get("/auth/google", redirectToGoogle);

// Rute callback yang akan dipanggil oleh Google
// Ini harus sama dengan 'GOOGLE_CALLBACK_URL' di .env Anda
router.get("/auth/google/callback", oauthController);

export default router;
