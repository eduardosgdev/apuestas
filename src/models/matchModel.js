import mongoose from "mongoose";

const matchSchema = mongoose.Schema({
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
    estiloteam1:{type:String,
    enum:['posesion','bandas','bloquebajo','presion'],
    required:true
    },
    estiloteam2:{type:String,
        enum:['posesion','bandas','bloquebajo','presion'],
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