import playerStatsModel from "../models/playerStats.js";

export const createStatsPLayer = async(req,res) =>{
    try {
        const {
        player,
        match,
        goles,
        tirospuerta,
        faltascometidaspartido,
        faltasrecibidaspartido
    } = req.body
    
    const newPlayerStats = new playerStatsModel({
        player,
        match,
        goles,
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