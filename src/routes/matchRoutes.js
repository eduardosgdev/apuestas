import express from "express";
import { createMatch , getTeamMatches} from "../controllers/matchController.js";
import { authMiddleware } from "../middelwares/authMiddelware.js";

const matchRoutes = express.Router();

matchRoutes.post('/',createMatch)
matchRoutes.get('/teammatch/:id', getTeamMatches)

export default matchRoutes;