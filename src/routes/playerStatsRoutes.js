import express from "express";
import { createStatsPLayer, getPlayerStatsByTeamMatches , getPlayerStatsByMatch, getPlayerStatsByPlayerAndMatch,updatePlayerStatsByMatch} from "../controllers/playerStatscontroller.js";


const playerStatsRoutes = express.Router();

playerStatsRoutes.post('/', createStatsPLayer);
playerStatsRoutes.post('/comparativa', getPlayerStatsByTeamMatches)
playerStatsRoutes.get('/match/:matchId', getPlayerStatsByMatch);
playerStatsRoutes.get('/playerstats',getPlayerStatsByPlayerAndMatch)
playerStatsRoutes.put('/player-match', updatePlayerStatsByMatch);

export default playerStatsRoutes;