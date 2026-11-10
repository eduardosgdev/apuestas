
import playerModel from "../models/playerModel.js";
import mongoose from "mongoose";


export const createPlayer = async (req, res) => {
    try {
        const {
            equipo,
            nombre,
            apellidos,
            posicion,
            encuentros,
            goles,
            asistencias,
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
            asistencias,
            encuentros,
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

export const teamPlayers = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de equipo no válido"
            });
        }

        const players = await playerModel.find({
            equipo: id
        });

        return res.status(200).json({
            success: true,
            total: players.length,
            players
        });

    } catch (error) {
        console.error("Error obteniendo jugadores:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};