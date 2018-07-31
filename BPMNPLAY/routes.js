var Profesor = require("./models/profesor").Profesor;
var Estudiante = require("./models/estudiante").Estudiante;
var Usuario = require("./models/usuario").Usuario;


exports.get_inicio = function (req, res) {
    res.render('paginas/index');
};
exports.get_inicio_sesion = function (req, res) {
    res.render('paginas/inicioSesion');
};
exports.post_inicio_sesion = function (req, res) {

    Usuario.findOne({usuario: req.body.usuario}, function (error, doc) {

        req.session.nombre = doc.nombre;
        req.session.usuario = doc.usuario;
        if(doc.rol == "profesor") {
            res.redirect('/ingresoProfesor');
        } else
        {
            if(doc.rol == "estudiante") {
                res.redirect('/ingresoEstudiante');
            }
        }
    })
};
exports.get_ingreso_profesor = function (req, res) {
    if (req.session.nombre) {
        Profesor.findOne({usuario : req.session.usuario}, function (error, doc) {
            var materias = [];
            for(var i = 0 ; i < doc.materias.length; i++)
            {
                materias.push(doc.materias[i].nombre);

            }
            res.render('paginas/inicioProfesor', {nombre: req.session.nombre, usuario: req.session.usuario, materias: materias});

        });

    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.get_ingreso_estudiante = function (req, res) {

    if (req.session.nombre) {
        res.render('paginas/inicioEstudiante', {nombre: req.session.nombre});
    }
    else {
        res.redirect('/inicioSesion');
    }
};

exports.post_creacion_cuenta = function (req, res) {

    var usuario = new Usuario ({
        nombre: req.body.nombre,
        usuario: req.body.usuario,
        contrasenia: req.body.contrasenia,
        rol : req.body.rol,
        contrasenia_confirmada : req.body.contrasenia_confirmada
    })

        usuario.save( function (err) {
            
        });

    if (req.body.rol == "profesor") {

        var profesor = new Profesor({
            usuario: req.body.usuario,
        })

        profesor.save(function (error) {
            
        });
    } else {
        if (req.body.rol == "estudiante") {

            var estudiante = new Estudiante({
                usuario: req.body.usuario,
            })

            estudiante.save(function (error) {
                
            });
        }
    }
    res.redirect('/inicioSesion');
};

exports.post_ingreso_materia = function (req, res) {

    Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
        var materia = {
            nombre: req.body.nombreMateria
        }
        doc.materias.push(materia);

        doc.save(function (err, docActualizado) {
            if (err) return console.log(err);
            res.redirect('/ingresoProfesor');

        })
    });

};

exports.get_preguntas_opcion = function (req, res) {
    if (req.session.nombre && req.params.materia) {
        Profesor.findOne({usuario : req.session.usuario}, function (error, doc) {
            if(error)
            {console.log("Error: "+error);            }
            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.params.materia);
            var idPreguntas = [];
            var enunciadoPreguntas = [];
            for(var i = 0; i < doc.materias[indice].preguntasOpcionMultiple.length; i++)
            {
                idPreguntas.push(doc.materias[indice].preguntasOpcionMultiple[i].idOpcionMultiple);
                enunciadoPreguntas.push(doc.materias[indice].preguntasOpcionMultiple[i].enunciado);
            }
            res.render('paginas/listaPreguntaOpcionMultiple', {nombre: req.session.nombre, materia: req.params.materia, idPreguntas: idPreguntas, enunciadoPreguntas: enunciadoPreguntas });


        });

    }
    else {
        res.redirect('/inicioSesion');
    }

};

exports.get_eliminar_pregunta_opcion = function(req,res){
    if (req.session.usuario && req.params.idMateria) {
        console.log(req.params)
        var str = req.params.idMateria;
        var resp = str.split("&");
        console.log(resp);
        var materia = resp[0];
        var idPregunta = resp[1];
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {

            if(error)
            {
                console.log("Error: "+error)
            }

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(materia);

            if(indice >=0){
                var indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
                    return e.idOpcionMultiple
                }).indexOf(idPregunta);
                if(indicePregunta >=0){
                    doc.materias[indice].preguntasOpcionMultiple.splice(indicePregunta,1);
                    doc.save(function (err, docActualizado) {
                        if (err) return console.log(err);
                        res.redirect('/preguntasOpcionMultiple/'+materia);
                });
                }
            }

        });
    }

}

exports.post_preguntas_opcion = function (req, res) {
    console.log(req.body);
 Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {

     if(error)
     {
         console.log("Error: "+error)
     }

     var indice = doc.materias.map(function (e) {
         return e.nombre
     }).indexOf(req.body.materia);
     var preguntaOpcionMultiple = {
         enunciado : req.body.enunciado,
         respuestaCorrecta :  req.body.respuestaCorrecta,
         idOpcionMultiple: generarNombre()
     }

     if(req.body.imagenEnunciado != ""){
         preguntaOpcionMultiple.imagenEnunciado = req.body.imagenEnunciado
     }

     if(req.body.res1 &&(req.body.res1 != "" || req.body.res1 != undefined)){
         console.log("Solo texto:"+req.body.res1)
         console.log(req.body)
         preguntaOpcionMultiple.res1 = req.body.res1;
         preguntaOpcionMultiple.res2 = req.body.res2;
         preguntaOpcionMultiple.res3 = req.body.res3;
         preguntaOpcionMultiple.res4 = req.body.res4;
     }else {
         console.log("Solo imagenes")

         preguntaOpcionMultiple.imagenRes1 = req.body.imagenRes1;
         preguntaOpcionMultiple.imagenRes2 = req.body.imagenRes2;
         preguntaOpcionMultiple.imagenRes3 = req.body.imagenRes3;
         preguntaOpcionMultiple.imagenRes4 = req.body.imagenRes4;
     }

     if(indice >=0){
         var indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
             return e.idOpcionMultiple
         }).indexOf(req.body.idOpcionMultiple);
         console.log("eliminar: "+indicePregunta)
         if(indicePregunta >=0) {
             console.log("ERERER: " + doc.materias[indice].preguntasOpcionMultiple.length)
             doc.materias[indice].preguntasOpcionMultiple.splice(indicePregunta, 1);
             console.log("ERERER: " + doc.materias[indice].preguntasOpcionMultiple.length)
         }
             doc.materias[indice].preguntasOpcionMultiple.push(preguntaOpcionMultiple);
             console.log("ERERER: " + doc.materias[indice].preguntasOpcionMultiple.length)

             doc.save(function (err, docActualizado) {
                 if (err) return console.log(err);
                 res.redirect('/preguntasOpcionMultiple/' + req.body.materia);

             })

     }
    });

};

exports.post_detalle_opcion_multiple = function(req, res){

    Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {

        if(error)
        {
            console.log("Error: "+error)
        }

        var indice = doc.materias.map(function (e) {
            return e.nombre
        }).indexOf(req.body.materia);

        var indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
            return e.idOpcionMultiple
        }).indexOf(req.body.idPregunta )


        if(indicePregunta >= 0) {
            var preguntaOpcionMultiple = {
                enunciado: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].enunciado,
                imagenEnunciado: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenEnunciado,
                idOpcionMultiple: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].idOpcionMultiple,
                res1: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].res1,
                res2: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].res2,
                res3: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].res3,
                res4: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].res4,
                imagenRes1: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenRes1,
                imagenRes2: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenRes2,
                imagenRes3: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenRes3,
                imagenRes4: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenRes4,
                respuestaCorrecta: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].respuestaCorrecta
            }
            console.log("pregunta Oppppp");
            console.log(preguntaOpcionMultiple);
            res.render('paginas/detalleOpcionMultiple', {nombre: req.session.nombre, materia: req.body.materia, preguntaOpcionMultiple : preguntaOpcionMultiple });

        }
    });


}

exports.get_creacion_partida = function (req, res) {
    if(req.session.usuario){
        res.render('paginas/creacionPartida');
    }else {
        res.redirect('/inicioSesion');
    }
};

exports.get_tablero = function (req, res) {
    if(req.session.usuario){
        res.render('paginas/tablero');
    }else {
        res.redirect('/inicioSesion');
    }
};

exports.get_opcion_multiple = function (req, res) {
    if(req.session.usuario){
        res.render('paginas/preguntasOpcionMultiple', {nombre: req.session.nombre, materia: req.params.materia});
    }else {
        res.redirect('/inicioSesion');
    }
};

exports.get_unir_voltear = function (req, res) {
   if(req.session.usuario){
        res.render('paginas/preguntasUnirVoltear', {nombre: req.session.nombre, materia: req.params.materia});
    }else {
        res.redirect('/inicioSesion');
    }
};

exports.get_ingreso_partida = function (req, res) {
  res.render('paginas/ingresoPartidas');
};

exports.get_preguntas_unir_voltear = function (req, res) {
    if (req.session.nombre && req.params.materia) {
        Profesor.findOne({usuario : req.session.usuario}, function (error, doc) {
            if(error)
            {
                console.log("Error: "+error)
            }

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.params.materia);
            var idPreguntas = [];
            var textoPreguntas = [];
            var imagenPreguntas = [];
            for(var i = 0; i < doc.materias[indice].preguntasUnirVoltear.length; i++)
            {
                idPreguntas.push(doc.materias[indice].preguntasUnirVoltear[i].idUnirVoltear);
                textoPreguntas.push(doc.materias[indice].preguntasUnirVoltear[i].texto);
                imagenPreguntas.push(doc.materias[indice].preguntasUnirVoltear[i].imagen);
            }
            res.render('paginas/listaPreguntasUnirVoltear', {nombre: req.session.nombre, materia: req.params.materia, idPreguntas: idPreguntas, textoPreguntas: textoPreguntas, imagenPreguntas: imagenPreguntas });
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
}

exports.post_agregar_unir_voltear = function(req, res){
    if (req.session.nombre) {
        console.log(req.body)
        Profesor.findOne({usuario : req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            var preguntaUnir = {
                idUnirVoltear: generarNombre(),
                texto: req.body.nombreImagen,
                imagen: req.body.imagenUnir
            }

            if (indice >= 0) {
                doc.materias[indice].preguntasUnirVoltear.push(preguntaUnir);
                console.log("ERERER: " + doc.materias[indice].preguntasUnirVoltear.length)

                doc.save(function (err, docActualizado) {
                    if (err) return console.log(err);

                    res.redirect('/preguntasUnirVoltear/'+req.body.materia);
                });
            }
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
}

exports.post_eliminar_unir_voltear = function(req,res){
    if (req.session.usuario && req.body.materia) {

        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            if(error)
            {
                console.log("Error: "+error)
            }
            console.log(doc)

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            if(indice >=0){
                var indicePregunta = doc.materias[indice].preguntasUnirVoltear.map(function (e) {
                    return e.idUnirVoltear
                }).indexOf(req.body.idPregunta);
                if(indicePregunta >=0){
                    doc.materias[indice].preguntasUnirVoltear.splice(indicePregunta,1);
                    doc.save(function (err, docActualizado) {
                        if (err) return console.log(err);
                        res.redirect('/preguntasUnirVoltear/'+req.body.materia);
                    });
                }
            }

        });
    }

}

exports.post_agregar_varias_unir_voltear = function(req, res){
    if (req.session.nombre) {
        console.log(req.body)
      /*Profesor.findOne({usuario : req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            var preguntaUnir = {
                idUnirVoltear: generarNombre(),
                texto: req.body.nombreImagen,
                imagen: req.body.imagenUnir
            }

            if (indice >= 0) {
                doc.materias[indice].preguntasUnirVoltear.push(preguntaUnir);
                console.log("ERERER: " + doc.materias[indice].preguntasUnirVoltear.length)

                doc.save(function (err, docActualizado) {
                    if (err) return console.log(err);

                    res.redirect('/preguntasUnirVoltear/'+req.body.materia);
                });
            }
        });*/
    }
    else {
        res.redirect('/inicioSesion');
    }
}

exports.salir = function (req, res) {
    req.session.usuario = null;
    res.redirect('/');
};

function generarNombre() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}