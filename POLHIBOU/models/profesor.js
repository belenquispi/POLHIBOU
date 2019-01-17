var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Conexion al servidor
mongoose.connect('mongodb://localhost:27017/polhibou', { useNewUrlParser: true });

// Creacion del esquema
var profesorSchema = new Schema({
    usuario: String,
    nombre : String,
    materias : [{
        idMateria : String,
        nombre: String,
        tipo: String,
        numOpcionMultiple : String,
        numUnirVoltear: String,
        preguntasOpcionMultiple : [{
            idPregunta : String,
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
            dificultad: String,
            respuestaCorrecta : String
        }],
        preguntasUnirVoltear : [{
            idPregunta : String,
            texto : String,
            imagen : String,
            dificultad: String
        }]
    }]
});
//Creacion del modelo
profesorSchema.virtual('numPreguntas').get(function () {
    var arrayNumPreguntas=[];
    arrayNumPreguntas.push(contarPreguntas())
});

var Profesor = mongoose.model("Profesore", profesorSchema);

module.exports.Profesor = Profesor;



function contarPreguntas (array, dificultad) {

    var numPreguntas = 0;
    for (var j = 0; j < array.length; j++) {
        if (array.dificultad == dificultad) {
            numPreguntas++;
        }
    }
    return numPreguntas;
}

function verificarNumeroPreguntas(array, num)
{
    console.log(array)
    var facil;
    var medio;
    var dificil;
    var boolResultado;

    facil = contarPreguntas(array, "Fácil");
    medio = contarPreguntas(array, "Medio");
    dificil = contarPreguntas(array, "Difícil");

    console.log("f"+ facil +" "+ medio + " "+dificil)

    boolResultado = facil < num || medio < num || dificil < num;
    return boolResultado;
}