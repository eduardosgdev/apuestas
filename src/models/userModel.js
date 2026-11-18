import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    nombre: {type:String , required:true},
    apellidos:{type:String , required:true},
    edad : {type:String, required:true},
    telefono:{type:Number , unique:true, required:true},
    contraseña: {type:String, required:true},
    rol: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    estadocuenta: {
        type: String,
        enum: ['activo', 'suspendido', 'bloqueado'],
        default: 'bloqueado'
      },
    
    
    
});

const userModel = mongoose.model('users', userSchema);
export default userModel ;