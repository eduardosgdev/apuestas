import mongoose from "mongoose";

import playerStatsModel from "../models/playerStats.js";
import playerModel from "../models/playerModel.js";
import matchModel from "../models/matchModel.js";

// ==========================================
// REGISTRAR ESTADÍSTICAS DE UN JUGADOR
// ==========================================


export const createStatsPLayer = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { match, estadisticas } = req.body;

        // Validar ID del encuentro
        if (!mongoose.isValidObjectId(match)) {
            return res.status(400).json({
                success: false,
                message: "ID del encuentro no válido"
            });
        }

        // Validar array de estadísticas
        if (!Array.isArray(estadisticas) || estadisticas.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Debes registrar al menos un jugador"
            });
        }

        // Validar estadísticas individuales
        const campos = [
            "goles",
            "asistencias",
            "tirospuerta",
            "faltascometidaspartido",
            "faltasrecibidaspartido"
        ];

        for (const stat of estadisticas) {

            if (!mongoose.isValidObjectId(stat.player)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de jugador no válido"
                });
            }

            for (const campo of campos) {
                if (
                    !Number.isInteger(stat[campo]) ||
                    stat[campo] < 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `El campo ${campo} debe ser un entero no negativo`
                    });
                }
            }
        }

        // Evitar jugadores repetidos
        const jugadoresIds = estadisticas.map(stat =>
            String(stat.player)
        );

        if (new Set(jugadoresIds).size !== jugadoresIds.length) {
            return res.status(400).json({
                success: false,
                message: "No puedes registrar dos veces al mismo jugador"
            });
        }

        await session.withTransaction(async () => {

            // 1. Comprobar que existe el encuentro
            const encuentro = await matchModel.findById(match)
                .session(session);

            if (!encuentro) {
                throw new Error("El encuentro no existe");
            }

            if (encuentro.estadisticasRegistradas === true) {
                throw new Error(
                    "Las estadísticas de este encuentro ya están registradas"
                );
            }

            // 2. Comprobar que existen todos los jugadores
            const jugadores = await playerModel.find({
                _id: { $in: jugadoresIds }
            }).session(session);

            if (jugadores.length !== jugadoresIds.length) {
                throw new Error("Uno o varios jugadores no existen");
            }

            // 3. Comprobar que pertenecen a los equipos del encuentro
            const equiposValidos = [
                String(encuentro.team1),
                String(encuentro.team2)
            ];

            const todosValidos = jugadores.every(jugador =>
                equiposValidos.includes(String(jugador.equipo))
            );

            if (!todosValidos) {
                throw new Error(
                    "Hay jugadores que no pertenecen a los equipos del encuentro"
                );
            }

            // 4. Bloquear el encuentro para evitar duplicados
            const encuentroActualizado = await matchModel.findOneAndUpdate(
                {
                    _id: match,
                    estadisticasRegistradas: { $ne: true }
                },
                {
                    $set: {
                        estadisticasRegistradas: true
                    }
                },
                {
                    new: true,
                    session
                }
            );

            if (!encuentroActualizado) {
                throw new Error(
                    "Las estadísticas de este encuentro ya están registradas"
                );
            }

            // 5. Crear registros individuales en PlayerStats
            const nuevosRegistros = estadisticas.map(stat => ({
                player: stat.player,
                match,
                goles: stat.goles,
                asistencias: stat.asistencias,
                tirospuerta: stat.tirospuerta,
                faltascometidaspartido: stat.faltascometidaspartido,
                faltasrecibidaspartido: stat.faltasrecibidaspartido
            }));

            await playerStatsModel.insertMany(
                nuevosRegistros,
                { session }
            );

            // 6. Actualizar estadísticas acumuladas en Player
            for (const stat of estadisticas) {

                const actualizacion = await playerModel.updateOne(
                    { _id: stat.player },
                    {
                        $inc: {
                            encuentros: 1,
                            goles: stat.goles,
                            asistencias: stat.asistencias,
                            tirospuerta: stat.tirospuerta,
                            faltascometidas: stat.faltascometidaspartido,
                            faltasrecibidas: stat.faltasrecibidaspartido
                        }
                    },
                    { session }
                );

                if (actualizacion.matchedCount !== 1) {
                    throw new Error(
                        `No se pudo actualizar el jugador ${stat.player}`
                    );
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: "Estadísticas registradas y acumulados actualizados correctamente"
        });

    } catch (error) {

        console.error("ERROR AL REGISTRAR ESTADÍSTICAS:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });

    } finally {
        await session.endSession();
    }
};



// ==========================================
// OBTENER ESTADÍSTICAS DE UN ENCUENTRO
// ==========================================

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