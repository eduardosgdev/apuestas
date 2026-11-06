import express from "express";
import { dataBase } from "./database/db.js";
import cors from "cors";
import teamRoutes from "./routes/teamRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import playerStatsRoutes from "./routes/playerStatsRoutes.js";

const app = express();
app.use(express.json())

// rutas

app.use('/teams', teamRoutes);
app.use('/matchs', matchRoutes);
app.use('/players' ,playerRoutes)
app.use('/playerstats',playerStatsRoutes)

const port = process.env.PORT || 3000 ;
app.listen (port)
dataBase();