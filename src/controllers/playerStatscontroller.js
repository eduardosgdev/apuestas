import playerStatsModel from "../models/playerStats.js";

export const createStatsPLayer = async(req,res) =>{
    try {
        const {
        player,
        match,
        goles,
        asistencias,
        tirospuerta,
        faltascometidaspartido,
        faltasrecibidaspartido
    } = req.body
    
    const newPlayerStats = new playerStatsModel({
        player,
        match,
        goles,
        asistencias,
        tirospuerta,
        faltascometidaspartido,
        faltasrecibidaspartido

    })
    await newPlayerStats.save();

        return res.status(201).json({
            message: "PlayerStas creado correctamente",
            
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al crear el partido",
            error: error.message
        });
    }
}

export const getPlayerStatsByTeamMatches = async (req, res) => {
    try {
        const { equipoId } = req.params;

        // Recibimos los IDs de los partidos y jugadores
        const { matches, players } = req.body;

        if (!Array.isArray(matches) || !Array.isArray(players)) {
            return res.status(400).json({
                message: "Debes proporcionar arrays de partidos y jugadores"
            });
        }

        const estadisticas = await playerStatsModel.find({
            match: { $in: matches },
            player: { $in: players }
        })
        .populate("player")
        .populate("match");

        res.status(200).json({
            total: estadisticas.length,
            estadisticas
        });

    } catch (error) {
        res.status(500).json({
            message: "Error al obtener las estadísticas de los jugadores",
            error: error.message
        });
    }
};