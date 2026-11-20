
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// POST: Login usuario
export const loginUser = async (req, res) => {
    try {
        const { telefono, contraseña } = req.body;

        // Buscar usuario por teléfono
        const user = await userModel.findOne({ telefono });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Teléfono o contraseña incorrectos"
            });
        }

        // Comprobar contraseña
        const passwordCorrecta = await bcrypt.compare(
            contraseña,
            user.contraseña
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                success: false,
                message: "Teléfono o contraseña incorrectos"
            });
        }

        // Comprobar estado de cuenta
        if (!["activo", "bloqueado"].includes(user.estadocuenta)) {
            return res.status(403).json({
                success: false,
                message: "Tu cuenta no está activa"
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user._id,
                rol: user.rol,
                estado:user.estadocuenta
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Inicio de sesión correcto",
            token
            
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al iniciar sesión",
            error: error.message
        });
    }
};
