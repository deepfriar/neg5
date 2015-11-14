var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = require("./team").schema;
var gameSchema = require("./game").schema;
var playerSchema = require("./player").schema;

var TournamentSchema = new Schema({
    director_email : String, // Foreign key
    name : String,
    location : String,
    date : {type : Date, default : Date.now},
    description : String,
    teams : [teamSchema],
    players : [playerSchema],
    games : [gameSchema]
});



module.exports = mongoose.model("Tournament", TournamentSchema);