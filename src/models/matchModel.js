import mongoose from "mongoose";

const matchSchema = mongoose.Schema({

    competicion :{ type:String,
    enum:['Liga','Copa','Champions','Euro']},
    temporada:{type:String, required:true},
    team1:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'team',
        required:true,
        
    },
    team2:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'team',
        required:true,  
    },
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


    golesteam1: {
            type: Number,
            default: 0
        },
    golesteam2: {
            type: Number,
            default: 0
        },
    
    cornersteam1: {
            type: Number,
            default: 0
        },
    cornersteam2: {
            type: Number,
            default: 0
        }
    
    
});

const matchModel = mongoose.model('match', matchSchema);
export default matchModel;