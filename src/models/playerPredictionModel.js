import mongoose from "mongoose";
const playerPredictionSchema =  mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player',
        required: true
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match',
        required: true
    },
    goles: {
        type: Number,
        min: 0
    },
    tirosPuerta: {
        type: Number,
        min: 0
    },
    faltasCometidas: {
        type: Number,
        min: 0
    },
    faltasRecibidas: {
        type: Number,
        min: 0
    }
}, { timestamps: true });

const playerPredictionModel = mongoose.model('playerPrediction', playerPredictionSchema);
export default playerPredictionModel;