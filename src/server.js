
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import teamRoutes from './routes/teamRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import playerStatsRoutes from './routes/playerStatsRoutes.js';

import dataBase from './config/dataBase.js';

dotenv.config();

const app = express();

// CORS: orígenes autorizados
const allowedOrigins = [
    'http://localhost:5173',
    'https://predictpr0z.netlify.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origen no permitido: ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());

// Rutas
app.use('/teams', teamRoutes);
app.use('/matchs', matchRoutes);
app.use('/players', playerRoutes);
app.use('/playerstats', playerStatsRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API PredictPro funcionando correctamente'
    });
});

// Puerto de Render
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor PredictPro ejecutándose en puerto ${port}`);
});

// Conexión a MongoDB
dataBase();
