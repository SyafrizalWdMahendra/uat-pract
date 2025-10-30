import { Router } from "express";
import {
  register,
  login,
  googleLogin
} from "../../modules/auth/controllers/authControllers";
import {
  deleteUser,
  getUsers,
} from "../../modules/auth/controllers/userControllers";
import {
  oauthController,
  redirectToGoogle,
} from "../../modules/auth/controllers/oauthController";
// import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/loginGoogle", googleLogin);
router.get("/getUsers", getUsers);
router.delete("/deleteUsers/:id", deleteUser);
// Rute untuk memulai login
// Frontend akan mengarah ke sini
router.get("/auth/google", redirectToGoogle);

// Rute callback yang akan dipanggil oleh Google
// Ini harus sama dengan 'GOOGLE_CALLBACK_URL' di .env Anda
router.get("/auth/google/callback", oauthController);

export default router;
