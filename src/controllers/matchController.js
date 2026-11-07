
import matchModel from "../models/matchModel.js";

export const createMatch = async (req, res) => {
    try {
        const {
            competicion,
            temporada,
            team1,
            team2,
            golesteam1,
            golesteam2,
            cornersteam1,
            cornersteam2,
            estiloofteam1,
            estiloofteam2,
            estilodefteam1,
            estilodefteam2
        } = req.body;

        // Comprobar que los equipos sean diferentes
        if (team1 === team2) {
            return res.status(400).json({
                message: "Los equipos deben ser diferentes"
            });
        }

        const newMatch = new matchModel({
            competicion,
            temporada,
            team1,
            team2,
            golesteam1,
            golesteam2,
            cornersteam1,
            cornersteam2,
            estiloofteam1,
            estiloofteam2,
            estilodefteam1,
            estilodefteam2
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

export const getTeamMatches = async(req,res) =>{
    try {
        const {id} = req.params;
        const matches = await matchModel.find({
            $or: [
                { team1: id },
                { team2: id }
            ]
        })
        .populate('team1')
        .populate('team2');

        res.status(200).json(matches);

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los encuentros',
            error: error.message
        });
    }
}
