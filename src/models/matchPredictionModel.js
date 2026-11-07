import mongoose from "mongoose";
const matchPredictionSchema = mongoose.Schema({
    
    team1:{ type:String, required:true},
    team2:{type:String, required:true},
    estiloofteam1:{type:String,
        enum:['juego_interior','juego_directo','juego_exterior','contraataque'],
        required:true
        },
        estilodefteam1:{ 
            type:String,
            enum:['presion_alta', 'bloque_medio', 'bloque_bajo'],
            required:true
    
        },
        estiloofteam2:{type:String,
            enum:['juego_interior','juego_directo','juego_exterior','contraataque'],
            required:true
            },
        
        estilodefteam2:{
            type:String,
            enum:['presion_alta', 'bloque_medio', 'bloque_bajo'],
            required:true
        },

    golesTeam1: {
        type: Number,
        min: 0
    },
    golesTeam2: {
        type: Number,
        min: 0
    },
    cornersTeam1: {
        type: Number,
        min: 0
    },
    cornersTeam2: {
        type: Number,
        min: 0
    },
   
}, { timestamps: true });

const matchPredictionModel = mongoose.model('matchprediction', matchPredictionSchema);
export  default matchPredictionModel;