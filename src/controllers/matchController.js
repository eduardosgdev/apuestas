


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
        estilodefteam2
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


    // ==========================================
    // 2. VALIDAR GOLES Y CÓRNERS
    // ==========================================

    const valoresPartido = [
        golesteam1,
        golesteam2,
        cornersteam1,
        cornersteam2
    ];

    if (
        valoresPartido.some(valor =>
            !Number.isFinite(valor) ||
            valor < 0 ||
            !Number.isInteger(valor)
        )
    ) {
        return res.status(400).json({
            error: "Los goles y córners deben ser números enteros no negativos"
        });
    }


    // ==========================================
    // 3. INICIAR TRANSACCIÓN
    // ==========================================

    const session = await mongoose.startSession();

    try {

        let resultadoMatch;

        await session.withTransaction(async () => {


            // ==========================================
            // 4. COMPROBAR QUE EXISTEN LOS EQUIPOS
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
            // 5. CREAR EL ENCUENTRO
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
            // 6. DETERMINAR RESULTADO
            // ==========================================

            const ganaTeam1 = golesteam1 > golesteam2;
            const ganaTeam2 = golesteam2 > golesteam1;
            const empate = golesteam1 === golesteam2;


            // ==========================================
            // 7. ACTUALIZAR TEAM1
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
            // 8. ACTUALIZAR TEAM2
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
        // 9. RESPUESTA EXITOSA
        // ==========================================

        return res.status(201).json({

            mensaje: "Encuentro registrado correctamente",

            match: resultadoMatch,

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
