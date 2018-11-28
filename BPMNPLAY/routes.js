var Profesor = require("./models/profesor").Profesor;
var Estudiante = require("./models/estudiante").Estudiante;
var Usuario = require("./models/usuario").Usuario;
var Partida = require("./models/partida").Partida;
var correo = require("./correo");

exports.get_inicio = function (req, res) {
    if (req.session.usuario) {
        if (req.session.usuario == "polhibou@gmail.com") {
            res.redirect('/ingresoAdministrador');
        } else {
            res.redirect('/ingresoFacilitador');
        }
    }
    else {
        res.render('paginas/index');
    }
};
exports.get_inicio_sesion = function (req, res) {
    var usuario = "";
    res.render('paginas/inicioSesion', {usuario: usuario, tipo: 0});
};
exports.post_inicio_sesion = function (req, res) {
    if (req.body.usuario == 'administrador') {
        req.body.usuario = 'polhibou@gmail.com';
    }
    Usuario.findOne({usuario: req.body.usuario}, function (error, doc) {
        if (error) {
            console.log("Error: " + error);
        }
        let now = new Date();
        if (doc != null) {
            if (doc.codigoVerificacion == 0) {
                if (doc.contraseniaTemporal == 0) {
                    if (req.body.contrasenia != doc.contrasenia) {
                        res.render('paginas/inicioSesion', {usuario: doc.usuario, tipo: 0});
                    } else {
                        req.session.nombre = doc.nombre;
                        req.session.usuario = doc.usuario;
                        doc.fechaUltimaConexion = now;
                        doc.save(function (err, docActualizado) {
                            if (err) return console.log(err);
                            if (req.session.nombre == "administrador") {
                                req.session.rol = "administrador";
                                res.redirect('/ingresoAdministrador');
                            } else {
                                req.session.rol = "facilitador";
                                res.redirect('/ingresoFacilitador');
                            }
                        })
                    }
                } else {
                    if (req.body.contrasenia == doc.contraseniaTemporal) {
                        res.render('paginas/nuevaContrasenia', {nombre: doc.nombre, usuario: req.body.usuario, sesionIniciada: 0, contraseniaAnterior: 0});
                    } else {
                        res.redirect('/inicioSesion');
                    }
                }
            }
            else {
                correo.enviarCorreo(doc.usuario, doc.codigoVerificacion);
                res.render('paginas/validacionCuenta', {
                    usuario: doc.usuario,
                    verificacionCorrecta: true
                });
            }
        }
        else {
            res.render('paginas/inicioSesion', {usuario: req.body.usuario, tipo: 0});
        }
    })
};
exports.get_cambiar_contrasenia = function (req, res) {

    if(req.session.nombre != "")
    {
        res.render('paginas/nuevaContrasenia', {nombre: req.session.nombre, usuario: req.session.usuario, sesionIniciada : 1, contraseniaAnterior: 0});
    }
    else {
        res.redirect('/inicioSesion');
    }
};

exports.get_ingreso_profesor = function (req, res) {
    if (req.session.nombre) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            var materias = [];
            for (var i = 0; i < doc.materias.length; i++) {
                var boolOpcion = verificarNumeroPreguntas(doc.materias[i].preguntasOpcionMultiple, 5);
                var boolUnir = verificarNumeroPreguntas(doc.materias[i].preguntasUnirVoltear, 8);
                var materia = {
                    nombre: doc.materias[i].nombre,
                    tipo: doc.materias[i].tipo,
                    numOpcionMultiple: doc.materias[i].preguntasOpcionMultiple.length,
                    numUnirVoltear: doc.materias[i].preguntasUnirVoltear.length,
                    boolOpcion: boolOpcion,
                    boolUnir: boolUnir

                };
                materias.push(materia);

            }
            req.session.rol = "facilitador";
            console.log("Holaaaaa: " + req.session.rol);
            res.render('paginas/facilitador/inicioProfesor', {
                nombre: req.session.nombre,
                usuario: req.session.usuario,
                materias: materias

            });

        });

    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.get_ingreso_estudiante = function (req, res) {
    if (req.session.nombre) {
        Profesor.find({}, function (error, doc) {
            var materias = [];
            doc.forEach(function (facilitador) {
                for (var i = 0; i < facilitador.materias.length; i++) {
                    var materia = {
                        facilitador: '',
                        nombre: ''
                    };
                    var boolOpcion = verificarNumeroPreguntas(facilitador.materias[i].preguntasOpcionMultiple, 5);
                    var boolUnir = verificarNumeroPreguntas(facilitador.materias[i].preguntasUnirVoltear, 8);
                    if (facilitador.materias[i].tipo == "publica" && !boolOpcion && !boolUnir) {
                        materia.facilitador = facilitador.nombre;
                        materia.nombre = facilitador.materias[i].nombre;
                        materias.push(materia);
                    }
                }
            });
            req.session.rol = "participante";
            res.render('paginas/participante/inicioEstudiante', {nombre: req.session.nombre, materias: materias});
        })
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.post_creacion_cuenta = function (req, res) {
    Usuario.findOne({usuario: req.body.usuario}, function (error, doc) {
        if (error) {
            console.log("Error en la busqueda del usuario: " + error);
        }
        else {
            if (doc != null) {
                res.render('paginas/error', {
                    mensaje: "El usuario ya se encuentra registrado",
                    direccion: "/inicioSesion"
                });
            } else {
                let usuario = new Usuario({
                    nombre: req.body.nombre,
                    usuario: req.body.usuario,
                    contrasenia: req.body.contrasenia,
                    contraseniaTemporal: 0,
                    codigoVerificacion: generarNombre(),
                    fechaUltimaConexion: ""
                });
                req.session.usuarioTemporal = req.body.usuario;
                usuario.save(function (err) {
                    if (err) {
                        console.log("Error al crear: " + err)
                        res.render('paginas/error', {mensaje: err, direccion: "/"});
                    }
                    else {
                        correo.enviarCorreo(req.body.usuario, usuario.codigoVerificacion);
                        var profesor = new Profesor({
                            usuario: req.body.usuario,
                            nombre: req.body.nombre
                        });
                        profesor.save(function (error) {
                            if (error) {
                                console.log("Error al crear facilitador: " + error)
                            }
                        });
                        var estudiante = new Estudiante({
                            usuario: req.body.usuario,
                            nombre: req.body.nombre
                        });
                        estudiante.save(function (error) {
                            if (error) {
                                console.log("Error al crear participante: " + error)
                            }
                        });
                        res.redirect('/validarCuenta');
                    }
                });
            }
        }
    });

};
exports.post_ingreso_materia = function (req, res) {
    Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
        var materia = {
            nombre: req.body.nombreMateria,
            tipo: req.body.tipo
        };
        doc.materias.push(materia);
        doc.save(function (err, docActualizado) {
            if (err) return console.log(err);
            res.redirect('/ingresoFacilitador');
        })
    });
};
exports.get_preguntas_opcion = function (req, res) {
    if (req.session.nombre && req.params.materia) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error);
            }
            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.params.materia);
            var idPreguntas = [];
            var enunciadoPreguntas = [];
            var dificultadPreguntas = [];
            for (var i = 0; i < doc.materias[indice].preguntasOpcionMultiple.length; i++) {
                idPreguntas.push(doc.materias[indice].preguntasOpcionMultiple[i].idPregunta);
                enunciadoPreguntas.push(doc.materias[indice].preguntasOpcionMultiple[i].enunciado);
                dificultadPreguntas.push(doc.materias[indice].preguntasOpcionMultiple[i].dificultad);
            }
            res.render('paginas/facilitador/listaPreguntaOpcionMultiple', {
                nombre: req.session.nombre,
                materia: req.params.materia,
                idPreguntas: idPreguntas,
                enunciadoPreguntas: enunciadoPreguntas,
                dificultades: dificultadPreguntas
            });


        });

    }
    else {
        res.redirect('/inicioSesion');
    }

};
exports.get_eliminar_pregunta_opcion = function (req, res) {
    if (req.session.usuario && req.params.idMateria) {
        var str = req.params.idMateria;
        var resp = str.split("&");
        var materia = resp[0];
        var idPregunta = resp[1];
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {

            if (error) {
                console.log("Error: " + error)
            }

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(materia);

            if (indice >= 0) {
                var indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
                    return e.idPregunta
                }).indexOf(idPregunta);
                if (indicePregunta >= 0) {
                    doc.materias[indice].preguntasOpcionMultiple.splice(indicePregunta, 1);
                    doc.save(function (err, docActualizado) {
                        if (err) return console.log(err);
                        res.redirect('/ingresoFacilitador/preguntasOpcionMultiple/' + materia);
                    });
                }
            }

        });
    }

};
exports.post_preguntas_opcion = function (req, res) {
    Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {

        if (error) {
            console.log("Error: " + error)
        }

        var indice = doc.materias.map(function (e) {
            return e.nombre
        }).indexOf(req.body.materia);
        var preguntaOpcionMultiple = {
            enunciado: req.body.enunciado,
            respuestaCorrecta: req.body.respuestaCorrecta,
            dificultad: req.body.dificultad,
            idPregunta: generarNombre()
        };

        if (req.body.imagenEnunciado != "") {
            preguntaOpcionMultiple.imagenEnunciado = req.body.imagenEnunciado
        }

        if (req.body.res1 && (req.body.res1 != "" || req.body.res1 != undefined)) {
            preguntaOpcionMultiple.res1 = req.body.res1;
            preguntaOpcionMultiple.res2 = req.body.res2;
            preguntaOpcionMultiple.res3 = req.body.res3;
            preguntaOpcionMultiple.res4 = req.body.res4;
        } else {

            preguntaOpcionMultiple.imagenRes1 = req.body.imagenRes1;
            preguntaOpcionMultiple.imagenRes2 = req.body.imagenRes2;
            preguntaOpcionMultiple.imagenRes3 = req.body.imagenRes3;
            preguntaOpcionMultiple.imagenRes4 = req.body.imagenRes4;
        }

        if (indice >= 0) {
            var indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
                return e.idPregunta
            }).indexOf(req.body.idOpcionMultiple);
            if (indicePregunta >= 0) {
                doc.materias[indice].preguntasOpcionMultiple.splice(indicePregunta, 1);
            }
            doc.materias[indice].preguntasOpcionMultiple.push(preguntaOpcionMultiple);

            doc.save(function (err, docActualizado) {
                if (err) return console.log(err);
                res.redirect('/ingresoFacilitador/preguntasOpcionMultiple/' + req.body.materia);

            })

        }
    });

};
exports.post_detalle_opcion_multiple = function (req, res) {

    Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
        if (error) {
            console.log("Error: " + error)
        }

        var indice = doc.materias.map(function (e) {
            return e.nombre
        }).indexOf(req.body.materia);

        var indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
            return e.idPregunta
        }).indexOf(req.body.idPregunta);

        console.log("idpregunta")
        console.log(indicePregunta)
        console.log(req.body.idPregunta)
        if (indicePregunta >= 0) {
            var preguntaOpcionMultiple = {
                enunciado: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].enunciado,
                imagenEnunciado: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenEnunciado,
                idOpcionMultiple: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].idPregunta,
                res1: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].res1,
                res2: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].res2,
                res3: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].res3,
                res4: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].res4,
                imagenRes1: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenRes1,
                imagenRes2: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenRes2,
                imagenRes3: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenRes3,
                imagenRes4: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].imagenRes4,
                dificultad: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].dificultad,
                respuestaCorrecta: doc.materias[indice].preguntasOpcionMultiple[indicePregunta].respuestaCorrecta
            };
            res.render('paginas/facilitador/detalleOpcionMultiple', {
                nombre: req.session.nombre,
                materia: req.body.materia,
                preguntaOpcionMultiple: preguntaOpcionMultiple
            });

        }
    });
};
exports.get_creacion_partida = function (req, res) {
    if (req.session.usuario && req.params.materia) {
        if (req.session.rol == "facilitador") {
            res.render('paginas/facilitador/creacionPartida', {
                nombre: req.session.nombre,
                materia: req.params.materia
            });
        } else {
            if (req.session.rol == "partipante") {
                res.redirect('/inicioEstudiante');
            }
            else {
                res.redirect('/inicioSesion');
            }
        }
    } else {
        res.redirect('/inicioSesion');
    }
};
exports.post_tablero = function (req, res) {
    if (req.session.rol == "facilitador") {
        res.render('paginas/participante/tablero', {
            idPartida: req.body.idPartida,
            rol: req.body.rol,
            nombreEquipo: req.body.nombreEquipo,
            nombre: req.session.nombre
        });
    }
    else {
        res.render('paginas/participante/tablero', {
            idPartida: req.body.idPartida,
            rol: req.body.rol,
            nombreEquipo: req.body.nombreEquipo,
            nombre: req.body.nombreEquipo
        });
    }
};
exports.get_opcion_multiple = function (req, res) {
    if (req.session.usuario) {
        res.render('paginas/facilitador/preguntasOpcionMultiple', {
            nombre: req.session.nombre,
            materia: req.params.materia
        });
    } else {
        res.redirect('/inicioSesion');
    }
};
exports.get_unir_voltear = function (req, res) {
    if (req.session.usuario) {
        res.render('paginas/facilitador/preguntasUnirVoltear', {
            nombre: req.session.nombre,
            materia: req.params.materia
        });
    } else {
        res.redirect('/inicioSesion');
    }
};
exports.get_ingreso_partida = function (req, res) {
    var nombre = ((req.session.nombre == null) ? "Participante" : req.session.nombre);
    res.render('paginas/participante/ingresoPartidas',
        {
            nombre: nombre
        });
};
exports.get_preguntas_unir_voltear = function (req, res) {
    if (req.session.nombre && req.params.materia) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.params.materia);
            var idPreguntas = [];
            var textoPreguntas = [];
            var imagenPreguntas = [];
            var dificultades = [];
            for (var i = 0; i < doc.materias[indice].preguntasUnirVoltear.length; i++) {
                idPreguntas.push(doc.materias[indice].preguntasUnirVoltear[i].idPregunta);
                textoPreguntas.push(doc.materias[indice].preguntasUnirVoltear[i].texto);
                imagenPreguntas.push(doc.materias[indice].preguntasUnirVoltear[i].imagen);
                dificultades.push(doc.materias[indice].preguntasUnirVoltear[i].dificultad);
            }
            res.render('paginas/facilitador/listaPreguntasUnirVoltear', {
                nombre: req.session.nombre,
                materia: req.params.materia,
                idPreguntas: idPreguntas,
                textoPreguntas: textoPreguntas,
                imagenPreguntas: imagenPreguntas,
                dificultades: dificultades
            });
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.post_agregar_unir_voltear = function (req, res) {
    if (req.session.nombre) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            var preguntaUnir = {
                idPregunta: generarNombre(),
                texto: req.body.nombreImagen,
                imagen: req.body.imagenUnir,
                dificultad: req.body.dificultad
            }

            if (indice >= 0) {
                doc.materias[indice].preguntasUnirVoltear.push(preguntaUnir);
                doc.save(function (err, docActualizado) {
                    if (err) return console.log(err);

                    res.redirect('ingresoFacilitador/preguntasUnirVoltear/' + req.body.materia);
                });
            }
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.post_eliminar_unir_voltear = function (req, res) {
    if (req.session.usuario && req.body.materia) {

        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }
            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            if (indice >= 0) {
                var indicePregunta = doc.materias[indice].preguntasUnirVoltear.map(function (e) {
                    return e.idPregunta
                }).indexOf(req.body.idPregunta);
                if (indicePregunta >= 0) {
                    doc.materias[indice].preguntasUnirVoltear.splice(indicePregunta, 1);
                    doc.save(function (err, docActualizado) {
                        if (err) return console.log(err);
                        res.redirect('/ingresoFacilitador/preguntasUnirVoltear/' + req.body.materia);
                    });
                }
            }

        });
    }

};
exports.post_agregar_varias_unir_voltear = function (req, res) {
    if (req.session.nombre) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }

            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            var numeroPreguntas = req.body.numeroPreguntas;

            for (var i = 1; i <= numeroPreguntas; i++) {
                var preguntaU = [];
                preguntaU.push("imagen" + i);
                preguntaU.push("textoUnir" + i);
                preguntaU.push("dificultad" + i)

                var preguntaUnir = {
                    idPregunta: generarNombre(),
                    imagen: req.body[preguntaU[0]],
                    texto: req.body[preguntaU[1]],
                    dificultad: req.body[preguntaU[2]]
                }

                if (indice >= 0) {
                    doc.materias[indice].preguntasUnirVoltear.push(preguntaUnir);

                    doc.save(function (err, docActualizado) {
                        if (err) return console.log(err);
                    });
                }
            }
            res.redirect('/ingresoFacilitador/preguntasUnirVoltear/' + req.body.materia);

        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.post_lobby = function (req, res) {
    console.log("idPArtida: " + req.session.idPartida);
    if (req.session.usuario) {
        if (req.session.rol == "facilitador") {
            var numeroEquipos = req.body.numeroEquipos;
            if (req.body.idPartida) {
                res.render('paginas/facilitador/lobby', {
                    nombre: req.session.nombre,
                    materia: req.body.materia,
                    idPartida: req.body.idPartida
                });
            } else {
                var idPartida = req.body.materia + Math.floor((1 + Math.random()) * 0x1000).toString(5).substring(1);
                req.session.idPartida = idPartida;
                var informacionJugadores = [];
                for (var i = 1; i <= numeroEquipos; i++) {
                    var equipoU = [];
                    equipoU.push("nombreEquipo" + i);
                    equipoU.push("imagenEquipo" + i);

                    var nuevoEquipo = {
                        nombreEquipo: req.body[equipoU[0]],
                        imagenEquipo: req.body[equipoU[1]]
                    };
                    console.log("nuevoEquipo");
                    informacionJugadores.push(nuevoEquipo);
                }
                res.render('paginas/facilitador/lobby', {
                    nombre: req.session.nombre,
                    rol: req.session.rol,
                    usuario: req.session.usuario,
                    materia: req.body.materia,
                    idPartida: idPartida,
                    numeroEquipos: numeroEquipos,
                    informacionJugadores: informacionJugadores
                });
            }

        } else {
            res.redirect("/");
        }

    } else {
        res.redirect('/inicioSesion');

    }
};
exports.post_lobby_pariticipante = function (req, res) {
    if (req.body.tipoIngreso == "participante" || req.body.tipoIngreso == "espectador") {
        var nombre = ((req.session.nombre == null) ? "Participante" : req.session.nombre);
        var nombreEquipo = ((req.body.nombreEquipo == "ninguno") ? "Espectador" : req.body.nombreEquipo);
        res.render('paginas/participante/lobbyParticipante', {
            nombreEquipo: nombreEquipo,
            codigoPartida: req.body.codigoPartida,
            tipoIngreso: req.body.tipoIngreso,
            nombre: nombre
        });
    } else {
        res.render('paginas/error', {mensaje: "Estas accediendo a un lugar donde no tienes acceso", direccion: "/"});
    }

};
exports.post_cambiar_tipo_materia = function (req, res) {
    if (req.session.usuario && req.body.materia) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }
            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            if (indice >= 0) {
                if (doc.materias[indice].tipo == "publica") {
                    doc.materias[indice].tipo = "privada";
                }
                else if (doc.materias[indice].tipo == "privada") {
                    doc.materias[indice].tipo = "publica";
                }
                doc.save(function (err, docActualizado) {
                    if (err) return console.log(err);
                    res.redirect('/ingresoFacilitador');
                });
            }
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.post_eliminar_materia = function (req, res) {
    if (req.session.usuario && req.body.materia) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }
            var indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            if (indice >= 0) {
                doc.materias.splice(indice, 1);
                doc.save(function (err, docActualizado) {
                    if (err) return console.log(err);
                    res.redirect('/ingresoFacilitador');
                });
            }
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.get_validar_cuenta = function (req, res) {
    if (req.session.usuarioTemporal != "") {
        res.render('paginas/validacionCuenta', {
            usuario: req.session.usuarioTemporal,
            verificacionCorrecta: true
        });
    }
    else {
        res.redirect('/')
    }
};
exports.post_confirmar_cuenta = function (req, res) {
    if (req.session.usuarioTemporal != "") {
        Usuario.findOne({usuario: req.body.usuario}, function (error, doc) {
            if (error) {
                console.log("Error: " + error);
            }
            if (doc != null) {
                if (req.body.codigoVerificacion == doc.codigoVerificacion) {
                    doc.codigoVerificacion = 0;
                    doc.save(function (err, docActualizado) {
                        if (err) return console.log(err);
                        res.render('paginas/inicioSesion', {});
                    });

                } else {
                    res.render('paginas/validacionCuenta', {
                        usuario: req.session.usuarioTemporal,
                        verificacionCorrecta: false
                    })
                }
            }
            else {
                res.redirect('/');
            }
        })
    }
    else {
        res.redirect('/')
    }
};
exports.post_retos_materia = function (req, res) {
    var opcionMultiple = [];
    var emparejar = [];
    var unirVoltear = [];
    var intentosMateria = [];
    if (req.session.usuario && req.body.materia) {
        Estudiante.findOne({
            usuario: req.session.usuario
        }, function (error, doc) {
            for (var i = 0; i < doc.intentos.length; i++) {
                if (doc.intentos[i].materia == req.body.materia && doc.intentos[i].profesor == req.body.facilitador) {
                    intentosMateria.push(doc.intentos[i])
                }
            }
            opcionMultiple = obtenerPuntaje(intentosMateria, "opcionMultiple");
            emparejar = obtenerPuntaje(intentosMateria, "emparejar");
            unirVoltear = obtenerPuntaje(intentosMateria, "unir");
            res.render('paginas/participante/retosEstudiante', {
                nombre: req.session.nombre,
                facilitador: req.body.facilitador,
                materia: req.body.materia,
                opcionMutiple: opcionMultiple,
                emparejar: emparejar,
                unirVoltear: unirVoltear
            })
        });
    }
    else {
        res.redirect('/')
    }
};
var preguntas = [];
exports.post_mostrar_opcion = function (req, res) {
    var contadorPreguntas = req.body.contadorPreguntas;
    contadorPreguntas++;
    if (req.session.usuario && req.body.materia && (req.session.rol == "participante")) {
        var indices = [];
        if (contadorPreguntas == 0) {
            preguntas = [];
            Profesor.findOne({nombre: req.body.facilitador}, function (error, doc) {
                if (error) {
                    console.log("Error: " + error)
                }
                var indiceMateria = doc.materias.map(function (e) {
                    return e.nombre
                }).indexOf(req.body.materia);

                for (var i = 0; i < 5; i++) {
                    var indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasOpcionMultiple.length);
                    while (indices.indexOf(indice) >= 0 || doc.materias[indiceMateria].preguntasOpcionMultiple[indice].dificultad != req.body.dificultad) {
                        indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasOpcionMultiple.length);
                    }
                    indices.push(indice);
                    preguntas.push(doc.materias[indiceMateria].preguntasOpcionMultiple[indice])
                }
                var intento =
                    {
                        idIntento: generarNombre(),
                        profesor: req.body.facilitador,
                        materia: req.body.materia,
                        tipoDesafio: 'opcionMultiple',
                        dificultad: req.body.dificultad,
                        puntaje: '0',
                        preguntas: []
                    };

                for (var j = 0; j < 5; j++) {
                    var pregunta =
                        {
                            idPregunta: preguntas[j].idPregunta,
                            enunciado: preguntas[j].enunciado,
                            imagenEnunciado: preguntas[j].imagenEnunciado,
                            correctoIncorrecto: '-1'
                        }
                    intento.preguntas.push(pregunta)
                }
                Estudiante.findOne({
                        usuario: req.session.usuario
                    }, function (error, doc) {
                        doc.intentos.push(intento);
                        doc.save(function (err, docActualizado) {
                            if (err) return console.log(err);
                            res.render('paginas/participante/retosOpcionMultiple', {
                                nombre: req.session.nombre,
                                materia: req.body.materia,
                                facilitador: req.body.facilitador,
                                preguntas: preguntas,
                                contadorPreguntas: contadorPreguntas,
                                idIntento: intento.idIntento
                            })
                        });
                    },
                )

            });
        } else {
            if (contadorPreguntas <= 5) {
                Estudiante.findOne({
                        usuario: req.session.usuario
                    }, function (error, doc) {
                        var indice = doc.intentos.map(function (e) {
                            return e.idIntento
                        }).indexOf(req.body.idIntento);
                        doc.intentos[indice].preguntas[contadorPreguntas - 1].correctoIncorrecto = req.body.correctoIncorrecto;
                        doc.intentos[indice].preguntas[contadorPreguntas - 1].resSeleccionada = req.body.resSeleccionada;
                        var puntaje = 0;
                        for (var k = 0; k < 5; k++) {
                            if (doc.intentos[indice].preguntas[k].correctoIncorrecto == 1) {
                                puntaje++;
                            }
                        }
                        doc.intentos[indice].puntaje = puntaje;
                        doc.save(function (err, docActualizado) {
                            if (err) return console.log(err);
                            if (contadorPreguntas < 5) {
                                res.render('paginas/participante/retosOpcionMultiple', {
                                    nombre: req.session.nombre,
                                    materia: req.body.materia,
                                    facilitador: req.body.facilitador,
                                    preguntas: preguntas,
                                    contadorPreguntas: contadorPreguntas,
                                    idIntento: req.body.idIntento
                                })
                            }
                            else {
                                res.render('paginas/participante/resultadosOpcionMultiple', {
                                    nombre: req.session.nombre,
                                    materia: req.body.materia,
                                    facilitador: req.body.facilitador,
                                    preguntas: doc.intentos[indice].preguntas,
                                    puntaje: puntaje,
                                    facilitador: doc.intentos[indice].profesor
                                })
                            }
                        });

                    },
                )
            }
        }
    }
    else {
        res.redirect('/')
    }
};
var preguntasEmparejar = [];
exports.post_mostrar_emparejar = function (req, res) {
    if (req.session.usuario && req.body.materia && (req.session.rol == "participante")) {
        preguntasEmparejar = [];
        var indices = [];
        var textoDesordenado = [];
        Profesor.findOne({nombre: req.body.facilitador}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }
            var indiceMateria = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            for (var i = 0; i < 5; i++) {
                var indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasUnirVoltear.length);
                while (indices.indexOf(indice) >= 0 || doc.materias[indiceMateria].preguntasUnirVoltear[indice].dificultad != req.body.dificultad) {
                    indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasUnirVoltear.length);
                }
                indices.push(indice);
                preguntasEmparejar.push(doc.materias[indiceMateria].preguntasUnirVoltear[indice])
            }
            textoDesordenado = desordenarTextoUnir(preguntasEmparejar);

            var intento =
                {
                    idIntento: generarNombre(),
                    profesor: req.body.facilitador,
                    materia: req.body.materia,
                    tipoDesafio: 'emparejar',
                    dificultad: req.body.dificultad,
                    puntaje: '0',
                    preguntas: []
                };

            for (var j = 0; j < 5; j++) {
                var pregunta =
                    {
                        idPregunta: preguntasEmparejar[j].idPregunta,
                        enunciado: preguntasEmparejar[j].texto,
                        imagenEnunciado: preguntasEmparejar[j].imagen,
                        correctoIncorrecto: '-1'
                    }
                intento.preguntas.push(pregunta)
            }
            Estudiante.findOne({
                usuario: req.session.usuario
            }, function (error, doc) {
                doc.intentos.push(intento);
                doc.save(function (err, docActualizado) {
                    if (err) return console.log(err);
                    res.render('paginas/participante/retosEmparejar', {
                        nombre: req.session.nombre,
                        materia: req.body.materia,
                        facilitador: req.body.facilitador,
                        preguntas: preguntasEmparejar,
                        idIntento: intento.idIntento,
                        textoDesordenado: textoDesordenado,
                        facilitador: req.body.facilitador,
                    })
                });

            })

        })
    }
    else {
        res.redirect('/')
    }
};
exports.post_resultados_emparejar = function (req, res) {
    if (req.session.usuario && req.body.materia && (req.session.rol == "participante")) {
        var puntaje = 0;
        var puntajes = [];
        var respuestas = req.body.respuestas.split(",");
        Estudiante.findOne({
            usuario: req.session.usuario
        }, function (error, doc) {
            var indiceIntento = doc.intentos.map(function (e) {
                return e.idIntento
            }).indexOf(req.body.idIntento);

            for (var i = 0; i < (preguntasEmparejar.length); i++) {
                var indice = respuestas.indexOf(preguntasEmparejar[i].idPregunta);
                if (preguntasEmparejar[i].texto == respuestas[indice + 1]) {
                    console.log("HOLA")
                    doc.intentos[indiceIntento].preguntas[i].correctoIncorrecto = 1;
                    puntajes.push(1);
                    puntaje++;
                }
                else {
                    doc.intentos[indiceIntento].preguntas[i].correctoIncorrecto = 0;
                    puntajes.push(0);
                }
            }
            doc.intentos[indiceIntento].puntaje = puntaje;
            doc.save(function (err, docActualizado) {
                res.render('paginas/participante/resultadosEmparejar', {
                    respuestas: respuestas,
                    nombre: req.session.nombre,
                    facilitador: req.body.facilitador,
                    materia: req.body.materia,
                    preguntas: preguntasEmparejar,
                    puntaje: puntaje,
                    puntajes: puntajes
                })
            })
        })
    }
    else {
        res.redirect('/')
    }
};
var preguntasUnir = [];
exports.post_mostrar_unir = function (req, res) {
    if (req.session.usuario && req.body.materia && (req.session.rol == "participante")) {
        preguntasUnir = [];
        var stringPreguntaUnir = "";
        var indices = [];
        var memory_array = [];
        Profesor.findOne({nombre: req.body.facilitador}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }
            var indiceMateria = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            for (var i = 0; i < 6; i++) {
                var indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasUnirVoltear.length);
                while (indices.indexOf(indice) >= 0 || doc.materias[indiceMateria].preguntasUnirVoltear[indice].dificultad != req.body.dificultad) {
                    indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasUnirVoltear.length);
                }
                indices.push(indice);
                preguntasUnir.push(doc.materias[indiceMateria].preguntasUnirVoltear[indice]);
                stringPreguntaUnir += doc.materias[indiceMateria].preguntasUnirVoltear[indice].imagen + "@" + doc.materias[indiceMateria].preguntasUnirVoltear[indice].texto + "@";
                memory_array.push(doc.materias[indiceMateria].preguntasUnirVoltear[indice].imagen);
                memory_array.push(doc.materias[indiceMateria].preguntasUnirVoltear[indice].imagen)
            }
            var intento =
                {
                    idIntento: generarNombre(),
                    profesor: req.body.facilitador,
                    materia: req.body.materia,
                    tipoDesafio: 'unir',
                    dificultad: req.body.dificultad,
                    puntaje: '0',
                    preguntas: []
                };

            for (var j = 0; j < 6; j++) {
                var pregunta =
                    {
                        idPregunta: preguntasUnir[j].idPregunta,
                        enunciado: preguntasUnir[j].texto,
                        imagenEnunciado: preguntasUnir[j].imagen,
                    }
                intento.preguntas.push(pregunta)
            }
            memory_array.memory_tile_shuffle();
            console.log(memory_array)
            Estudiante.findOne({
                usuario: req.session.usuario
            }, function (error, doc) {
                doc.intentos.push(intento);
                doc.save(function (err, docActualizado) {
                    if (err) return console.log(err);
                    res.render('paginas/participante/retosUnir', {
                        nombre: req.session.nombre,
                        materia: req.body.materia,
                        facilitador: req.body.facilitador,
                        preguntas: stringPreguntaUnir,
                        idIntento: intento.idIntento,
                        facilitador: req.body.facilitador,
                        memory_array: memory_array
                    })
                });
            })
        })
    }
    else {
        res.redirect('/')
    }
};
exports.post_resultados_unir = function (req, res) {
    if (req.session.usuario && req.body.materia && (req.session.rol == "participante")) {
        var puntaje = 0;
        var respuestas = [];
        if (req.body.respuestas.length > 0) {
            respuestas = req.body.respuestas.split(",");
        }
        else {
            puntaje = 0;
        }
        if (respuestas.length == 1) {
            puntaje = 1;
        }
        else {
            puntaje = Math.floor((respuestas.length * 5) / 6);
        }

        Estudiante.findOne({
            usuario: req.session.usuario
        }, function (error, doc) {
            var indiceIntento = doc.intentos.map(function (e) {
                return e.idIntento
            }).indexOf(req.body.idIntento);
            doc.intentos[indiceIntento].puntaje = puntaje;
            doc.save(function (err, docActualizado) {

                res.render('paginas/participante/resultadosUnir', {
                    respuestas: respuestas,
                    nombre: req.session.nombre,
                    facilitador: req.body.facilitador,
                    materia: req.body.materia,
                    preguntas: preguntasUnir,
                    puntaje: puntaje
                })
            })
        })
    }
    else {
        res.redirect('/')
    }
};
exports.get_retos_materia = function (req, res) {
    let opcionMultiple = [];
    let emparejar = [];
    let unirVoltear = [];
    let intentosMateria = [];
    if (req.session.usuario && req.query.materia) {
            Estudiante.findOne({
                usuario: req.session.usuario
            }, function (error, doc) {
                for (let i = 0; i < doc.intentos.length; i++) {
                    if (doc.intentos[i].materia == req.query.materia && doc.intentos[i].profesor == req.query.facilitador) {
                        intentosMateria.push(doc.intentos[i])
                    }
                }
                opcionMultiple = obtenerPuntaje(intentosMateria, "opcionMultiple");
                emparejar = obtenerPuntaje(intentosMateria, "emparejar");
                unirVoltear = obtenerPuntaje(intentosMateria, "unir");
                res.render('paginas/participante/retosEstudiante', {
                    nombre: req.session.nombre,
                    facilitador: req.query.facilitador,
                    materia: req.query.materia,
                    opcionMutiple: opcionMultiple,
                    emparejar: emparejar,
                    unirVoltear: unirVoltear
                })
            });

    } else {
        res.redirect('/');
    }
};
exports.get_estadisticas = function (req, res) {
    if (req.session.nombre) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {

            var materias = [];
            for (var i = 0; i < doc.materias.length; i++) {
                var boolOpcion = verificarNumeroPreguntas(doc.materias[i].preguntasOpcionMultiple, 5);
                var boolUnir = verificarNumeroPreguntas(doc.materias[i].preguntasUnirVoltear, 8);
                var materia = {
                    nombre: doc.materias[i].nombre,
                    tipo: doc.materias[i].tipo,
                    numOpcionMultiple: doc.materias[i].preguntasOpcionMultiple.length,
                    numUnirVoltear: doc.materias[i].preguntasUnirVoltear.length,
                    boolOpcion: boolOpcion,
                    boolUnir: boolUnir

                };
                materias.push(materia);

            }
            res.render('paginas/facilitador/inicioEstadistica', {
                nombre: req.session.nombre,
                usuario: req.session.usuario,
                materias: materias

            });

        });

    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.get_estadistica_participante = function (req, res) {
    if (req.session.nombre) {
        Estudiante.find({}, function (error, doc) {
            let participantes = [];
            doc.forEach(function (participante) {
                let intentosMateria = 0;
                participante.intentos.forEach(function (intento) {
                    if(intento.profesor == req.session.nombre && intento.materia == req.params.materia){
                        intentosMateria++;
                    }
                });
                if(intentosMateria > 0)
                {
                    let participanteN = {
                        usuario: participante.usuario,
                        nombre: participante.nombre
                    };
                    participantes.push(participanteN);
                }

            });
            res.render('paginas/facilitador/listaParticipantes', {
                nombre: req.session.nombre,
                usuario: req.session.usuario,
                tematica: req.params.materia,
                participantes: participantes

            });

        })
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.get_estadistica_preguntas = function (req, res) {
    if (req.session.nombre) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            var preguntas = [];
            var idMateria = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.params.materia);
            for (var i = 0; i < doc.materias[idMateria].preguntasOpcionMultiple.length; i++) {
                var preguntaOpcion = {
                    idPregunta: "",
                    enunciado: "",
                    resCorrecta: 0,
                    resIncorrecta: 0
                };
                if (doc.materias[idMateria].preguntasOpcionMultiple[i].imagenEnunciado) {
                    preguntaOpcion.idPregunta = doc.materias[idMateria].preguntasOpcionMultiple[i].idPregunta;
                    preguntaOpcion.enunciado = doc.materias[idMateria].preguntasOpcionMultiple[i].enunciado;
                    preguntaOpcion.imagenEnunciado = doc.materias[idMateria].preguntasOpcionMultiple[i].imagenEnunciado;
                } else {
                    preguntaOpcion.idPregunta = doc.materias[idMateria].preguntasOpcionMultiple[i].idPregunta;
                    preguntaOpcion.enunciado = doc.materias[idMateria].preguntasOpcionMultiple[i].enunciado;
                }
                preguntas.push(preguntaOpcion);
            }
            for (var a = 0; a < doc.materias[idMateria].preguntasUnirVoltear.length; a++) {
                var preguntaUnir = {
                    idPregunta: "",
                    enunciado: "",
                    imagen: "",
                    resCorrecta: 0,
                    resIncorrecta: 0
                };
                preguntaUnir.idPregunta = doc.materias[idMateria].preguntasUnirVoltear[a].idPregunta;
                preguntaUnir.enunciado = doc.materias[idMateria].preguntasUnirVoltear[a].texto;
                preguntaUnir.imagen = doc.materias[idMateria].preguntasUnirVoltear[a].imagen;

                preguntas.push(preguntaUnir);
            }
            Estudiante.find({}, function (error, doc) {
                doc.forEach(function (participante) {
                    for (var b = 0; b < participante.intentos.length; b++) {
                        console.log("intentos");
                        console.log(participante.intentos.length);
                        if (participante.intentos[b].tipoDesafio != "unir") {
                            console.log("Distintos de unir");
                            console.log(participante.intentos[b].tipoDesafio);
                            for (var c = 0; c < participante.intentos[b].preguntas.length; c++) {
                                var indicePregunta = preguntas.map(function (e) {
                                    return e.idPregunta
                                }).indexOf(participante.intentos[b].preguntas[c].idPregunta);
                                console.log("Preguntas");
                                console.log(indicePregunta);
                                if (indicePregunta > 0) {
                                    if (participante.intentos[b].preguntas[c].correctoIncorrecto == 1) {
                                        preguntas[indicePregunta].resCorrecta += 1;
                                        console.log("Uno más: ");
                                        console.log(preguntas[indicePregunta].resCorrecta);
                                    } else {
                                        preguntas[indicePregunta].resIncorrecta += 1;
                                    }
                                }
                            }
                        }

                    }
                });
                res.render('paginas/facilitador/estadisticaPreguntas', {
                    nombre: req.session.nombre,
                    usuario: req.session.usuario,
                    asignatura: req.params.materia,
                    preguntas: preguntas
                });
            });
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.post_detalle_participante = function (req, res) {
    if (req.session.nombre) {
        var opcionMultiple = [];
        var emparejar = [];
        var unirVoltear = [];
        var intentosMateria = [];
        var participante = "";
        Estudiante.findOne({usuario: req.body.usuario}, function (error, doc) {
            participante = doc.nombre;
            for (var i = 0; i < doc.intentos.length; i++) {
                if (doc.intentos[i].materia == req.body.asignatura && doc.intentos[i].profesor == req.body.facilitador) {
                    intentosMateria.push(doc.intentos[i])
                }
            }
            opcionMultiple = obtenerPuntaje(intentosMateria, "opcionMultiple");
            emparejar = obtenerPuntaje(intentosMateria, "emparejar");
            unirVoltear = obtenerPuntaje(intentosMateria, "unir");
            res.render('paginas/facilitador/detalleParticipante', {
                nombre: req.session.nombre,
                usuario: req.session.usuario,
                participante: participante,
                opcionMultiple: opcionMultiple,
                emparejar: emparejar,
                unirVoltear: unirVoltear,
                asignatura: req.body.asignatura

            });
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.get_ingreso_administrador = function (req, res) {
    if (req.session.nombre) {
        var usuarios = [];
        Usuario.find({}, function (error, doc) {
            doc.forEach(function (usuario) {
                var usuarioX = {
                    nombre: usuario.nombre,
                    usuario: usuario.usuario,
                    contrasenia: usuario.contrasenia,
                    codigoVerificacion: usuario.codigoVerificacion,
                    fechaUltimaConexion: usuario.fechaUltimaConexion
                };
                usuarios.push(usuarioX);
            });
            res.render('paginas/inicioAdministrador', {
                nombre: req.session.nombre,
                usuario: req.session.usuario,
                usuarios: usuarios
            })
        })
    } else {
        res.redirect('/inicioSesion');
    }
};
exports.get_recuperar_contrasenia = function (req, res) {
    var usuario = "";
    res.render('paginas/recuperarContrasenia', {usuario: usuario});
};
exports.post_recuperar_contrasenia = function (req, res) {
    if (req.body.usuario == 'administrador') {
        req.body.usuario = 'polhibou@gmail.com';
    }
    Usuario.findOne({usuario: req.body.usuario}, function (error, doc) {
        if (error) {
            console.log("Error en la busqueda del usuario: " + error);
        }
        else {
            if (doc != null) {
                var contraseniaTemporal = generarNombre();
                doc.contraseniaTemporal = contraseniaTemporal;
                console.log("Con Contrasenia Temporal: " + doc)
                doc.save(function (err, docActualizado) {
                    if (err) {
                        res.render('paginas/error', {mensaje: err, direccion: "/recuperarContrasenia"})
                    }
                    correo.enviarCorreo(doc.usuario, doc.contraseniaTemporal);
                    res.render('paginas/inicioSesion', {usuario: "", tipo: 1});
                })
            }
            else {
                res.render('paginas/error', {
                    mensaje: "El usuario ingresado no se encuentra registrado.",
                    direccion: "/"
                });
            }
        }
    });
};
exports.post_cambiar_contrasenia = function (req, res) {
    if (req.body.usuario == 'administrador') {
        req.body.usuario = 'polhibou@gmail.com';
    }
    Usuario.findOne({usuario: req.body.usuario}, function (error, doc) {
        if (error) {
            console.log("Error en la busqueda del usuario: " + error);
        }
        else {
            if(doc != null)
            {
                if((req.body.sesionIniciada == 0) || (req.body.sesionIniciada == 1 && doc.contrasenia == req.body.contraseniaAnterior))
                {
                    doc.contrasenia = req.body.nuevaContrasenia;
                    doc.contraseniaTemporal = 0;
                    doc.save(function (err, docActualizado) {
                        if (err){
                            res.render('paginas/error', {
                                mensaje: "No se pudo cambiar la contraseña del usuario. Favor intentar nuevamente",
                                direccion: "/"
                            });
                        };
                        res.render('paginas/inicioSesion', {usuario: "", tipo: 2});
                    })
                }else {
                    res.render('paginas/nuevaContrasenia', {nombre: doc.nombre, usuario: req.body.usuario, sesionIniciada: 1, contraseniaAnterior: 1});
                }

            }else {
                res.render('paginas/error', {
                    mensaje: "No se ha encontrado el usuario especificado. Favor intentar nuevamente",
                    direccion: "/"
                });
            }
        }
    });
};
exports.post_partida_finalizada = function (req, res) {
    console.log("Ingrese a la finalizaci{on de la partida");
    if (req.body.idPartida != null) {
        Partida.findOne({idPartida: req.body.idPartida}, function (error, partida) {
            if (error) {
                console.log("Erororor: " + error);
                res.render('paginas/error', {
                    mensaje: "Se ha presentado un error en el servidor. Favor contactarse con el administrador",
                    direccion: "/"
                });
            } else {
                if (partida != null) {
                    console.log("Si existe la partida");
                    let equipos = [];
                    for (let i = 0; i < partida.jugadores.length; i++) {
                        for (let j = 0; j < partida.jugadores.length; j++) {
                            if (partida.turnoJugadores[i] == partida.jugadores[j].idSocket) {
                                let equipo = {
                                    nombre: partida.jugadores[j].nombre,
                                    icono: partida.jugadores[j].iconoEquipo
                                };
                                equipos.push(equipo);
                                j = partida.jugadores.length;
                            }
                        }
                    }
                    console.log("Rol: " + req.session.rol);
                    if (req.session.rol == "facilitador") {
                        res.render('paginas/participante/partidaFinalizada', {
                            idPartida: req.body.idPartida,
                            rol: req.body.rol,
                            nombreEquipo: req.body.nombreEquipo,
                            nombre: req.session.nombre, equipos: equipos
                        });
                    }
                    else {
                        res.render('paginas/participante/partidaFinalizada', {
                            idPartida: req.body.idPartida,
                            rol: req.body.rol,
                            nombreEquipo: req.body.nombreEquipo,
                            nombre: req.body.nombreEquipo,
                            nombre: req.session.nombre, equipos: equipos
                        });
                    }

                } else {
                    console.log("Idpartida: " + req.body.idPartida);
                    res.render('paginas/error', {
                        mensaje: "No existe la partida con la que se accedio",
                        direccion: "/"
                    });
                }
            }
        });
    } else {
        res.render('paginas/error', {mensaje: "Estas accediendo a un lugar donde no tienes acceso", direccion: "/"});
    }

};
exports.post_salir_partida = function(req, res){
    Partida.deleteOne({ idPartida: req.body.idPartida }, function (err) {
        if(err){
            console.log("No se elimino la partida: "+err)
        }
        else {
            console.log("Se elimino correctamente la partida: "+err);
            res.redirect('/')
        }
    });
};
exports.salir = function (req, res) {
    req.session.usuario = null;
    req.session.nombre = null;
    res.redirect('/');
};

exports.error = function (req, res) {
    res.render('paginas/error', {mensaje: "Estas accediendo a un lugar donde no tienes acceso", direccion: "/"});
}

function generarNombre() {
    return Math.floor((1 + Math.random()) * 0x1000000)
        .toString(16)
        .substring(2);
}

function contarPreguntas(array, dificultad) {

    var numPreguntas = 0;
    for (var j = 0; j < array.length; j++) {
        if (array[j].dificultad == dificultad) {
            numPreguntas++;
        }
    }
    return numPreguntas;
}

function verificarNumeroPreguntas(array, num) {
    var facil;
    var medio;
    var dificil;
    var boolResultado;
    facil = contarPreguntas(array, "Fácil");
    medio = contarPreguntas(array, "Medio");
    dificil = contarPreguntas(array, "Difícil");
    boolResultado = facil < num || medio < num || dificil < num;
    return boolResultado;
}

function obtenerPuntaje(array, tipoPregunta) {
    var puntajes = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < array.length; i++) {
        if (array[i].tipoDesafio == tipoPregunta) {
            switch (array[i].dificultad) {
                case "Fácil":
                    puntajes[0] += 1;
                    if (array[i].puntaje > puntajes[1]) {
                        puntajes[1] = array[i].puntaje;
                    }
                    break;
                case "Medio":
                    puntajes[2] += 1;
                    if (array[i].puntaje > puntajes[3]) {
                        puntajes[3] = array[i].puntaje;
                    }
                    break;
                case "Difícil":
                    puntajes[4] += 1;
                    if (array[i].puntaje > puntajes[5]) {
                        puntajes[5] = array[i].puntaje;
                    }
                    break;
            }
        }
    }
    return puntajes;
}

function desordenarTextoUnir(arrayPreguntas) {
    var vectorTextoUnir = [];
    for (var k = 0; k < arrayPreguntas.length; k++) {
        vectorTextoUnir.push(arrayPreguntas[k].texto);
    }
    var j, x, i;
    for (i = vectorTextoUnir.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = vectorTextoUnir[i];
        vectorTextoUnir[i] = vectorTextoUnir[j];
        vectorTextoUnir[j] = x;
    }
    return vectorTextoUnir;
}

Array.prototype.memory_tile_shuffle = function () {
    var i = this.length, j, temp;
    while (--i > 0) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[j];
        this[j] = this[i];
        this[i] = temp;
    }
};
