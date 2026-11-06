
import playerModel from "../models/playerModel.js";

export const createPlayer = async (req, res) => {
    try {
        const {
            equipo,
            nombre,
            apellidos,
            posicion,
            goles,
            tirospuerta,
            faltasrecibidas,
            faltascometidas
        } = req.body;

        const newPlayer = new playerModel({
            equipo,
            nombre,
            apellidos,
            posicion,
            goles,
            tirospuerta,
            faltasrecibidas,
            faltascometidas
        });

        await newPlayer.save();

        return res.status(201).json({
            message: "Jugador creado correctamente",
            jugador: newPlayer
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al crear el jugador",
            error: error.message
        });
    }
};
