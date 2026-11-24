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


export const getPlayerStatsByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;

        const estadisticas = await playerStatsModel.find({
            match: matchId
        })
        .select('player goles asistencias tirospuerta faltascometidaspartido faltasrecibidaspartido');

        return res.status(200).json({
            total: estadisticas.length,
            estadisticas
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener las estadísticas del encuentro",
            error: error.message
        });
    }
};


export const getPlayerStatsByPlayerAndMatch = async (req, res) => {

    try {

        const { match, player } = req.body;


        // ==========================================
        // 1. VALIDACIONES INICIALES
        // ==========================================

        if (
            !mongoose.isValidObjectId(match) ||
            !mongoose.isValidObjectId(player)
        ) {
            return res.status(400).json({
                success: false,
                message: "Los IDs del encuentro o jugador no son válidos"
            });
        }


        // ==========================================
        // 2. BUSCAR ESTADÍSTICAS
        // ==========================================

        const estadisticas = await playerStatsModel.findOne({

            match: match,
            player: player

        })
        .populate("player")
        .populate("match");


        // ==========================================
        // 3. COMPROBAR RESULTADO
        // ==========================================

        if (!estadisticas) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron estadísticas de este jugador en el encuentro"
            });
        }


        // ==========================================
        // 4. RESPUESTA EXITOSA
        // ==========================================

        return res.status(200).json({

            success: true,
            message: "Estadísticas encontradas correctamente",
            estadisticas

        });


    } catch (error) {

        console.error(
            "ERROR AL BUSCAR ESTADÍSTICAS:",
            error
        );

        return res.status(500).json({

            success: false,
            message: "Error al obtener las estadísticas",
            error: error.message

        });

    }

};


export const updatePlayerStatsByMatch = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        const {
            match,
            player,
            goles,
            asistencias,
            tirospuerta,
            faltascometidaspartido,
            faltasrecibidaspartido
        } = req.body;


        // ==========================================
        // 1. VALIDACIONES INICIALES
        // ==========================================

        if (
            !mongoose.isValidObjectId(match) ||
            !mongoose.isValidObjectId(player)
        ) {
            return res.status(400).json({
                success: false,
                message: "Los IDs del encuentro o jugador no son válidos"
            });
        }


        // ==========================================
        // 2. VALIDAR ESTADÍSTICAS
        // ==========================================

        const valores = {
            goles,
            asistencias,
            tirospuerta,
            faltascometidaspartido,
            faltasrecibidaspartido
        };

        for (const [campo, valor] of Object.entries(valores)) {

            if (
                !Number.isInteger(valor) ||
                valor < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `El campo ${campo} debe ser un entero no negativo`
                });
            }

        }


        // ==========================================
        // 3. INICIAR TRANSACCIÓN
        // ==========================================

        let resultado;

        await session.withTransaction(async () => {


            // ==========================================
            // 4. COMPROBAR ENCUENTRO
            // ==========================================

            const encuentro = await matchModel.findById(match)
                .session(session);

            if (!encuentro) {
                throw new Error("El encuentro no existe");
            }


            // ==========================================
            // 5. COMPROBAR JUGADOR
            // ==========================================

            const jugador = await playerModel.findById(player)
                .session(session);

            if (!jugador) {
                throw new Error("El jugador no existe");
            }


            // ==========================================
            // 6. COMPROBAR PERTENENCIA AL ENCUENTRO
            // ==========================================

            const equiposValidos = [
                String(encuentro.team1),
                String(encuentro.team2)
            ];

            if (!equiposValidos.includes(String(jugador.equipo))) {
                throw new Error(
                    "El jugador no pertenece a los equipos del encuentro"
                );
            }


            // ==========================================
            // 7. BUSCAR REGISTRO ANTERIOR
            // ==========================================

            const anterior = await playerStatsModel.findOne({
                match,
                player
            }).session(session);


            // ==========================================
            // 8. CALCULAR DIFERENCIAS
            // ==========================================

            const diferencias = {};

            for (const campo of Object.keys(valores)) {

                const valorAnterior = anterior
                    ? anterior[campo]
                    : 0;

                diferencias[campo] = valores[campo] - valorAnterior;

            }


            // ==========================================
            // 9. CREAR O ACTUALIZAR PLAYERSTATS
            // ==========================================

            if (anterior) {

                anterior.goles = goles;
                anterior.asistencias = asistencias;
                anterior.tirospuerta = tirospuerta;
                anterior.faltascometidaspartido = faltascometidaspartido;
                anterior.faltasrecibidaspartido = faltasrecibidaspartido;

                await anterior.save({ session });

            } else {

                await playerStatsModel.create(
                    [{
                        player,
                        match,
                        goles,
                        asistencias,
                        tirospuerta,
                        faltascometidaspartido,
                        faltasrecibidaspartido
                    }],
                    { session }
                );

            }


            // ==========================================
            // 10. ACTUALIZAR ACUMULADOS DEL JUGADOR
            // ==========================================

            const incrementos = {

                goles: diferencias.goles,
                asistencias: diferencias.asistencias,
                tirospuerta: diferencias.tirospuerta,
                faltascometidas: diferencias.faltascometidaspartido,
                faltasrecibidas: diferencias.faltasrecibidaspartido

            };

            if (!anterior) {
                incrementos.encuentros = 1;
            }

            const actualizacion = await playerModel.updateOne(
                { _id: player },
                {
                    $inc: incrementos
                },
                { session }
            );

            if (actualizacion.matchedCount !== 1) {
                throw new Error("No se pudieron actualizar los acumulados del jugador");
            }


            resultado = {
                registroCreado: !anterior,
                estadisticas: valores,
                diferencias
            };

        });


        // ==========================================
        // 11. RESPUESTA EXITOSA
        // ==========================================

        return res.status(200).json({

            success: true,

            message: resultado.registroCreado
                ? "Estadísticas del jugador añadidas correctamente"
                : "Estadísticas del jugador actualizadas correctamente",

            resultado

        });


    } catch (error) {

        console.error(
            "ERROR AL ACTUALIZAR ESTADÍSTICAS:",
            error
        );

        return res.status(400).json({

            success: false,
            message: error.message

        });

    } finally {

        await session.endSession();

    }

};

