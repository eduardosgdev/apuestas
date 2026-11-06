import express from "express";
import { createMatch } from "../controllers/matchController.js";

const matchRoutes = express.Router();

matchRoutes.post('/',createMatch)

export default matchRoutes;