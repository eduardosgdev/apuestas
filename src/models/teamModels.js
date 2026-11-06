import mongoose from "mongoose";

const teamSchema = mongoose.Schema({
    nombre: {type:String, required:true},
    escudo:{type:String},
    pais: {type:String, required:true},
    puntuacion:{type:Number, required:true},
    golesafavor:{type:Number,  required:true},
    golesencontra:{type:Number, required:true},
    cornerscreados:{type:Number, required:true},
    totalencuentros:{type:Number,required:true},
    encuentrosganados:{type:Number,required:true},
    encuentrosperdidos:{type:Number, required:true},
    encuentrosempatados:{type:Number, required:true},
});

const teamModel = mongoose.model('team', teamSchema);
export default teamModel;