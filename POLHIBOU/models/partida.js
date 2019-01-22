let mongoose = require('mongoose');
let Schema = mongoose.Schema;

//Conexion al servidor
mongoose.connect('mongodb://localhost:27017/polhibou', { useNewUrlParser: true });

// Creacion del esquema
var partidaSchema = new Schema({
    idPartida: String,
    jugadores: [
        {
            idSocket: String,
            nombre: String,
            iconoEquipo: String
        }
    ],
    turnoJugadores: Array
});
//Creacion del modelo
var Partida = mongoose.model("Partida", partidaSchema);
module.exports.Partida = Partida;
