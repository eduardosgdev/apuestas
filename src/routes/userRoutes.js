import express from "express"
import { createUser,getUsers,getUserById } from "../controllers/userController.js";
import { loginUser } from "../controllers/loginController.js";

const userRoutes = express.Router();

userRoutes.post('/',createUser);
userRoutes.get('/',getUsers);
userRoutes.get('/:id', getUserById)
userRoutes.post('/login', loginUser)
export default userRoutes