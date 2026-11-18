
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";

// POST: Crear usuario
export const createUser = async (req, res) => {
    try {
        const {
            nombre,
            apellidos,
            edad,
            telefono,
            contraseña,
            repetircontraseña,
            rol,
            estadocuenta
        } = req.body;

        // Comprobar que las contraseñas coinciden
        if (contraseña !== repetircontraseña) {
            return res.status(400).json({
                success: false,
                message: "Las contraseñas no coinciden"
            });
        }

        // Comprobar si el teléfono ya existe
        const existeTelefono = await userModel.findOne({ telefono });

        if (existeTelefono) {
            return res.status(400).json({
                success: false,
                message: "Este teléfono ya está registrado"
            });
        }

        // Encriptar contraseña mediante bcrypt
        const passwordHash = await bcrypt.hash(contraseña, 10);

        // Crear usuario
        const newUser = new userModel({
            nombre,
            apellidos,
            edad,
            telefono,
            contraseña: passwordHash,
            rol,
            estadocuenta
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "Usuario creado correctamente",
            user: {
                _id: newUser._id,
                nombre: newUser.nombre,
                apellidos: newUser.apellidos,
                edad: newUser.edad,
                telefono: newUser.telefono,
                rol: newUser.rol,
                estadocuenta: newUser.estadocuenta
            }
        });

    } catch (error) {

        // Controlar duplicados de teléfono
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Este teléfono ya está registrado"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error al crear el usuario",
            error: error.message
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await userModel.find();

        res.status(200).json({
            success: true,
            total: users.length,
            users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los usuarios",
            error: error.message
        });
    }
};
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no válido"
            });
        }

        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el usuario",
            error: error.message
        });
    }
};
