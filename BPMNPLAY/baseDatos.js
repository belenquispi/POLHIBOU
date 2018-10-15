var Profesor = require("./models/profesor").Profesor;
var Estudiante = require("./models/estudiante").Estudiante;
var Usuario = require("./models/usuario").Usuario;

exports.obtenerPreguntasOpcionMultiple = function (usuarioP, materiaP) {
    var preguntasOpcionMultiple = [];
    Profesor.findOne({usuario : usuarioP}, function (error, doc) {
        if (error) {
            console.log("Error: " + error);
        }
        var indice = doc.materias.map(function (e) {
            return e.nombre
        }).indexOf(materiaP);
        for (var i = 0; i < doc.materias[indice].preguntasOpcionMultiple.length; i++) {
            preguntasOpcionMultiple.push(doc.materias[indice].preguntasOpcionMultiple[i]);
            preguntasOpcionMultiple[preguntasOpcionMultiple.length - 1].usada = false;
            console.log(preguntasOpcionMultiple[preguntasOpcionMultiple.length - 1].usada);
        }
        console.log(preguntasOpcionMultiple)
    });
        return preguntasOpcionMultiple;
};

exports.obtenerPreguntasUnir = function (usuarioP, materiaP) {
    var preguntasUnirVoltear = [];
    Profesor.findOne({usuario : usuarioP}, function (error, doc) {
        if (error) {
            console.log("Error: " + error);
        }
        var indice = doc.materias.map(function (e) {
            return e.nombre
        }).indexOf(materiaP);
        for (var i = 0; i < doc.materias[indice].preguntasUnirVoltear.length; i++) {
            preguntasUnirVoltear.push(doc.materias[indice].preguntasUnirVoltear[i]);
            preguntasUnirVoltear[preguntasUnirVoltear.length - 1].usada = false;
            console.log(preguntasUnirVoltear[preguntasUnirVoltear.length - 1].usada);
        }
        console.log(preguntasUnirVoltear)
    });
    return preguntasUnirVoltear;
};