import { Router } from "express";
import { register, login } from "../modules/auth/controllers/authControllers";
import { getUsers } from "../modules/auth/controllers/userControllers";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getUsers", getUsers);
// router.post('/', createItem);
// router.put('/:id', updateItem);
// router.delete('/:id', deleteItem);

export default router;
