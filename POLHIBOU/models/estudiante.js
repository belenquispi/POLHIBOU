var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Conexion al servidor
mongoose.connect('mongodb://localhost:27017/polhibou', { useNewUrlParser: true });

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
            puntaje: String,
            preguntas: [
                {
                    idPregunta: String,
                    enunciado : String,
                    imagenEnunciado: String,
					respuestaSeleccionada: String,
                    correctoIncorrecto: String,
                    res1: String,
                    res2: String,
                    res3: String,
                    res4: String,
                    imagenRes1 : String,
                    imagenRes2 : String,
                    imagenRes3 : String,
                    imagenRes4 : String,
                    dificultad: String,
                    respuestaCorrecta : String
                }
            ]
        }
        ]
});
//Creacion del modelo

var Estudiante = mongoose.model("Estudiante", estudianteSchema);

module.exports.Estudiante = Estudiante;
