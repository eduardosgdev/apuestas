import express from "express";
import { createStatsPLayer, getPlayerStatsByTeamMatches } from "../controllers/playerStatscontroller.js";


const playerStatsRoutes = express.Router();

playerStatsRoutes.post('/', createStatsPLayer);
playerStatsRoutes.post('/comparativa', getPlayerStatsByTeamMatches)

export default playerStatsRoutes;