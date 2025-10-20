import { Router } from "express";
import {
  register,
  login,
} from "../../modules/auth/controllers/authControllers";
import { getUsers } from "../../modules/auth/controllers/userControllers";
// import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getUsers", getUsers);

export default router;
