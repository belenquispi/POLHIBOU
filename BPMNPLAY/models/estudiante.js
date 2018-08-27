var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Conexion al servidor
mongoose.connect('mongodb://localhost:27017/polibou', { useNewUrlParser: true });

// Creacion del esquema
var estudianteSchema = new Schema({
    usuario: String,
    nombre: String,
    contrasenia : String,
    intentos: [
        {
            idIntento: String,
            profesor: String,
            materia: String,
            tipoDesafio: String,
            dificultad: String,
            preguntas: [
                {
                    idPregunta: String,
                    correctoIncorrecto: String,
                    puntaje: String
                }
            ]

        }
        ]
});
//Creacion del modelo

var Estudiante = mongoose.model("Estudiante", estudianteSchema);

module.exports.Estudiante = Estudiante;
