import express from "express";
import { createStatsPLayer } from "../controllers/playerStatscontroller.js";


const playerStatsRoutes = express.Router();

playerStatsRoutes.post('/', createStatsPLayer);

export default playerStatsRoutes;