import mongoose from "mongoose";
const matchPredictionSchema = mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match',
        required: true
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
    cornersTotales: {
        type: Number,
        min: 0
    }
}, { timestamps: true });

const matchPredictionModel = mongoose.model('matchprediction', matchPredictionSchema);
export  default matchPredictionModel;