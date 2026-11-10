


import mongoose from "mongoose";

import matchModel from "../models/matchModel.js";
import playerModel from "../models/playerModel.js";
import playerStatsModel from "../models/playerStats.js";
import teamModel from "../models/teamModels.js";

export const createMatch = async (req, res) => {

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
        estilodefteam2,
        jugadoresTeam1,
        jugadoresTeam2
    } = req.body;

    // ==========================================
    // 1. VALIDACIONES INICIALES
    // ==========================================

    if (
        !mongoose.isValidObjectId(team1) ||
        !mongoose.isValidObjectId(team2) ||
        String(team1) === String(team2)
    ) {
        return res.status(400).json({
            error: "Los IDs de los equipos no son válidos"
        });
    }

    // Los arrays son opcionales.
    // Si no llegan, se consideran vacíos.

    const jugadores1 = jugadoresTeam1 === undefined
        ? []
        : jugadoresTeam1;

    const jugadores2 = jugadoresTeam2 === undefined
        ? []
        : jugadoresTeam2;

    if (
        !Array.isArray(jugadores1) ||
        !Array.isArray(jugadores2) ||
        jugadores1.length > 3 ||
        jugadores2.length > 3
    ) {
        return res.status(400).json({
            error: "Cada equipo puede registrar entre 0 y 3 jugadores"
        });
    }

    // ==========================================
    // 2. REUNIR LOS JUGADORES
    // ==========================================

    const todosJugadores = [
        ...jugadores1,
        ...jugadores2
    ];

    const idsJugadores = todosJugadores.map(j =>
        String(j.player)
    );

    if (
        idsJugadores.some(id => !mongoose.isValidObjectId(id)) ||
        new Set(idsJugadores).size !== idsJugadores.length
    ) {
        return res.status(400).json({
            error: "Los IDs de los jugadores deben ser válidos y diferentes"
        });
    }

    // ==========================================
    // 3. VALIDAR ESTADÍSTICAS INDIVIDUALES
    // ==========================================

    const camposStats = [
        "goles",
        "asistencias",
        "tirospuerta",
        "faltascometidaspartido",
        "faltasrecibidaspartido"
    ];

    for (const jugador of todosJugadores) {

        for (const campo of camposStats) {

            const valor = jugador[campo];

            if (
                !Number.isFinite(valor) ||
                valor < 0
            ) {
                return res.status(400).json({
                    error: `Estadística inválida: ${campo}`
                });
            }
        }
    }

    // ==========================================
    // 4. VALIDAR GOLES Y CÓRNERS
    // ==========================================

    const valoresPartido = [
        golesteam1,
        golesteam2,
        cornersteam1,
        cornersteam2
    ];

    if (
        valoresPartido.some(valor =>
            !Number.isFinite(valor) || valor < 0
        )
    ) {
        return res.status(400).json({
            error: "Los goles y córners deben ser números no negativos"
        });
    }

    // ==========================================
    // 5. INICIAR TRANSACCIÓN
    // ==========================================

    const session = await mongoose.startSession();

    try {

        let resultadoMatch;

        await session.withTransaction(async () => {

            // ==========================================
            // 6. COMPROBAR QUE EXISTEN LOS EQUIPOS
            // ==========================================

            const equipos = await teamModel.find({
                _id: {
                    $in: [team1, team2]
                }
            }).session(session);

            if (equipos.length !== 2) {
                throw new Error("Uno o ambos equipos no existen");
            }

            // ==========================================
            // 7. BUSCAR JUGADORES
            // ==========================================

            const jugadores = await playerModel.find({
                _id: {
                    $in: idsJugadores
                }
            }).session(session);

            if (jugadores.length !== idsJugadores.length) {
                throw new Error("Uno o varios jugadores no existen");
            }

            const jugadoresMap = new Map(
                jugadores.map(j => [
                    String(j._id),
                    j
                ])
            );

            // ==========================================
            // 8. COMPROBAR PERTENENCIA TEAM1
            // ==========================================

            for (const jugador of jugadores1) {

                const jugadorDB = jugadoresMap.get(
                    String(jugador.player)
                );

                if (
                    !jugadorDB ||
                    String(jugadorDB.equipo) !== String(team1)
                ) {
                    throw new Error(
                        "Un jugador local no pertenece al equipo local"
                    );
                }
            }

            // ==========================================
            // 9. COMPROBAR PERTENENCIA TEAM2
            // ==========================================

            for (const jugador of jugadores2) {

                const jugadorDB = jugadoresMap.get(
                    String(jugador.player)
                );

                if (
                    !jugadorDB ||
                    String(jugadorDB.equipo) !== String(team2)
                ) {
                    throw new Error(
                        "Un jugador visitante no pertenece al equipo visitante"
                    );
                }
            }

            // ==========================================
            // 10. CREAR EL ENCUENTRO
            // ==========================================

            const [match] = await matchModel.create(
                [{
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
                }],
                { session }
            );

            resultadoMatch = match;

            // ==========================================
            // 11. CREAR PLAYERSTATS
            // ==========================================

            if (todosJugadores.length > 0) {

                const estadisticasJugadores = todosJugadores.map(j => ({

                    player: j.player,
                    match: match._id,

                    goles: j.goles,
                    asistencias: j.asistencias,
                    tirospuerta: j.tirospuerta,

                    faltascometidaspartido:
                        j.faltascometidaspartido,

                    faltasrecibidaspartido:
                        j.faltasrecibidaspartido

                }));

                await playerStatsModel.insertMany(
                    estadisticasJugadores,
                    { session }
                );
            }

            // ==========================================
            // 12. ACTUALIZAR ESTADÍSTICAS PLAYER
            // ==========================================

            for (const jugador of todosJugadores) {

                await playerModel.updateOne(
                    {
                        _id: jugador.player
                    },
                    {
                        $inc: {

                            encuentros: 1,
                            goles: jugador.goles,
                            asistencias: jugador.asistencias,
                            tirospuerta: jugador.tirospuerta,

                            faltascometidas:
                                jugador.faltascometidaspartido,

                            faltasrecibidas:
                                jugador.faltasrecibidaspartido

                        }
                    },
                    { session }
                );
            }

            // ==========================================
            // 13. DETERMINAR RESULTADO
            // ==========================================

            const ganaTeam1 = golesteam1 > golesteam2;
            const ganaTeam2 = golesteam2 > golesteam1;
            const empate = golesteam1 === golesteam2;

            // ==========================================
            // 14. ACTUALIZAR TEAM1
            // ==========================================

            await teamModel.updateOne(
                {
                    _id: team1
                },
                {
                    $inc: {

                        totalencuentros: 1,

                        golesafavor: golesteam1,
                        golesencontra: golesteam2,

                        cornerscreados: cornersteam1,

                        encuentrosganados: ganaTeam1 ? 1 : 0,
                        encuentrosperdidos: ganaTeam2 ? 1 : 0,
                        encuentrosempatados: empate ? 1 : 0

                    }
                },
                { session }
            );

            // ==========================================
            // 15. ACTUALIZAR TEAM2
            // ==========================================

            await teamModel.updateOne(
                {
                    _id: team2
                },
                {
                    $inc: {

                        totalencuentros: 1,

                        golesafavor: golesteam2,
                        golesencontra: golesteam1,

                        cornerscreados: cornersteam2,

                        encuentrosganados: ganaTeam2 ? 1 : 0,
                        encuentrosperdidos: ganaTeam1 ? 1 : 0,
                        encuentrosempatados: empate ? 1 : 0

                    }
                },
                { session }
            );

        });

        // ==========================================
        // 16. RESPUESTA EXITOSA
        // ==========================================

        return res.status(201).json({

            mensaje: "Encuentro registrado correctamente",

            match: resultadoMatch,

            jugadoresRegistrados: todosJugadores.length,

            jugadoresTeam1: jugadores1.length,
            jugadoresTeam2: jugadores2.length,

            equiposActualizados: 2

        });

    } catch (error) {

        console.error(
            "ERROR AL CREAR ENCUENTRO:",
            error
        );

        return res.status(500).json({
            error: error.message ||
                "Error al registrar el encuentro"
        });

    } finally {

        await session.endSession();

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
