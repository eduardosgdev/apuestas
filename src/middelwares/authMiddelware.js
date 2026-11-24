
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// MIDDLEWARE: Verificar autenticación

export const authMiddleware = (requireAdmin = false) => {

    return async (req, res, next) => {
        try {

            c

            // Obtener token
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
               

                return res.status(401).json({
                    success: false,
                    message: "No autorizado. Token no proporcionado"
                });
            }

            const token = authHeader.split(" ")[1];

            // Verificar JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Buscar usuario
            const user = await userModel.findById(decoded.id)
                .select("-contraseña");


            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }


            if (user.estadocuenta !== "activo") {
                return res.status(403).json({
                    success: false,
                    message: "Tu cuenta no está activa"
                });
            }

            if (requireAdmin && user.rol !== "adminconstantinopla") {
                

                return res.status(403).json({
                    success: false,
                    message: "No tienes permisos de administrador"
                });
            }

            req.user = user;


            next();

        } catch (error) {

            console.error("ERROR EN AUTH:", error.message);

            if (
                error.name === "JsonWebTokenError" ||
                error.name === "TokenExpiredError" ||
                error.name === "NotBeforeError"
            ) {
                return res.status(401).json({
                    success: false,
                    message: "Token inválido o expirado"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Error interno de autenticación"
            });
        }
    };
};

