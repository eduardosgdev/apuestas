import express from "express";
import { createPlayer,teamPlayers } from "../controllers/playerController.js";

const playerRoutes = express.Router();

playerRoutes.post('/', createPlayer);
playerRoutes.get('/:id', teamPlayers)

export default playerRoutes;