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
    let usuario = "";
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
                        res.render('paginas/nuevaContrasenia', {
                            nombre: doc.nombre,
                            usuario: req.body.usuario,
                            sesionIniciada: 0,
                            contraseniaAnterior: 0
                        });
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

    if (req.session.nombre != "") {
        res.render('paginas/nuevaContrasenia', {
            nombre: req.session.nombre,
            usuario: req.session.usuario,
            sesionIniciada: 1,
            contraseniaAnterior: 0
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};

exports.get_ingreso_profesor = function (req, res) {
    if (req.session.nombre) {
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
            let materias = [];
            for (let i = 0; i < doc.materias.length; i++) {
                let boolOpcion = verificarNumeroPreguntas(doc.materias[i].preguntasOpcionMultiple, 5);
                let boolUnir = verificarNumeroPreguntas(doc.materias[i].preguntasUnirVoltear, 8);
                let materia = {
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
            let materias = [];
            doc.forEach(function (facilitador) {
                for (let i = 0; i < facilitador.materias.length; i++) {
                    let materia = {
                        facilitador: '',
                        nombre: ''
                    };
                    let boolOpcion = verificarNumeroPreguntas(facilitador.materias[i].preguntasOpcionMultiple, 5);
                    let boolUnir = verificarNumeroPreguntas(facilitador.materias[i].preguntasUnirVoltear, 8);
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
                        let profesor = new Profesor({
                            usuario: req.body.usuario,
                            nombre: req.body.nombre
                        });
                        profesor.save(function (error) {
                            if (error) {
                                console.log("Error al crear facilitador: " + error)
                            }
                        });
                        let estudiante = new Estudiante({
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
        let materia = {
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
            let indice = doc.materias.map(function (e) {
                return e.nombre.trim();
            }).indexOf(req.params.materia);
            let idPreguntas = [];
            let enunciadoPreguntas = [];
            let dificultadPreguntas = [];

            for (let i = 0; i < doc.materias[indice].preguntasOpcionMultiple.length; i++) {
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
        let str = req.params.idMateria;
        let resp = str.split("&");
        let materia = resp[0];
        let idPregunta = resp[1];
        Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {

            if (error) {
                console.log("Error: " + error)
            }

            let indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(materia);

            if (indice >= 0) {
                let indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
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

        let indice = doc.materias.map(function (e) {
            return e.nombre
        }).indexOf(req.body.materia);
        let preguntaOpcionMultiple = {
            enunciado: req.body.enunciado,
            respuestaCorrecta: req.body.respuestaCorrecta,
            dificultad: req.body.dificultad,
            idPregunta: (req.body.materia).substr(0, 4) + "opmu" + generarNombre()
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
            let indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
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

        let indice = doc.materias.map(function (e) {
            return e.nombre
        }).indexOf(req.body.materia);

        let indicePregunta = -1;
        if (indice > -1) {
            indicePregunta = doc.materias[indice].preguntasOpcionMultiple.map(function (e) {
                return e.idPregunta
            }).indexOf(req.body.idPregunta);
        }

        if (indicePregunta >= 0) {
            let preguntaOpcionMultiple = {
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
    console.log("Se tiene el siguiente rol al crear partida ", req.session.rol);
    if (req.session.usuario && req.params.materia) {
        if (req.session.rol == "facilitador") {
            let idPartida = (req.params.materia.replace(" ", "_").substr(0, 3)) + Math.floor((1 + Math.random()) * 0x1000).toString(5).substring(1);
            console.log("Se ha creado el idPartida ", idPartida);
            res.render('paginas/facilitador/creacionPartida', {
                nombre: req.session.nombre,
                materia: req.params.materia,
                idPartida: idPartida
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
    if (req.body.rol == "facilitador") {
        res.render('paginas/participante/tablero', {
            idPartida: req.body.idPartida,
            rol: req.body.rol,
            nombreEquipo: req.body.rol,
            nombre: req.session.nombre
        });
    }
    else {
        if (req.body.rol == "participante") {
            res.render('paginas/participante/tablero', {
                idPartida: req.body.idPartida,
                rol: req.body.rol,
                nombreEquipo: req.body.nombreEquipo,
                nombre: req.body.nombreEquipo
            });
        } else {
            res.render('paginas/participante/tablero', {
                idPartida: req.body.idPartida,
                rol: req.body.rol,
                nombreEquipo: req.body.rol,
                nombre: req.body.rol
            })
        }
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
    let nombre = ((req.session.nombre == null) ? "Participante" : req.session.nombre);
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

            let indice = doc.materias.map(function (e) {
                return e.nombre.trim();
            }).indexOf(req.params.materia);
            let idPreguntas = [];
            let textoPreguntas = [];
            let imagenPreguntas = [];
            let dificultades = [];
            for (let i = 0; i < doc.materias[indice].preguntasUnirVoltear.length; i++) {
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
            let indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            let preguntaUnir = {
                idPregunta: (req.body.materia).substr(0, 4) + "unir" + generarNombre(),
                texto: req.body.nombreImagen,
                imagen: req.body.imagenUnir,
                dificultad: req.body.dificultad
            }
            if (indice >= 0) {
                doc.materias[indice].preguntasUnirVoltear.push(preguntaUnir);
                doc.save(function (err, docActualizado) {
                    if (err) return console.log(err);

                    res.redirect('ingresoFacilitador/preguntasEmparejarVoltear/' + req.body.materia);
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
            let indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            if (indice >= 0) {
                let indicePregunta = doc.materias[indice].preguntasUnirVoltear.map(function (e) {
                    return e.idPregunta
                }).indexOf(req.body.idPregunta);
                if (indicePregunta >= 0) {
                    doc.materias[indice].preguntasUnirVoltear.splice(indicePregunta, 1);
                    doc.save(function (err, docActualizado) {
                        if (err) return console.log(err);
                        res.redirect('/ingresoFacilitador/preguntasEmparejarVoltear/' + req.body.materia);
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
                res.render('paginas/error', {
                    mensaje: "No se encontro el usuario facilitador con el que se esta logeado. No se guardaron las imagenes con sus nombres. Vuelve a intentar nuevamente por favor.",
                    direccion: "/"
                });
            }

            let indice = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            let numeroPreguntas = req.body.numeroPreguntas;

            for (let i = 1; i <= numeroPreguntas; i++) {
                let preguntaU = [];
                preguntaU.push("imagen" + i);
                preguntaU.push("textoUnir" + i);
                preguntaU.push("dificultad" + i);

                let preguntaUnir = {
                    idPregunta: (req.body.materia).substr(0, 4) + "unir" + generarNombre(),
                    imagen: req.body[preguntaU[0]],
                    texto: req.body[preguntaU[1]],
                    dificultad: req.body[preguntaU[2]]
                };

                if (indice >= 0) {
                    doc.materias[indice].preguntasUnirVoltear.push(preguntaUnir);
                }
            }
            doc.save(function (err, docActualizado) {
                if (err) {
                    console.log(err);
                    res.render('paginas/error', {
                        mensaje: "No se guardaron las imagenes con sus nombres. Vuelve a intentar nuevamente por favor.",
                        direccion: "/"
                    });

                }
                else {
                    res.redirect('/ingresoFacilitador/preguntasEmparejarVoltear/' + req.body.materia);
                }
            });
        });
    }
    else {
        res.redirect('/inicioSesion');
    }
};

exports.post_lobby = function (req, res) {
    console.log("idPArtida de la sesion: " + req.session.idPartida);
    console.log("idPArtida del body: " + req.body.idPartida);
    if ((req.session.usuario != undefined) && (req.session.rol == "facilitador") && (req.body.idPartida != undefined)) {
        let informacionJugadores = [];
        for (let i = 1; i <= req.body.numeroEquipos; i++) {
            let equipoU = [];
            equipoU.push("nombreEquipo" + i);
            equipoU.push("imagenEquipo" + i);

            let nuevoEquipo = {
                nombreEquipo: req.body[equipoU[0]],
                imagenEquipo: req.body[equipoU[1]]
            };
            informacionJugadores.push(nuevoEquipo);
        }
        res.render('paginas/facilitador/lobby', {
            nombre: req.session.nombre,
            rol: req.session.rol,
            usuario: req.session.usuario,
            materia: req.body.materia,
            idPartida: req.body.idPartida,
            numeroEquipos: req.body.numeroEquipos,
            informacionJugadores: informacionJugadores
        });

    } else {
        res.redirect("/");
    }
};

exports.post_lobby_participante = function (req, res) {
    if (req.body.tipoIngreso == "participante" || req.body.tipoIngreso == "espectador") {
        let nombre = "";
        let nombreEquipo = ((req.body.nombreEquipo == "ninguno") ? "Espectador" : req.body.nombreEquipo);
        if (req.body.tipoIngreso == "espectador") {
            nombre = ((req.session.nombre == null) ? "Espectador" : req.session.nombre);
            res.render('paginas/participante/lobbyEspectador', {
                nombreEquipo: nombreEquipo,
                codigoPartida: req.body.codigoPartida,
                tipoIngreso: req.body.tipoIngreso,
                nombre: nombre
            });
        } else {
            nombre = ((req.session.nombre == null) ? "Participante" : req.session.nombre);
            res.render('paginas/participante/lobbyParticipante', {
                nombreEquipo: nombreEquipo,
                codigoPartida: req.body.codigoPartida,
                tipoIngreso: req.body.tipoIngreso,
                nombre: nombre
            });
        }
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
            let indice = doc.materias.map(function (e) {
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
            let indice = doc.materias.map(function (e) {
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

exports.post_validar_cuenta = function (req, res) {
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
                        res.render('paginas/inicioSesion', {usuario: "", tipo: 3});
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
    let opcionMultiple = [];
    let emparejar = [];
    let unirVoltear = [];
    let intentosMateria = [];
    if (req.session.usuario && req.body.materia) {
        Estudiante.findOne({
            usuario: req.session.usuario
        }, function (error, doc) {
            for (let i = 0; i < doc.intentos.length; i++) {
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
    let contadorPreguntas = req.body.contadorPreguntas;
    contadorPreguntas++;
    if (req.session.usuario && req.body.materia && (req.session.rol == "participante")) {
        let indices = [];
        if (contadorPreguntas == 0) {
            preguntas = [];
            Profesor.findOne({nombre: req.body.facilitador}, function (error, doc) {
                if (error) {
                    console.log("Error: " + error)
                }
                let indiceMateria = doc.materias.map(function (e) {
                    return e.nombre
                }).indexOf(req.body.materia);

                for (let i = 0; i < 5; i++) {
                    let indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasOpcionMultiple.length);
                    while (indices.indexOf(indice) >= 0 || doc.materias[indiceMateria].preguntasOpcionMultiple[indice].dificultad != req.body.dificultad) {
                        indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasOpcionMultiple.length);
                    }
                    indices.push(indice);
                    preguntas.push(doc.materias[indiceMateria].preguntasOpcionMultiple[indice])
                }
                let intento =
                    {
                        idIntento: "intento" + generarNombre(),
                        profesor: req.body.facilitador,
                        materia: req.body.materia,
                        tipoDesafio: 'opcionMultiple',
                        dificultad: req.body.dificultad,
                        puntaje: '0',
                        preguntas: []
                    };

                for (let j = 0; j < 5; j++) {
                    let pregunta =
                        {
                            idPregunta: preguntas[j].idPregunta,
                            enunciado: preguntas[j].enunciado,
                            imagenEnunciado: preguntas[j].imagenEnunciado,
                            respuestaSeleccionada: "",
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
                        let indice = doc.intentos.map(function (e) {
                            return e.idIntento
                        }).indexOf(req.body.idIntento);
                        doc.intentos[indice].preguntas[contadorPreguntas - 1].correctoIncorrecto = req.body.correctoIncorrecto;
                        doc.intentos[indice].preguntas[contadorPreguntas - 1].respuestaSeleccionada = req.body.resSeleccionada;
                        let puntaje = 0;
                        for (let k = 0; k < 5; k++) {
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
                                Profesor.findOne({nombre: doc.intentos[indice].profesor}, function (errorF, facilitador) {
                                    if (errorF) {
                                        console.log("error en la consulta de los datos del facilitador de las preguntas")
                                    }
                                    let indiceTematica = facilitador.materias.map(function (e) {
                                        return e.nombre;
                                    }).indexOf(doc.intentos[indice].materia);
                                    let respuestasCorrectas = [];
                                    let respuestasSeleccionadas = [];
                                    if (indiceTematica > -1) {
                                        for (let a = 0; a < doc.intentos[indice].preguntas.length; a++) {
                                            let indicePregunta = facilitador.materias[indiceTematica].preguntasOpcionMultiple.map(function (e) {
                                                return e.idPregunta;
                                            }).indexOf(doc.intentos[indice].preguntas[a].idPregunta);
                                            let resCorrecta = facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].respuestaCorrecta;
                                            switch (resCorrecta) {
                                                case "res1":
                                                    if ((facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res1) != undefined) {
                                                        respuestasCorrectas.push("texto");
                                                        respuestasCorrectas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res1);
                                                    } else {
                                                        respuestasCorrectas.push("imagen");
                                                        respuestasCorrectas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].imagenRes1);
                                                    }
                                                    break;
                                                case "res2":
                                                    if ((facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res2) != undefined) {
                                                        respuestasCorrectas.push("texto");
                                                        respuestasCorrectas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res2);
                                                    } else {
                                                        respuestasCorrectas.push("imagen");
                                                        respuestasCorrectas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].imagenRes2);
                                                    }
                                                    break;
                                                case "res3":
                                                    if ((facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res3) != undefined) {
                                                        respuestasCorrectas.push("texto");
                                                        respuestasCorrectas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res3);
                                                    } else {
                                                        respuestasCorrectas.push("imagen");
                                                        respuestasCorrectas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].imagenRes3);
                                                    }
                                                    break;
                                                case "res4":
                                                    if ((facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res4) != undefined) {
                                                        respuestasCorrectas.push("texto");
                                                        respuestasCorrectas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res4);
                                                    } else {
                                                        respuestasCorrectas.push("imagen");
                                                        respuestasCorrectas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].imagenRes4);
                                                    }
                                                    break;
                                            }
                                            let resSeleccionada = doc.intentos[indice].preguntas[a].respuestaSeleccionada;
                                            switch (resSeleccionada) {
                                                case "res1":
                                                    if ((facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res1) != undefined) {
                                                        respuestasSeleccionadas.push("texto");
                                                        respuestasSeleccionadas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res1);
                                                    } else {
                                                        respuestasSeleccionadas.push("imagen");
                                                        respuestasSeleccionadas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].imagenRes1);
                                                    }
                                                    break;
                                                case "res2":
                                                    if ((facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res2) != undefined) {
                                                        respuestasSeleccionadas.push("texto");
                                                        respuestasSeleccionadas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res2);
                                                    } else {
                                                        respuestasSeleccionadas.push("imagen");
                                                        respuestasSeleccionadas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].imagenRes2);
                                                    }
                                                    break;
                                                case "res3":
                                                    if ((facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res3) != undefined) {
                                                        respuestasSeleccionadas.push("texto");
                                                        respuestasSeleccionadas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res3);
                                                    } else {
                                                        respuestasSeleccionadas.push("imagen");
                                                        respuestasSeleccionadas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].imagenRes3);
                                                    }
                                                    break;
                                                case "res4":
                                                    if ((facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res4) != undefined) {
                                                        respuestasSeleccionadas.push("texto");
                                                        respuestasSeleccionadas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].res4);
                                                    } else {
                                                        respuestasSeleccionadas.push("imagen");
                                                        respuestasSeleccionadas.push(facilitador.materias[indiceTematica].preguntasOpcionMultiple[indicePregunta].imagenRes4);
                                                    }
                                                    break;
                                            }
                                        }
                                    }
                                    res.render('paginas/participante/resultadosOpcionMultiple', {
                                        nombre: req.session.nombre,
                                        materia: req.body.materia,
                                        facilitador: req.body.facilitador,
                                        preguntas: doc.intentos[indice].preguntas,
                                        puntaje: puntaje,
                                        facilitador: doc.intentos[indice].profesor,
                                        respuestasCorrectas: respuestasCorrectas,
                                        respuestasSeleccionadas: respuestasSeleccionadas
                                    })
                                });
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
        let indices = [];
        let textoDesordenado = [];
        Profesor.findOne({nombre: req.body.facilitador}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }
            let indiceMateria = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            for (let i = 0; i < 5; i++) {
                let indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasUnirVoltear.length);
                while (indices.indexOf(indice) >= 0 || doc.materias[indiceMateria].preguntasUnirVoltear[indice].dificultad != req.body.dificultad) {
                    indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasUnirVoltear.length);
                }
                indices.push(indice);
                preguntasEmparejar.push(doc.materias[indiceMateria].preguntasUnirVoltear[indice])
            }
            textoDesordenado = desordenarTextoUnir(preguntasEmparejar);

            let intento =
                {
                    idIntento: "intento" + generarNombre(),
                    profesor: req.body.facilitador,
                    materia: req.body.materia,
                    tipoDesafio: 'emparejar',
                    dificultad: req.body.dificultad,
                    puntaje: '0',
                    preguntas: []
                };

            for (let j = 0; j < 5; j++) {
                let pregunta =
                    {
                        idPregunta: preguntasEmparejar[j].idPregunta,
                        enunciado: preguntasEmparejar[j].texto,
                        imagenEnunciado: preguntasEmparejar[j].imagen,
                        respuestaSeleccionada: "",
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
        let puntaje = 0;
        let puntajes = [];
        let respuestas = req.body.respuestas.split(",");
        Estudiante.findOne({
            usuario: req.session.usuario
        }, function (error, doc) {
            let indiceIntento = doc.intentos.map(function (e) {
                return e.idIntento
            }).indexOf(req.body.idIntento);

            for (let i = 0; i < (preguntasEmparejar.length); i++) {
                let indice = respuestas.indexOf(preguntasEmparejar[i].idPregunta);
                if (indice > -1) {
                    doc.intentos[indiceIntento].preguntas[i].respuestaSeleccionada = respuestas[indice + 1];
                    if (preguntasEmparejar[i].texto == respuestas[indice + 1]) {
                        doc.intentos[indiceIntento].preguntas[i].correctoIncorrecto = 1;
                        puntajes.push(1);
                        puntaje++;
                    }
                    else {
                        doc.intentos[indiceIntento].preguntas[i].correctoIncorrecto = 0;
                        puntajes.push(0);
                    }
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
        let stringPreguntaUnir = "";
        let indices = [];
        let memory_array = [];
        Profesor.findOne({nombre: req.body.facilitador}, function (error, doc) {
            if (error) {
                console.log("Error: " + error)
            }
            let indiceMateria = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.body.materia);

            for (let i = 0; i < 6; i++) {
                let indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasUnirVoltear.length);
                while (indices.indexOf(indice) >= 0 || doc.materias[indiceMateria].preguntasUnirVoltear[indice].dificultad != req.body.dificultad) {
                    indice = Math.floor(Math.random() * doc.materias[indiceMateria].preguntasUnirVoltear.length);
                }
                indices.push(indice);
                preguntasUnir.push(doc.materias[indiceMateria].preguntasUnirVoltear[indice]);
                stringPreguntaUnir += doc.materias[indiceMateria].preguntasUnirVoltear[indice].imagen + "@" + doc.materias[indiceMateria].preguntasUnirVoltear[indice].texto + "@";
                memory_array.push(doc.materias[indiceMateria].preguntasUnirVoltear[indice].imagen);
                memory_array.push(doc.materias[indiceMateria].preguntasUnirVoltear[indice].imagen)
            }
            let intento =
                {
                    idIntento: "intento" + generarNombre(),
                    profesor: req.body.facilitador,
                    materia: req.body.materia,
                    tipoDesafio: 'unir',
                    dificultad: req.body.dificultad,
                    puntaje: '0',
                    preguntas: []
                };

            for (let j = 0; j < 6; j++) {
                let pregunta =
                    {
                        idPregunta: preguntasUnir[j].idPregunta,
                        enunciado: preguntasUnir[j].texto,
                        imagenEnunciado: preguntasUnir[j].imagen,
                    }
                intento.preguntas.push(pregunta)
            }
            memory_array.memory_tile_shuffle();
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
        let puntaje = 0;
        let respuestas = [];
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
            let indiceIntento = doc.intentos.map(function (e) {
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

            let materias = [];
            for (let i = 0; i < doc.materias.length; i++) {
                let boolOpcion = verificarNumeroPreguntas(doc.materias[i].preguntasOpcionMultiple, 5);
                let boolUnir = verificarNumeroPreguntas(doc.materias[i].preguntasUnirVoltear, 8);
                let materia = {
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
                tematicas: materias

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
                    if (intento.profesor == req.session.nombre && intento.materia == req.params.materia) {
                        intentosMateria++;
                    }
                });
                if (intentosMateria > 0) {
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
            let preguntas = [];
            let idMateria = doc.materias.map(function (e) {
                return e.nombre
            }).indexOf(req.params.materia);
            for (let i = 0; i < doc.materias[idMateria].preguntasOpcionMultiple.length; i++) {
                let preguntaOpcion = {
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
            for (let a = 0; a < doc.materias[idMateria].preguntasUnirVoltear.length; a++) {
                let preguntaUnir = {
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
                    for (let b = 0; b < participante.intentos.length; b++) {
                        if (participante.intentos[b].tipoDesafio != "unir") {
                            for (let c = 0; c < participante.intentos[b].preguntas.length; c++) {
                                let indicePregunta = preguntas.map(function (e) {
                                    return e.idPregunta
                                }).indexOf(participante.intentos[b].preguntas[c].idPregunta);
                                if (indicePregunta > 0) {
                                    if (participante.intentos[b].preguntas[c].correctoIncorrecto == 1) {
                                        preguntas[indicePregunta].resCorrecta += 1;
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
        let opcionMultiple = [];
        let emparejar = [];
        let unirVoltear = [];
        let intentosMateria = [];
        let participante = "";
        Estudiante.findOne({usuario: req.body.usuario}, function (error, doc) {
            participante = doc.nombre;
            for (let i = 0; i < doc.intentos.length; i++) {
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
        let usuarios = [];
        Usuario.find({}, function (error, doc) {

            if (error) {
                console.log("Error en la consulta de todos los usuario " + error);
                res.render('paginas/error', {
                    mensaje: "Se presento inconvenientes en la consulta de todos los usuarios.",
                    direccion: "/"
                });
            }


            doc.forEach(function (usuario) {
                let usuarioX = {
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

exports.post_eliminar_usuario = function (req, res) {
    if (req.session.usuario) {
        Usuario.deleteOne({usuario: req.body.usuario}, function (error) {
            if (error) {
                console.log("Error en la eliminación del usuario: " + error)
                res.render('paginas/error', {
                    mensaje: "Se presento inconvenientes en la eliminación del usuario: " + req.body.usuario + ".",
                    direccion: "/"
                });
            }
            else {
                Estudiante.deleteOne({usuario: req.body.usuario}, function (error) {
                    if (error) {
                        console.log("Error: " + error)
                        res.render('paginas/error', {
                            mensaje: "Se presento inconvenientes en la eliminación del participante: " + req.body.usuario + ".",
                            direccion: "/"
                        });
                    }
                    else {
                        Profesor.deleteOne({usuario: req.body.usuario}, function (error) {
                            if (error) {
                                console.log("Error: " + error);
                                res.render('paginas/error', {
                                    mensaje: "Se presento inconvenientes en la eliminación del facilitador: " + req.body.usuario + ".",
                                    direccion: "/"
                                });
                            } else {
                                res.redirect('/');
                            }
                        });
                    }
                });
            }
        });
    }
    else {
        res.redirect('/');
    }
};

exports.get_recuperar_contrasenia = function (req, res) {
    let usuario = "";
    res.render('paginas/recuperarContrasenia', {usuario: usuario});
};

exports.post_recuperar_contrasenia = function (req, res) {
    if (req.body.usuario == 'administrador') {
        req.body.usuario = 'polhibou@gmail.com';
    }
    Usuario.findOne({usuario: req.body.usuario}, function (error, doc) {
        if (error) {
            console.log("Error en la busqueda del usuario: " + error);
            res.render('paginas/error', {
                mensaje: "Se presento inconvenientes en la busqueda del usuario: " + req.body.usuario + ".",
                direccion: "/"
            });
        }
        else {
            if (doc != null) {
                let contraseniaTemporal = generarNombre();
                doc.contraseniaTemporal = contraseniaTemporal;
                doc.save(function (err, docActualizado) {
                    if (err) {
                        res.render('paginas/error', {
                            mensaje: "Se presento inconvenientes en la actualización de la contrasenia temporal del usuario: " + req.body.usuario + ".",
                            direccion: "/recuperarContrasenia"
                        })
                    }
                    correo.enviarCorreoOlvideContrasenia(doc.usuario, doc.contraseniaTemporal);
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
            res.render('paginas/error', {
                mensaje: "Se presento inconvenientes en la busqueda del usuario: " + req.body.usuario + ".",
                direccion: "/"
            });
        }
        else {
            if (doc != null) {
                if ((req.body.sesionIniciada == 0) || (req.body.sesionIniciada == 1 && doc.contrasenia == req.body.contraseniaAnterior)) {
                    doc.contrasenia = req.body.nuevaContrasenia;
                    doc.contraseniaTemporal = 0;
                    doc.save(function (err, docActualizado) {
                        if (err) {
                            res.render('paginas/error', {
                                mensaje: "No se pudo cambiar la contraseña del usuario. Favor intentar nuevamente",
                                direccion: "/"
                            });
                        }
                        ;
                        res.render('paginas/inicioSesion', {usuario: "", tipo: 2});
                    })
                } else {
                    res.render('paginas/nuevaContrasenia', {
                        nombre: doc.nombre,
                        usuario: req.body.usuario,
                        sesionIniciada: 1,
                        contraseniaAnterior: 1
                    });
                }

            } else {
                res.render('paginas/error', {
                    mensaje: "No se ha encontrado el usuario especificado. Favor intentar nuevamente",
                    direccion: "/"
                });
            }
        }
    });
};

exports.post_partida_finalizada = function (req, res) {
    if (req.body.idPartida != null) {
        Partida.findOne({idPartida: req.body.idPartida}, function (error, partida) {
            if (error) {
                console.log("Error en finalizar la partida: " + error);
                res.render('paginas/error', {
                    mensaje: "Se presento inconvenientes en finalizar la partida" + req.body.idPartida + ".",
                    direccion: "/"
                });
            } else {
                if (partida != null) {
                    console.log("Si existe la partida");
                    let equipos = [];
                    for (let i = 0; i < partida.turnoJugadores.length; i++) {
                        for (let j = 0; j < partida.turnoJugadores.length; j++) {
                            console.log("Tamaño de turno jugadores: " + partida.turnoJugadores.length);
                            console.log("Jugadores: " + partida.jugadores.length);
                            console.log(partida.jugadores);
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
                    console.log("Rol: " + req.body.rol);
                    if (req.body.rol == "facilitador") {
                        res.render('paginas/participante/partidaFinalizada', {
                            idPartida: req.body.idPartida,
                            rol: req.body.rol,
                            nombreEquipo: req.body.rol,
                            nombre: req.session.nombre,
                            equipos: equipos
                        });
                    }
                    else {
                        res.render('paginas/participante/partidaFinalizada', {
                            idPartida: req.body.idPartida,
                            rol: req.body.rol,
                            nombreEquipo: req.body.nombreEquipo,
                            nombre: req.body.nombreEquipo,
                            equipos: equipos
                        });
                    }

                } else {
                    console.log("No existe la partida: " + req.body.idPartida);
                    res.render('paginas/error', {
                        mensaje: "No existe la partida " + req.body.idPartida + ".",
                        direccion: "/"
                    });
                }
            }
        });
    } else {
        res.render('paginas/error', {mensaje: "Estas accediendo a un lugar donde no tienes acceso", direccion: "/"});
    }

};

exports.post_salir_partida = function (req, res) {
    Partida.deleteOne({idPartida: req.body.idPartida}, function (err) {
        if (err) {
            console.log("No se elimino la partida: " + err);
            res.render('paginas/error', {
                mensaje: "Se presento inconvenientes en la salida de la partida: " + req.body.idPartida + ".",
                direccion: "/"
            });
        }
        else {
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

exports.get_intentos = function (req, res) {
    if (req.session.usuario) {
        Estudiante.findOne({usuario: req.session.usuario}, function (error, doc) {
            if (error) {
                res.render('paginas/error', {
                    mensaje: "No se pudo consultar la información del usuario " + req.session.usuario + ".",
                    direccion: "/"
                });
            }
            let intentosTematicaFacilitador = [];
            for (let i = 0; i < doc.intentos.length; i++) {
                let intentoTematicaFacilitador = {
                    facilitador: doc.intentos[i].profesor,
                    tematica: doc.intentos[i].materia,
                };
                if ((intentosTematicaFacilitador.length == 0) || ((intentosTematicaFacilitador.map(function (e) {
                        return e.facilitador;
                    }).indexOf(doc.intentos[i].profesor) < 0) &&
                    (intentosTematicaFacilitador.map(function (e) {
                        return e.tematica
                    }).indexOf(doc.intentos[i].tematica < 0)))) {
                    intentosTematicaFacilitador.push(intentoTematicaFacilitador);
                }
            }

            res.render('paginas/participante/intentos', {
                nombre: req.session.nombre,
                usuario: req.session.usuario,
                intentos: intentosTematicaFacilitador
            });
        });
    }
    else {
        redirect('/');
    }
}

exports.post_detalle_tematica = function (req, res) {
    if (req.session.usuario) {
        Estudiante.findOne({usuario: req.session.usuario}, function (error, doc) {

            if (error) {
                res.render('paginas/error', {
                    mensaje: "No se pudo consultar la información del usuario " + req.session.usuario + ".",
                    direccion: "/"
                });
            }

            let intentos = [];
            for (let i = 0; i < doc.intentos.length; i++) {
                console.log("el tamaño de intentos: "+intentos.length);
                console.log("i: "+i);
                let intento = {
                    idIntento: doc.intentos[i].idIntento,
                    facilitador: doc.intentos[i].profesor,
                    tematica: doc.intentos[i].materia,
                    tipoDesafio: doc.intentos[i].tipoDesafio,
                    dificultad: doc.intentos[i].dificultad,
                    puntaje: doc.intentos[i].puntaje,
                };
                console.log("profe "+intento.facilitador);
                console.log("mate: "+intento.tematica);

                if (doc.intentos[i].profesor == req.body.facilitador && doc.intentos[i].materia == req.body.tematica) {
                    tematica = doc.intentos[i].materia;
                    facilitador = doc.intentos[i].profesor;
                    intentos.push(intento);
                }
            }
            console.log("el tamaño de intentos: "+intentos.length);
            res.render('paginas/participante/detalleTematicasIntentos', {
                nombre: req.session.nombre,
                usuario: req.session.usuario,
                tematica: req.body.tematica,
                facilitador: req.body.facilitador,
                intentos: intentos
            })
        });
    }
    else {
        redirect('/');
    }
};

exports.post_detalle_intentos = function (req, res) {
    if (req.session.usuario) {
        Estudiante.findOne({usuario: req.session.usuario}, function (error, doc) {

            if (error) {
                res.render('paginas/error', {
                    mensaje: "No se pudo consultar la información del usuario " + req.session.usuario + ".",
                    direccion: "/"
                });
            }

            let indiceIntento = doc.intentos.map(function (e) {
                return e.idIntento
            }).indexOf(req.body.idIntento);
            if (indiceIntento > -1) {
                let preguntas = [];
                for (let i = 0; i < doc.intentos[indiceIntento].preguntas.length; i++) {
                    let pregunta = {
                        idPregunta: doc.intentos[indiceIntento].preguntas[i].idPregunta,
                        enunciado: doc.intentos[indiceIntento].preguntas[i].enunciado,
                        imagenEnunciado: doc.intentos[indiceIntento].preguntas[i].imagenEnunciado,
                        respuestaSeleccionada: (doc.intentos[indiceIntento].preguntas[i].respuestaSeleccionada == undefined ? "": doc.intentos[indiceIntento].preguntas[i].respuestaSeleccionada ),
                        correctoIncorrecto: (doc.intentos[indiceIntento].preguntas[i].correctoIncorrecto == undefined ? -1:doc.intentos[indiceIntento].preguntas[i].correctoIncorrecto)
                    };
                    preguntas.push(pregunta);
                }
                console.log("preguntas: "+preguntas.length);
                res.render('paginas/participante/detalleIntento', {
                    nombre: req.session.nombre,
                    usuario: req.session.usuario,
                    tematica: doc.intentos[indiceIntento].tematica,
                    facilitador: doc.intentos[indiceIntento].facilitador,
                    puntaje: doc.intentos[indiceIntento].puntaje,
                    tipoDesafio: doc.intentos[indiceIntento].tipoDesafio,
                    preguntas: preguntas
                });
            }
        });
    }
    else {
        redirect('/');
    }
}

function generarNombre() {
    return Math.floor((1 + Math.random()) * 0x1000000)
        .toString(16)
        .substring(2);
}

function contarPreguntas(array, dificultad) {

    let numPreguntas = 0;
    for (let j = 0; j < array.length; j++) {
        if (array[j].dificultad == dificultad) {
            numPreguntas++;
        }
    }
    return numPreguntas;
}

function verificarNumeroPreguntas(array, num) {
    let facil;
    let medio;
    let dificil;
    let boolResultado;
    facil = contarPreguntas(array, "Fácil");
    medio = contarPreguntas(array, "Medio");
    dificil = contarPreguntas(array, "Difícil");
    boolResultado = facil < num || medio < num || dificil < num;
    return boolResultado;
}

function obtenerPuntaje(array, tipoPregunta) {
    let puntajes = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < array.length; i++) {
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
    let vectorTextoUnir = [];
    for (let k = 0; k < arrayPreguntas.length; k++) {
        vectorTextoUnir.push(arrayPreguntas[k].texto);
    }
    let j, x, i;
    for (i = vectorTextoUnir.length - 1; i >= 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = vectorTextoUnir[i];
        vectorTextoUnir[i] = vectorTextoUnir[j];
        vectorTextoUnir[j] = x;
    }
    return vectorTextoUnir;
}

Array.prototype.memory_tile_shuffle = function () {
    let i = this.length, j, temp;
    while (--i > 0) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[j];
        this[j] = this[i];
        this[i] = temp;
    }
};