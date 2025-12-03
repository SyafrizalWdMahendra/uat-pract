import { Router } from "express";
import {
  register,
  login,
  googleLogin,
} from "../../modules/auth/controllers/authControllers.js";
import {
  deleteUser,
  getUsers,
} from "../../modules/auth/controllers/userControllers.js";
import {
  oauthController,
  redirectToGoogle,
} from "../../modules/auth/controllers/oauthController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/loginGoogle", googleLogin);
router.get("/getUsers", getUsers);
router.delete("/deleteUsers/:id", deleteUser);
router.get("/auth/google", redirectToGoogle);
router.get("/auth/google/callback", oauthController);

export default router;
