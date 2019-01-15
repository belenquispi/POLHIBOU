// Dependencies
var express = require('express');
var routes = require('./routes');
var session = require('express-session');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var baseDatos = require("./baseDatos");
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var Profesor = require("./models/profesor").Profesor;
var Estudiante = require("./models/estudiante").Estudiante;
var Partida = require("./models/partida").Partida;

app.set('port', 5000);
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: 'Esto es secreto',
    resave: true,
    saveUninitialized: true
}));
app.use('/static', express.static(__dirname + '/static/' + ''));
// create application/json parser
app.use(bodyParser.json());
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: true}));

var gameMap = [
    13, 14, 15, 16, 17, 18, 19, 20, 21,
    12, -1, -1, -1, -1, -1, -1, -1, 22,
    11, 10, 9, -1, -1, -1, 25, 24, 23,
    -1, -1, 8, -1, -1, -1, 26, -1, -1,
    -1, -1, 7, -1, -1, -1, 27, -1, -1,
    4, 5, 6, -1, -1, -1, 28, 29, 30,
    3, -1, -1, -1, -1, -1, -1, -1, 31,
    2, 1, 0, -1, -1, -1, 34, 33, 32
];
var anchoCasilla = 60, altoCasilla = 60;
var columnas = 9, filas = 8;

seleccionarColor();

function partida(nombrePartida) {
    this.nombrePartida = nombrePartida,
        this.jugadores = [],
        this.gameM = gameMap,
        this.anchoCas = anchoCasilla,
        this.altoCas = altoCasilla,
        this.colum = columnas,
        this.filas = filas,
        this.colorM = seleccionarColor(this.filas, this.colum, this.gameM),
        this.turnoJugadores = [],
        this.lugaresJugadores = []
}

let partidas = [];

function Character(c, x, y, z) {
    this.nombreEquipo = z;
    this.tileFrom = [2, 7];
    this.tileTo = [2, 7];
    this.timeMoved = 0;
    this.dimensions = [30, 30];
    this.position = [x, y];
    this.delayMove = 500;
    this.direction = directions.up;
    this.casilla = 0;
    this.iconoEquipo = c;
    this.boton = 0;
    this.moverseA = 0;
    this.listo = 0;
    this.idSocket = "";
    this.maldicion = 0;

}

let directions = {
    up: 0,
    right: 1,
    down: 2,
    left: 3
};

/* --------------------------------------------- Routning */

app.route('/')
    .get(routes.get_inicio)
    .post(routes.error)
    .put(routes.error);
app.route('/inicioSesion')
    .get(routes.get_inicio_sesion)
    .post(routes.post_inicio_sesion)
    .put(routes.error);
app.route('/creacionCuenta')
    .get(routes.error)
    .post(routes.post_creacion_cuenta)
    .put(routes.error);
app.route('/ingresoFacilitador')
    .get(routes.get_ingreso_profesor)
    .post(routes.error)
    .put(routes.error);
app.route('/ingresoParticipante')
    .get(routes.get_ingreso_estudiante)
    .post(routes.error)
    .put(routes.error);
app.route('/salir')
    .get(routes.salir)
    .post(routes.error)
    .put(routes.error);
app.route('/tablero')
    .get(routes.error)
    .post(routes.post_tablero)
    .put(routes.error);
//app.get('/ingresoFacilitador/preguntasOpcionMultiple/:materia/ingresoOpcionMultiple/:materia', routes.get_opcion_multiple);
app.route('/preguntasOpcionMultiple/ingresoOpcionMultiple/:materia')
    .get(routes.get_opcion_multiple)
    .post(routes.error)
    .put(routes.error);
app.route('/unirVoltear/:materia')
    .get(routes.get_unir_voltear)
    .post(routes.error)
    .put(routes.error);
app.route('/ingresoFacilitador/creacionPartida/:materia')
    .get(routes.get_creacion_partida)
    .post(routes.error)
    .put(routes.error);
app.route('/ingresoMateria')
    .get(routes.error)
    .post(routes.post_ingreso_materia)
    .put(routes.error);
app.route('/ingresoFacilitador/preguntasOpcionMultiple/:materia')
    .get(routes.get_preguntas_opcion)
    .post(routes.error)
    .put(routes.error);
app.route('/ingresoFacilitador/preguntasUnirVoltear/:materia')
    .get(routes.get_preguntas_unir_voltear)
    .post(routes.error)
    .put(routes.error);
app.route('/ingresoFacilitador/preguntasOpcionMultiple')
    .get(routes.error)
    .post(routes.post_preguntas_opcion)
    .put(routes.error);
app.route('/ingresoFacilitador/eliminarPreguntaOpcionMultiple/:idMateria')
    .get(routes.get_eliminar_pregunta_opcion)
    .post(routes.error)
    .put(routes.error);
app.route('/detalleOpcionMultiple')
    .get(routes.error)
    .post(routes.post_detalle_opcion_multiple)
    .put(routes.error);
app.route('/ingresoPartida')
    .get(routes.get_ingreso_partida)
    .post(routes.error)
    .put(routes.error);
app.route('/agregarUnirVoltear')
    .get(routes.error)
    .post(routes.post_agregar_unir_voltear)
    .put(routes.error);
app.route('/eliminarUnirVoltear')
    .get(routes.error)
    .post(routes.post_eliminar_unir_voltear)
    .put(routes.error);
app.route('/agregarVariasUnirVoltear')
    .get(routes.error)
    .post(routes.post_agregar_varias_unir_voltear)
    .put(routes.error);
app.route('/lobby')
    .get(routes.error)
    .post(routes.post_lobby)
    .put(routes.error);
app.route('/lobbyParticipante')
    .get(routes.error)
    .post(routes.post_lobby_participante)
    .put(routes.error);
app.route('/cambiarTipoMateria')
    .get(routes.error)
    .post(routes.post_cambiar_tipo_materia)
    .put(routes.error);
app.route('/eliminarMateria')
    .get(routes.error)
    .post(routes.post_eliminar_materia)
    .put(routes.error);
app.route('/validarCuenta')
    .get(routes.get_validar_cuenta)
    .post(routes.post_validar_cuenta)
    .put(routes.error);
app.route('/retosMateria')
    .get(routes.get_retos_materia)
    .post(routes.post_retos_materia)
    .put(routes.error);
app.route('/retoOpcionMultiple')
    .get(routes.error)
    .post(routes.post_mostrar_opcion)
    .put(routes.error);
app.route('/retoEmparejar')
    .get(routes.error)
    .post(routes.post_mostrar_emparejar)
    .put(routes.error);
app.route('/retoUnirVoltear')
    .get(routes.error)
    .post(routes.post_mostrar_unir)
    .put(routes.error);
app.route('/resultadosEmparejar')
    .get(routes.error)
    .post(routes.post_resultados_emparejar)
    .put(routes.error);
app.route('/resultadosUnir')
    .get(routes.error)
    .post(routes.post_resultados_unir)
    .put(routes.error);
app.route('/estadisticas')
    .get(routes.get_estadisticas)
    .post(routes.error)
    .put(routes.error);
app.route('/estadisticaParticipante/:materia')
    .get(routes.get_estadistica_participante)
    .post(routes.error)
    .put(routes.error);
app.route('/estadisticaPregunta/:materia')
    .get(routes.get_estadistica_preguntas)
    .post(routes.error)
    .put(routes.error);
app.route('/detalleParticipante')
    .get(routes.error)
    .post(routes.post_detalle_participante)
    .put(routes.error);
app.route('/ingresoAdministrador')
    .get(routes.get_ingreso_administrador)
    .post(routes.error)
    .put(routes.error);
app.route('/eliminarUsuario')
    .get(routes.error)
    .post(routes.post_eliminar_usuario)
    .put(routes.error);
app.route('/recuperarContrasenia')
    .get(routes.get_recuperar_contrasenia)
    .post(routes.post_recuperar_contrasenia)
    .put(routes.error);
app.route('/cambiarContrasenia')
    .get(routes.get_cambiar_contrasenia)
    .post(routes.post_cambiar_contrasenia)
    .put(routes.error);
app.route('/partidaFinalizada')
    .get(routes.error)
    .post(routes.post_partida_finalizada)
    .put(routes.error);
app.route('/salirPartida')
    .get(routes.error)
    .post(routes.post_salir_partida)
    .put(routes.error);
app.route('/intentos')
    .get(routes.get_intentos)
    .post(routes.error)
    .put(routes.error);
app.route('/detalleIntentos')
    .get(routes.error)
    .post(routes.post_detalle_intentos)
    .put(routes.error);


// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
io.on('connection', function (socket) {
    io.sockets.emit('tuID');
    socket.on('nuevaPartida', function (room, rol, informacionJugadores, usuario, idMateria) {
        socket.join(room);
        let indicePartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (indicePartida < 0) {
            partidas.push(new partida(room));
            for (let j = 0; j < informacionJugadores.length; j++) {
                insertarDatosJugador(partidas.length - 1, informacionJugadores[j].iconoEquipo, informacionJugadores[j].nombreEquipo);
                descargarPreguntas(partidas.length - 1, usuario, idMateria);
            }
        }
        else {
            console.log("La partida ya se encuentra creada en el array de partidas");
        }
    });
    socket.on('verificarPartida', function (room) {
        let indicePartida = consultarIdPartida(room);
        let arrayJugadores = [];
		socket.join(room);
        if (indicePartida >= 0) {
            for (let i = 0; i < partidas[indicePartida].jugadores.length; i++) {
                if (partidas[indicePartida].jugadores[i].listo == 0) {
                    arrayJugadores.push(partidas[indicePartida].jugadores[i])
                }
            }
        }
        io.sockets.in(room).emit('confirmacionPartida', arrayJugadores, indicePartida);
    });
    socket.on('verificarEquipo', function (room, nombreEquipo) {
        var indicePartida = consultarIdPartida(room);
        var indiceJugador = consultarIdJugador(indicePartida, nombreEquipo);
        if (partidas[indicePartida].jugadores[indiceJugador].idSocket == "") {
            io.sockets.in(room).emit('confirmacionEquipo', true)
        } else {
            io.sockets.in(room).emit('confirmacionEquipo', false)
        }
    });
    socket.on('verificarInicioPartida', function (room) {
        let indicePartida = consultarIdPartida(room);
        let numeroJugadoresConectados = 0;
        if (indicePartida >= 0) {
            for (let i = 0; i < partidas[indicePartida].jugadores.length; i++) {
                if (partidas[indicePartida].jugadores[i].idSocket != "") {
                    numeroJugadoresConectados++;
                }
            }
            if (numeroJugadoresConectados > 0) {
                io.sockets.in(room).emit('confirmacionInicioPartida', true);
            }else {io.sockets.in(room).emit('confirmacionInicioPartida', false);}
        } else {
            console.log("La partida ingresada no existe");
        }
    });
    socket.on('new player', function (room, rol, nombreEquipoJugar) {
        let indicePartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (indicePartida >= 0) {
            switch (rol) {
                case "facilitador" :
                    socket.join(room);
                    io.sockets.in(room).emit("nombreRol", "Facilitador");
                    break;
                case "participante" :
                    let nombreEquipo = nombreEquipoJugar.replace("+", " ");
                    let indiceJugador = partidas[indicePartida].jugadores.map(function (e) {
                        return e.nombreEquipo
                    }).indexOf(nombreEquipo);

                    if (indiceJugador >= 0) {
                        if (partidas[indicePartida].jugadores[indiceJugador].idSocket == "") {
                            socket.join(room);
                            io.sockets.in(room).emit("nombreRol", nombreEquipo);
                            partidas[indicePartida].jugadores[indiceJugador].idSocket = socket.id;
                            partidas[indicePartida].turnoJugadores = [];
                            for (let i = 0; i < partidas[indicePartida].jugadores.length; i++) {
                                if (partidas[indicePartida].jugadores[i].idSocket != "") {
                                    partidas[indicePartida].turnoJugadores.push(partidas[indicePartida].jugadores[i].idSocket);
                                }
                            }
                            actualizarOrdenPartidas(room);
                            if (partidas[indicePartida].jugadores.length == partidas[indicePartida].turnoJugadores.length) {
                                Partida.findOne({idPartida: partidas[indicePartida].nombrePartida}, function (error, doc) {
                                    if (error) {
                                        console.log("Error en consultar la partida desde la BDD de las partidas: " + error);
                                    }
                                    if (doc != null) {
                                        let jugadoresPartida = [];
                                        for (let x = 0; x < partidas[indicePartida].jugadores.length; x++) {
                                            let jugadorPartida = {
                                                idSocket: partidas[indicePartida].jugadores[x].idSocket,
                                                nombre: partidas[indicePartida].jugadores[x].nombreEquipo,
                                                iconoEquipo: partidas[indicePartida].jugadores[x].iconoEquipo
                                            };
                                            jugadoresPartida.push(jugadorPartida);
                                        }
                                        doc.jugadores = jugadoresPartida;
                                        doc.save(function (err) {
                                            if (err) {
                                                console.log("Error al guardar los jugadores en la colección de partidas: " + err);
                                            } else {
                                                console.log("Se han guardado la información de los jugadores en la colección de las partidas");
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            io.sockets.in(room).emit("error", "El equipo: " + nombreEquipo + " ya se ha conectado");
							socket.join(room);
							io.sockets.in(room).emit("nombreRol", "Espectador");
                        }
                    }
                    else {
                        console.log("El nombre de equipo ingresado no es válido" + nombreEquipo);
                    }
                    break;
                case "espectador":
                default :
                    socket.join(room);
                    io.sockets.in(room).emit("nombreRol", "Espectador");
                    break;
            }
        }
        else {
            console.log("El código de partida ingresada no es válido" + room);
        }
    });
    socket.on('inicio', function (room, rol, nombreEquipoJugar) {
        var indicePartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (indicePartida >= 0) {
            if (rol == "espectador") {
                socket.join(room);
                io.sockets.in(room).emit("nombreRol", "Espectador");
            } else {
                if (rol == "facilitador") {
                    socket.join(room);
                    io.sockets.in(room).emit("nombreRol", "Profesor");
                }
                else {
                    if (rol == "participante") {
                        socket.join(room);
                        var nombreEquipo = nombreEquipoJugar.replace("+", " ");
                        var idJugador = partidas[indicePartida].jugadores.map(function (e) {
                            return e.nombreEquipo
                        }).indexOf(nombreEquipo);
                        if (idJugador >= 0) {
                            partidas[indicePartida].jugadores[idJugador].listo = 1;
                        }
                        else {
                            io.sockets.in(room).emit("error", "El equipo: " + nombreEquipo + " ya se ha conectado");
                        }
                    }
                    else {
                        console.log("El nombre de equipo ingresado no es válido" + nombreEquipoJugar);
                    }
                }
            }
            actualizarJugadoresIngresados(room);
        } else {
            console.log("El código de partida ingresada no es válido" + room);
        }
    });
    socket.on('disconnect', function () {
        // remove disconnected player
        let indicePartida = -1;
        let indiceJugador = -1;
        for (let i = 0; i < partidas.length; i++) {
            for (let j = 0; j < partidas[i].jugadores.length; j++) {
                if (socket.id == partidas[i].jugadores[j].idSocket) {
                    indicePartida = i;
                    indiceJugador = j;
                    break;
                }
            }
        }
        if ((indicePartida > -1) && (indiceJugador > -1)) {
            let indiceTurnoJugador = -1;
            for (let k = 0; k < partidas[indicePartida].turnoJugadores.length; k++) {
                if (partidas[indicePartida].turnoJugadores[k] == socket.id) {
                    indiceTurnoJugador = k;
                    break;
                }
            }
            partidas[indicePartida].turnoJugadores.splice(indiceTurnoJugador, 1);
            actualizarOrdenPartidas(partidas[indicePartida].nombrePartida);
        }
    });
    /*   socket.on('nuevo array', function (data, room) {
           var idPartida = consultarIdPartida(room);
           if (idPartida >= 0) {
               partidas[idPartida].turnoJugadores = data;
               actualizarOrdenPartidas(room);
           }
       });*/
    socket.on('iniciarPartida', function (room) {
        let idPartida = consultarIdPartida(room);
        if (idPartida >= 0) {
            Partida.findOne({idPartida: partidas[idPartida].nombrePartida}, function (error, doc) {
                if (error) {
                    console.log("Error en la busqueda de la partida en la BDD: " + error);
                }
                else {
                    if (doc == null) {
                        let partida = new Partida({
                            idPartida: partidas[idPartida].nombrePartida,
                            jugadores: [],
                            turnoJugadores: []
                        });
                        partida.save(function (err) {
                            if (err) return console.log(err);
                        })
                    }
                }
            });
            io.sockets.in(room).emit('unirPartida');
        }
    });
    socket.on('dados', function (dado1, dado2, room, dadoAnterior1, dadoAnterior2, numCasillasMoverse, misterio) {
        var idPartida = consultarIdPartida(room);
        var idJugador = consultarIdJugadorSocket(idPartida, socket.id);
        partidas[idPartida].dadoP1 = dado1;
        partidas[idPartida].dadoP2 = dado2;
        partidas[idPartida].dadoAnteriorP1 = dadoAnterior1;
        partidas[idPartida].dadoAnteriorP2 = dadoAnterior2;
        partidas[idPartida].jugadores[idJugador].numCasillasMoverseP = numCasillasMoverse;
        if (misterio == 1) {
            partidas[idPartida].jugadores[idJugador].maldicion = 0;
        }
        partidas[idPartida].jugadores[idJugador].moverseA = partidas[idPartida].jugadores[idJugador].moverseA + numCasillasMoverse;
        ((partidas[idPartida].jugadores[idJugador].moverseA) > 34 ? partidas[idPartida].jugadores[idJugador].moverseA = 34 : "");

        var numDesafioMostrarse = mostrarDesafio(partidas[idPartida].jugadores[idJugador], numCasillasMoverse, partidas[idPartida].colorM);

        if (numDesafioMostrarse == -1) {
            numDesafioMostrarse = Math.floor(Math.random() * 3);
        }
        io.sockets.in(room).emit('dados', dado1, dado2, dadoAnterior1, dadoAnterior2, numDesafioMostrarse, socket.id);
    });
    socket.on('moverJugador', function (room) {
        var gameTime = Date.now();
        let indicePartida = consultarIdPartida(room);
        if (indicePartida > -1) {
            for (let j = 0; j < partidas[indicePartida].jugadores.length; j++) {
                if (partidas[indicePartida].jugadores[j].idSocket == socket.id) {
                    if (!partidas[indicePartida].jugadores[j].processMovement(gameTime, room, socket.id)) {
                        if (partidas[indicePartida].jugadores[j].casilla < 34) {
                            if (partidas[indicePartida].jugadores[j].canMoveUp()) {
                                partidas[indicePartida].jugadores[j].moveUp(gameTime);
                            }
                            else if (partidas[indicePartida].jugadores[j].canMoveDown()) {
                                partidas[indicePartida].jugadores[j].moveDown(gameTime);
                            }
                            else if (partidas[indicePartida].jugadores[j].canMoveLeft()) {
                                partidas[indicePartida].jugadores[j].moveLeft(gameTime);
                            }
                            else if (partidas[indicePartida].jugadores[j].canMoveRight()) {
                                partidas[indicePartida].jugadores[j].moveRight(gameTime);
                            }
                        }
                        else {
                            io.sockets.in(room).emit('partida', partidas[indicePartida]);
                        }
                    }
                }
            }
        }
    });
    socket.on('solicitarPreguntaOpcionMultiple', function (room) {
        var idPartida = consultarIdPartida(room);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('respondiendoIndicePreguntaOpcionMultiple', indiceRandomicoOpcionMultiple(idPartida));
    });
    socket.on('solicitarPreguntaUnir', function (room) {
        var idPartida = consultarIdPartida(room);
        var contador = partidas[idPartida].preguntasUnirVoltear.length;
        var arrayIndices = [];
        if (contador < 4) {
            for (var i = 0; i < partidas[idPartida].preguntasUnirVoltear.length; i++) {
                partidas[idPartida].preguntasUnirVoltear[i].usada == false;
            }
            contador = partidas[idPartida].preguntasUnirVoltear.length;
        }
        for (var i = 0; i < 4; i++) {
            var indice = indiceRandomicoUnirVoltear(idPartida);
            while (arrayIndices.indexOf(indice) != -1) {
                indice = indiceRandomicoUnirVoltear(idPartida);
            }
            partidas[idPartida].preguntasUnirVoltear[indice].usada == true;
            contador--;
            arrayIndices.push(indice);
        }
        partidas[idPartida].contadorPreguntasLibresUnirVoltear = contador;
        var arrayTexto = desordenarTextoUnir(idPartida, arrayIndices);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('respondiendoIndicePreguntaUnir', arrayIndices, arrayTexto);
    });
    socket.on('solicitarPreguntaVoltear', function (room) {
        var idPartida = consultarIdPartida(room);
        var contador = partidas[idPartida].preguntasUnirVoltear.length;
        var arrayIndices = [];
        if (contador < 4) {
            for (var i = 0; i < partidas[idPartida].preguntasUnirVoltear.length; i++) {
                partidas[idPartida].preguntasUnirVoltear[i].usada = false;
            }
            contador = partidas[idPartida].preguntasUnirVoltear.length;
        }
        for (var j = 0; j < 8; j++) {
            var indice = indiceRandomicoUnirVoltear(idPartida);
            while (arrayIndices.indexOf(indice) != -1) {
                indice = indiceRandomicoUnirVoltear(idPartida);
            }
            partidas[idPartida].preguntasUnirVoltear[indice].usada = true;
            contador--;
            arrayIndices.push(indice);
        }
        partidas[idPartida].contadorPreguntasLibresUnirVoltear = contador;
        var memory_array = [];
        for (var k = 0; k < arrayIndices.length; k++) {
            memory_array.push(partidas[idPartida].preguntasUnirVoltear[arrayIndices[k]].imagen);
            memory_array.push(partidas[idPartida].preguntasUnirVoltear[arrayIndices[k]].imagen);
        }
        memory_array.memory_tile_shuffle();
        io.sockets.in(partidas[idPartida].nombrePartida).emit('respondiendoIndicePreguntaVoltear', memory_array);
    });
    socket.on('parEncontrado', function (room, memory_tile_ids) {
        var idPartida = consultarIdPartida(room);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('enviandoParEncontrado', memory_tile_ids, socket.id);
    });
    socket.on('respuestaOpcionMultiple', function (room, botonSeleccionado) {
        var idPartida = consultarIdPartida(room);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('enviandoRespuestaOpcionMultiple', botonSeleccionado, socket.id);
    });
    socket.on('respuestaUnir', function (room, respuestaUnir) {
        var idPartida = consultarIdPartida(room);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('enviandoRespuestaUnir', respuestaUnir, socket.id);
    });
    socket.on('verificarUnir', function (room) {
        var idPartida = consultarIdPartida(room);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('enviandoVerificarUnir', socket.id);
    });
    socket.on('pasarTurno', function (room) {
        let idPartida = consultarIdPartida(room);
        let idJugador = consultarIdJugadorSocket(idPartida, socket.id);
        partidas[idPartida].jugadores[idJugador].numCasillasMoverseP = 0;
        partidas[idPartida].jugadores[idJugador].moverseA = partidas[idPartida].jugadores[idJugador].casilla;
        let i = partidas[idPartida].turnoJugadores.shift();
        partidas[idPartida].turnoJugadores.push(i);
        actualizarOrdenPartidas(room);
    });
    socket.on('tiempoTerminado', function (room) {
        let indicePartida = consultarIdPartida(room);
        io.sockets.in(partidas[indicePartida].nombrePartida).emit('avisoTiempoTerminado', socket.id);
    });
    socket.on('darLaVuelta', function (room) {
        let idPartida = consultarIdPartida(room);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('enviandoDarLaVuelta', socket.id);
    });
    socket.on('partidaCancelada', function (room) {
        Partida.deleteOne({idPartida: room}, function (err) {
            if (err) {
                console.log("No se elimino la partida: " + err);
            }
            else {
                console.log("Se elimino correctamente la partida: " + err);
                io.sockets.in(partidas[consultarIdPartida(room)].nombrePartida).emit('partidaCancelada', socket.id);
            }
        });
    });
});
setInterval(function () {
    for (let i = 0; i < partidas.length; i++) {
        io.sockets.in(partidas[i].nombrePartida).emit('partida', partidas[i]);
    }
}, 1000 / 30);

function seleccionarColor(filasN, columnasN, gameMapN,) {
    let indice = 0;
    let colorMapN = [];
    for (let y = 0; y < filasN; ++y) {
        for (let x = 0; x < columnasN; ++x) {
            switch (gameMapN[((y * columnasN) + x)]) {
                case -1:
                    colorMapN[indice] = -1;
                    indice++;
                    break;
                default:
                    let colorA = Math.floor(Math.random() * 3);
                    // 0 = Unir voltear - amarillo
                    // 1 = Emparejar - rosado
                    // 2 = Opción múltiple - azul
                    //let colorA = 0;
                    let colorAnterior = -1;
                    while (colorA == colorAnterior) {
                        colorA = Math.floor(Math.random() * 3);
                    }
                    colorAnterior = colorA;
                    switch (colorA) {
                        case 0:
                            colorMapN[indice] = 0;
                            indice++;
                            break;
                        case 1:
                            colorMapN[indice] = 1;
                            indice++;
                            break;
                        case 2:
                            colorMapN[indice] = 2;
                            indice++;
                            break;
                        default:
                    }
            }
        }
    }
    return colorMapN;
}

function actualizarOrdenPartidas(room) {
    let idPartida = consultarIdPartida(room);
    io.sockets.in(room).emit('turnoPartida', partidas[idPartida].turnoJugadores);
}

function actualizarJugadoresIngresados(room) {
    var idPartida = consultarIdPartida(room);
    var jugadoresConectados = [];
    for (var i = 0; i < partidas[idPartida].jugadores.length; i++) {
        if (partidas[idPartida].jugadores[i].listo == 1) {
            jugadoresConectados.push(partidas[idPartida].jugadores[i]);
        }
    }
    io.sockets.in(room).emit('ingresoJugadores', jugadoresConectados);
}

function consultarIdPartida(partida) {
    return partidas.map(function (e) {
        return e.nombrePartida
    }).indexOf(partida);
}

function consultarIdJugador(idPartida, nombreEquipo) {
    return partidas[idPartida].jugadores.map(function (e) {
        return e.nombreEquipo
    }).indexOf(nombreEquipo);
}

function consultarIdJugadorSocket(idPartida, idSocket) {
    return partidas[idPartida].jugadores.map(function (e) {
        return e.idSocket
    }).indexOf(idSocket);
}

Character.prototype.placeAt = function (x, y) {
    this.tileFrom = [x, y];
    this.tileTo = [x, y];
    this.position = [((anchoCasilla * x) + ((anchoCasilla - this.dimensions[0]) / 2)), ((altoCasilla * y) + ((altoCasilla - this.dimensions[1]) / 2))];
};
Character.prototype.processMovement = function (t, roomActual, idSocket) {
    var indicePartidaActual = consultarIdPartida(roomActual);
    var indiceJugadorActual = consultarIdJugadorSocket(indicePartidaActual, idSocket);
    if (this.tileFrom[0] == this.tileTo[0] && this.tileFrom[1] == this.tileTo[1]) {
        return false;
    }
    if (this.casilla == 34)  {
        partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = 0;
        if (partidas[indicePartidaActual].lugaresJugadores.indexOf(this.idSocket) == -1) {
            partidas[indicePartidaActual].lugaresJugadores.push(this.idSocket);
            partidas[indicePartidaActual].turnoJugadores.splice(partidas[indicePartidaActual].turnoJugadores.indexOf(this.idSocket), 1);
            io.sockets.in(roomActual).emit('ocultarBoton', idSocket);
        }
        actualizarOrdenPartidas(roomActual);
        if (partidas[indicePartidaActual].turnoJugadores.length < 2) {
            if (partidas[indicePartidaActual].lugaresJugadores.length != partidas[indicePartidaActual].jugadores.length) {
				let jugadoresFaltantes = [];
                for (let x = 0; x < partidas[indicePartidaActual].jugadores.length; x++) {
                    console.log("El index: "+partidas[indicePartidaActual].lugaresJugadores.indexOf(partidas[indicePartidaActual].jugadores[x].idSocket));
					if(partidas[indicePartidaActual].lugaresJugadores.indexOf(partidas[indicePartidaActual].jugadores[x].idSocket) < 0){
						jugadoresFaltantes.push(partidas[indicePartidaActual].jugadores[x].idSocket);
					}
                }
				while(jugadoresFaltantes.length> 0)
				{
					let mayor=-1;
					let siguienteJugador="";
					for (let y = 0; y < jugadoresFaltantes.length; y++) {
						let indice = partidas[indicePartidaActual].jugadores.map(function (e){return e.idSocket; }).indexOf(jugadoresFaltantes[y]);
						if(indice > -1){
							if(partidas[indicePartidaActual].jugadores[indice].casilla > mayor){
								mayor = partidas[indicePartidaActual].jugadores[indice].casilla;
								siguienteJugador = jugadoresFaltantes[y];
							}
						}
					}
					partidas[indicePartidaActual].lugaresJugadores.push(siguienteJugador);
					jugadoresFaltantes.splice(jugadoresFaltantes.indexOf(siguienteJugador), 1);
				}
				
            }
            if (partidas[indicePartidaActual].lugaresJugadores.length == partidas[indicePartidaActual].jugadores.length) {
                Partida.findOne({idPartida: partidas[indicePartidaActual].nombrePartida}, function (error, doc) {
                    if (error) {
                        console.log("Error en la busqueda de la partida en la BDD: " + error);
                    }
                    else {
                        if (doc != null) {
                            doc.turnoJugadores = partidas[indicePartidaActual].lugaresJugadores;
                            doc.save(function (err, partidaF) {
                                if (err) return console.log(err);
                                io.sockets.in(roomActual).emit('partidaFinalizada');
                            })
                        }
                        else {
                            console.log("La partida no se encuentra en la BD");
                        }
                    }
                });
            }
        }

    }
    if ((t - this.timeMoved) >= this.delayMove) {
        this.placeAt(this.tileTo[0], this.tileTo[1]);
        if (partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP > 1) {
            if (this.canMoveDirection(this.direction)) {
                this.moveDirection(this.direction, t);
            }
            else {
                this.nuevaDireccion();
                this.moveDirection(this.direction, t);
            }
            partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP - 1;
            if (this.casilla < this.moverseA) {
                this.casilla += 1;
            }
            io.sockets.in(partidas[indicePartidaActual].nombrePartida).emit('partida', partidas[indicePartidaActual]);
        }
        else {
            partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = 0;
            partidas[indicePartidaActual].jugadores[indiceJugadorActual].casilla = partidas[indicePartidaActual].jugadores[indiceJugadorActual].moverseA;
            let casillaDeLlegada = partidas[indicePartidaActual].jugadores[indiceJugadorActual].moverseA;
            if (casillaDeLlegada == 7 || casillaDeLlegada == 13 || casillaDeLlegada == 21 || casillaDeLlegada == 27) {
                let misterioAsignado = Math.floor(Math.random() * 2);
                if (misterioAsignado == 1) {
                    partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = Math.floor(Math.random() * 3 + 1);
                    io.sockets.in(partidas[indicePartidaActual].nombrePartida).emit('mensajeMisterio', 1, partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP);
                    partidas[indicePartidaActual].jugadores[indiceJugadorActual].moverseA += partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP;
                } else {
                    io.sockets.in(partidas[indicePartidaActual].nombrePartida).emit('mensajeMisterio', 0, partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP);
                    partidas[indicePartidaActual].jugadores[indiceJugadorActual].maldicion = 1;
                }
            }

            if (this.casilla != 34) {
                let j = partidas[indicePartidaActual].turnoJugadores.shift();
                partidas[indicePartidaActual].turnoJugadores.push(j);
                actualizarOrdenPartidas(roomActual);
            }

            if (partidas[indicePartidaActual].turnoJugadores.length != 0) {
                partidas[indicePartidaActual].jugadores[partidas[indicePartidaActual].jugadores.map(function (value) {
                    return value.idSocket
                }).indexOf(partidas[indicePartidaActual].turnoJugadores[0])].boton = 0;
            }
        }
    }
    else {
        this.position[0] = (this.tileFrom[0] * anchoCasilla) + ((anchoCasilla - this.dimensions[0]) / 2);
        this.position[1] = (this.tileFrom[1] * altoCasilla) + ((altoCasilla - this.dimensions[1]) / 2);

        if (this.tileTo[0] != this.tileFrom[0]) {
            var diff = (anchoCasilla / this.delayMove) * (t - this.timeMoved);
            this.position[0] += (this.tileTo[0] < this.tileFrom[0] ? 0 - diff : diff);
        }
        if (this.tileTo[1] != this.tileFrom[1]) {
            var diff = (altoCasilla / this.delayMove) * (t - this.timeMoved);
            this.position[1] += (this.tileTo[1] < this.tileFrom[1] ? 0 - diff : diff);
        }

        this.position[0] = Math.round(this.position[0]);
        this.position[1] = Math.round(this.position[1]);
    }
    return true;
};
Character.prototype.canMoveTo = function (x, y) {
    if (x < 0 || x >= columnas || y < 0 || y >= filas) {
        return false;
    }
    else {
        if ([gameMap[toIndex(x, y)]] == -1) {
            return false;
        }
        else {
            return [gameMap[((y * columnas) + x)]] > this.casilla;
        }
    }
};
Character.prototype.canMoveUp = function () {
    return this.canMoveTo(this.tileFrom[0], this.tileFrom[1] - 1);
};
Character.prototype.canMoveDown = function () {
    return this.canMoveTo(this.tileFrom[0], this.tileFrom[1] + 1);
};
Character.prototype.canMoveLeft = function () {
    return this.canMoveTo(this.tileFrom[0] - 1, this.tileFrom[1]);
};
Character.prototype.canMoveRight = function () {
    return this.canMoveTo(this.tileFrom[0] + 1, this.tileFrom[1]);
};
Character.prototype.canMoveDirection = function (d) {
    switch (d) {
        case directions.up:
            return this.canMoveUp();
        case directions.down:
            return this.canMoveDown();
        case directions.left:
            return this.canMoveLeft();
        default:
            return this.canMoveRight();
    }
};
Character.prototype.nuevaDireccion = function () {
    if (this.canMoveRight()) {
        this.direction = directions.right
    }
    else {
        if (this.canMoveLeft()) {
            this.direction = directions.left
        }
        else {
            if (this.canMoveDown()) {
                this.direction = directions.down
            }
            else {
                if (this.canMoveUp()) {
                    this.direction = directions.up
                }
            }
        }
    }
};
Character.prototype.moveLeft = function (t) {
    this.tileTo[0] -= 1;
    this.timeMoved = t;
    this.direction = 3;

};
Character.prototype.moveRight = function (t) {
    this.tileTo[0] += 1;
    this.timeMoved = t;
    this.direction = 1;

};
Character.prototype.moveUp = function (t) {
    this.tileTo[1] -= 1;
    this.timeMoved = t;
    this.direction = 0;

};
Character.prototype.moveDown = function (t) {
    this.tileTo[1] += 1;
    this.timeMoved = t;
    this.direction = 2;

};
Character.prototype.moveDirection = function (d, t) {
    switch (d) {
        case directions.up:
            return this.moveUp(t);
        case directions.down:
            return this.moveDown(t);
        case directions.left:
            return this.moveLeft(t);
        default:
            return this.moveRight(t);
    }
};

function toIndex(x, y) {
    return ((y * columnas) + x);
}

function insertarDatosJugador(indicePartida, iconoEquipo, nombreEquipo) {
    partidas[indicePartida].jugadores.push(new Character(iconoEquipo, ((anchoCasilla * 2) + (anchoCasilla / 4)), (altoCasilla * (filas - 1) + (altoCasilla / 4)), nombreEquipo));
    partidas[indicePartida].jugadores[partidas[indicePartida].jugadores.length - 1].numCasillasMoverseP = 0;
    partidas[indicePartida].jugadores[partidas[indicePartida].jugadores.length - 1].boton = 0;
}

function mostrarDesafio(jugadorAct, numCasillasMoverse, colorM) {
    let colorCa = -1;
    for (let x = 0; x < filas; ++x) {
        for (let y = 0; y < columnas; ++y) {
            if ((gameMap[((x * columnas) + y)]) == (jugadorAct.casilla + numCasillasMoverse)) {
                colorCa = colorM[((x * columnas) + y)]
                break;
            }
        }
    }
    return colorCa;
}

Array.prototype.memory_tile_shuffle = function () {
    var i = this.length, j, temp;
    while (--i > 0) {
        j = Math.floor(Math.random() * i + 1);
        temp = this[j];
        this[j] = this[i];
        this[i] = temp;
    }
};

function newBoard() {
    tiles_flipped = 0;
    return memory_array.memory_tile_shuffle();
}

function descargarPreguntas(idPartida, idProfesor, idMateria) {
    partidas[idPartida].preguntasOpcionMultiple = baseDatos.obtenerPreguntasOpcionMultiple(idProfesor, idMateria);
    partidas[idPartida].preguntasUnirVoltear = baseDatos.obtenerPreguntasUnir(idProfesor, idMateria);
}

function indiceRandomicoOpcionMultiple(idPartida) {
    var arrayRandomico = [];
    var indiceRandomicoP = Math.floor(Math.random() * partidas[idPartida].preguntasOpcionMultiple.length);
    arrayRandomico.push(indiceRandomicoP);
    var contador = 0;
    for (var i = 0; i < partidas[idPartida].preguntasOpcionMultiple.length; i++) {
        if (partidas[idPartida].preguntasOpcionMultiple[i].usada == true) {
            contador++;
        }
    }
    if (partidas[idPartida].preguntasOpcionMultiple.length == contador) {
        for (var i = 0; i < partidas[idPartida].preguntasOpcionMultiple.length; i++) {
            partidas[idPartida].preguntasOpcionMultiple[i].usada = false;
        }
    }

    while (partidas[idPartida].preguntasOpcionMultiple[indiceRandomicoP].usada == true) {
        indiceRandomicoP = Math.floor(Math.random() * partidas[idPartida].preguntasOpcionMultiple.length);
    }

    partidas[idPartida].preguntasOpcionMultiple[indiceRandomicoP].usada = true;
    return indiceRandomicoP;
}

function indiceRandomicoUnirVoltear(idPartida) {
    var indiceRandomicoP = Math.floor(Math.random() * partidas[idPartida].preguntasUnirVoltear.length);
    return indiceRandomicoP;
}

function desordenarTextoUnir(idPartida, arrayIndices) {
    var vectorTextoUnir = [];
    for (var k = 0; k < arrayIndices.length; k++) {
        vectorTextoUnir.push(partidas[idPartida].preguntasUnirVoltear[arrayIndices[k]].texto);
    }
    let j, x, i;
    for (i = vectorTextoUnir.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * i + 1);
        x = vectorTextoUnir[i];
        vectorTextoUnir[i] = vectorTextoUnir[j];
        vectorTextoUnir[j] = x;
    }
    return vectorTextoUnir;
}
