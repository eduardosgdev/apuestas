import teamModel from "../models/teamModels.js";

export const createTeam = async(req,res) =>{
    try {
        const {
            nombre,
            escudo,
            pais,
            puntuacion,
            totalencuentros,
            golesafavor,
            golesencontra,
            cornerscreados,
            encuentrosganados,
            encuentrosperdidos,
            encuentrosempatados
        } =req.body;
        
        const newTeam = new teamModel({
            nombre,
            escudo,
            pais,
            puntuacion,
            totalencuentros,
            golesafavor,
            golesencontra,
            cornerscreados,
            encuentrosganados,
            encuentrosperdidos,
            encuentrosempatados
        });

        await newTeam.save();
        return res.status(201).json({
            message: 'Equipo creado correctamente',
            team: newTeam
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al crear el equipo',
            error: error.message
        });
    }
}

export const getTeams = async (req, res) => {
    try {
        const equipos = await teamModel.find();

        res.status(200).json({
            success: true,
            total: equipos.length,
            equipos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los equipos',
            error: error.message
        });
    }
};