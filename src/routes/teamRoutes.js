import express from "express";
import { createTeam,getTeams } from "../controllers/teamController.js";

const teamRoutes = express.Router();

teamRoutes.post('/', createTeam);
teamRoutes.get('/', getTeams);


export default teamRoutes;