import express from "express";
import { createPlayer } from "../controllers/playerController.js";

const playerRoutes = express.Router();

playerRoutes.post('/', createPlayer);

export default playerRoutes;