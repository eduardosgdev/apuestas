import mongoose from "mongoose";

const playerstatsSchema = mongoose.Schema({
    player: {type:mongoose.Schema.Types.ObjectId,
    ref : 'player',
    required:true,
    },
    match: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'match',
        required:true
    },
    goles:{type:Number, required:true, default:0},
    asistencias:{type:Number, required:true},
    tirospuerta:{type:Number, required:true},
    faltascometidaspartido:{type:Number, required:true},
    faltasrecibidaspartido:{type:Number, required:true}
});
playerstatsSchema.index(
    { player: 1, match: 1 },
    { unique: true }
);
const playerStatsModel = mongoose.model('playerstats',playerstatsSchema);
export default playerStatsModel;