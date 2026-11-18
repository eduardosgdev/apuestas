
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// MIDDLEWARE: Verificar autenticación
export const authMiddleware = async (req, res, next) => {
    try {

        // Obtener token del encabezado
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No autorizado. Token no proporcionado"
            });
        }

        const token = authHeader.split(" ")[1];

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario en MongoDB
        const user = await userModel.findById(decoded.id)
            .select("-contraseña");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Comprobar estado de cuenta
        if (user.estadocuenta !== "activo") {
            return res.status(403).json({
                success: false,
                message: "Tu cuenta no está activa"
            });
        }

        // Guardar usuario en req
        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado"
        });
    }
};


// MIDDLEWARE: Verificar administrador
export const adminMiddleware = (req, res, next) => {

    if (!req.user || req.user.rol !== "admin") {
        return res.status(403).json({
            success: false,
            message: "No tienes permisos para realizar esta acción"
        });
    }

    next();
};
