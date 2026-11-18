import express from "express";
import { dataBase } from "./database/db.js";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import playerStatsRoutes from "./routes/playerStatsRoutes.js";

const app = express();
const allowedOrigins = [
    'http://localhost:5173',
    'https://predictpr0z.netlify.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}));
app.use(express.json())

// rutas

app.use('/users', userRoutes)
app.use('/teams', teamRoutes);
app.use('/matchs', matchRoutes);
app.use('/players' ,playerRoutes)
app.use('/playerstats',playerStatsRoutes)

const port = process.env.PORT || 3000 ;
app.listen (port)
dataBase();