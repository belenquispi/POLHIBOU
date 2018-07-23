var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Conexion al servidor
mongoose.connect('mongodb://localhost:27017/polibou', { useNewUrlParser: true });

// Creacion del esquema
var profesorSchema = new Schema({
    usuario: String,
    nombre : String,
    contrasenia : String,
    materia : [{
        idMateria : String,
        nombre: String,
        preguntasOpcionMultiple : [{
            idOpcionMultiple : String,
            enunciado : String,
            imagenEnunciado : Buffer,
            res1: String,
            res2: String,
            res3: String,
            res4: String,
            imagenRes1 : Buffer,
            imagenRes2 : Buffer,
            imagenRes3 : Buffer,
            imagenRes4 : Buffer
        }],
        preguntasUnirVoltear : [{
            idPreguntasUnirVoltear : String,
            texto : String,
            imagen : Buffer
        }]
    }]
});
//Creacion del modelo

var Profesor = mongoose.model("Profesore", profesorSchema);

module.exports.Profesor = Profesor;