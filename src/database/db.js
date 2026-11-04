import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

export const dataBase = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName:'bet365'
        });
        console.log('Base de datos lista y conectada')
    } catch (error) {
        console.log('Error al conectar la base de datos')
    }
}