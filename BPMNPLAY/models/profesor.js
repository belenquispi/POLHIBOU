var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Conexion al servidor
mongoose.connect('mongodb://localhost:27017/polibou', { useNewUrlParser: true });

// Creacion del esquema
var profesorSchema = new Schema({
    usuario: String,
    materias : [{
        idMateria : String,
        nombre: String,
        preguntasOpcionMultiple : [{
            idOpcionMultiple : String,
            enunciado : String,
            imagenEnunciado : String,
            res1: String,
            res2: String,
            res3: String,
            res4: String,
            imagenRes1 : String,
            imagenRes2 : String,
            imagenRes3 : String,
            imagenRes4 : String,
            respuestaCorrecta : String
        }],
        preguntasUnirVoltear : [{
            idUnirVoltear : String,
            texto : String,
            imagen : Buffer
        }]
    }]
});
//Creacion del modelo

var Profesor = mongoose.model("Profesore", profesorSchema);

module.exports.Profesor = Profesor;