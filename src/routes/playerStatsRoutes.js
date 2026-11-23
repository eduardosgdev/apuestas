import express from "express";
import { createStatsPLayer, getPlayerStatsByTeamMatches , getPlayerStatsByMatch} from "../controllers/playerStatscontroller.js";


const playerStatsRoutes = express.Router();

playerStatsRoutes.post('/', createStatsPLayer);
playerStatsRoutes.post('/comparativa', getPlayerStatsByTeamMatches)
playerStatsRoutes.get('/match/:matchId', getPlayerStatsByMatch);

export default playerStatsRoutes;