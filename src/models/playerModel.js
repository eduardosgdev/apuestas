import mongoose from "mongoose";

const playerSchema = mongoose.Schema({
    equipo:{type: mongoose.Schema.Types.ObjectId,
    ref:'team',
    required:true},
    nombre:{type:String, required:true},
    posicion:{
        Type:String,
        enum:['delantero', 'medio','defensa'],
        required:true,  
    },
    goles:{type:Number, required:true},
    tirospuerta:{type:Number, required:true},
    faltasrecibidas:{type:Number,required:true},
    faltascometidas:{type:Number,required:true}
});

const playerModel = mongoose.model('player',playerSchema);
export default playerModel;