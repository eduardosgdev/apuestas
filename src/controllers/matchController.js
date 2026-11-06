
import matchModel from "../models/matchModel.js";

export const createMatch = async (req, res) => {
    try {
        const {
            team1,
            team2,
            golesteam1,
            golesteam2,
            cornersteam1,
            cornersteam2,
            estiloteam1,
            estiloteam2
        } = req.body;

        // Comprobar que los equipos sean diferentes
        if (team1 === team2) {
            return res.status(400).json({
                message: "Los equipos deben ser diferentes"
            });
        }

        const newMatch = new matchModel({
            team1,
            team2,
            golesteam1,
            golesteam2,
            cornersteam1,
            cornersteam2,
            estiloteam1,
            estiloteam2
        });

        await newMatch.save();

        return res.status(201).json({
            message: "Partido creado correctamente",
            match: newMatch
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al crear el partido",
            error: error.message
        });
    }
};
