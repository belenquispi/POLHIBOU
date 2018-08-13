// Dependencies
var express = require('express');
var routes = require('./routes');
var session = require('express-session');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
//var correo = require('./correo');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var firebase = require("./firebase");
var baseDatos = require("./baseDatos");
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');

var Profesor = require("./models/profesor").Profesor;
var Estudiante = require("./models/estudiante").Estudiante;



var config = {
    apiKey: "AIzaSyARHMJb3ta8XMRb0lFRjUSgSP6RCZiayVo",
    authDomain: "bpmnplaydb.firebaseapp.com",
    databaseURL: "https://bpmnplaydb.firebaseio.com",
    projectId: "bpmnplaydb",
    storageBucket: "bpmnplaydb.appspot.com",
    messagingSenderId: "559035240947", timestampsInSnapshots: true
};

app.set('port', 5000);
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: 'Esto es secreto',
    resave: true,
    saveUninitialized: true
}));
app.use('/static', express.static(__dirname + '/static' + ''));
// create application/json parser
app.use(bodyParser.json());
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: true}));

var gameMap = [
    13, 14, 15, 16, 17, 18, 19, 20, 21,
    12, 0, 0, 0, 0, 0, 0, 0, 22,
    11, 10, 9, 0, 'B', 0, 25, 24, 23,
    0, 0, 8, 0, 'P', 0, 26, 0, 0,
    0, 0, 7, 0, 'M', 0, 27, 0, 0,
    4, 5, 6, 0, 'N', 0, 28, 29, 30,
    3, 0, 0, 0, '>', 0, 0, 0, 31,
    2, 1, 'I', 0, 0, 0, 34, 33, 32
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
        this.turnoJugadores = []
}

var partidas = [];

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
}

var directions = {
    up: 0,
    right: 1,
    down: 2,
    left: 3
};


/* --------------------------------------------- Routning */
app.get('/', routes.get_inicio);
app.get('/inicioSesion', routes.get_inicio_sesion);
app.post('/creacionCuenta', routes.post_creacion_cuenta);
app.post('/ingreso', routes.post_inicio_sesion);
app.get('/ingresoProfesor/', routes.get_ingreso_profesor);
app.get('/ingresoEstudiante', routes.get_ingreso_estudiante);
app.get('/salir', routes.salir);
app.post('/tablero', routes.post_tablero);
app.get('/ingresoProfesor/preguntasOpcionMultiple/:materia/ingresoOpcionMultiple/:materia', routes.get_opcion_multiple);
app.get('/unirVoltear/:materia', routes.get_unir_voltear);
//app.get('/unirVoltear', routes.get_unir_voltear);
app.get('/ingresoProfesor/creacionPartida/:materia', routes.get_creacion_partida);
app.post('/ingresoMateria', routes.post_ingreso_materia);
app.get('/ingresoProfesor/preguntasOpcionMultiple/:materia', routes.get_preguntas_opcion);
app.get('/ingresoProfesor/preguntasUnirVoltear/:materia', routes.get_preguntas_unir_voltear);
app.post('/ingresoProfesor/preguntasOpcionMultiple', routes.post_preguntas_opcion);
app.get('/ingresoProfesor/eliminarPreguntaOpcionMultiple/:idMateria', routes.get_eliminar_pregunta_opcion);
app.post('/detalleOpcionMultiple', routes.post_detalle_opcion_multiple);
app.get('/ingresoPartida', routes.get_ingreso_partida);
app.post('/agregarUnirVoltear', routes.post_agregar_unir_voltear);
app.post('/eliminarUnirVoltear', routes.post_eliminar_unir_voltear);
app.post('/agregarVariasUnirVoltear', routes.post_agregar_varias_unir_voltear);
app.post('/lobby', routes.post_lobby);
app.post('/lobbyParticipante', routes.post_lobby_pariticipante);

// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
   // correo.inicio();
});

// Add the WebSocket handlers
io.on('connection', function (socket) {
    io.sockets.emit('parametrosJuego');
    socket.on('nuevaPartida', function (room, rol, nombreIconoEquipos, usuario, idMateria) {
        socket.join(room);
        //seleccionarColor(filas, columnas, gameMap);
        var idPartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (idPartida >= 0) {
            if (partidas[idPartida].jugadores.length < 4) {
                for (var i = 0; i < nombreIconoEquipos.length; i++) {
                    insertarDatosJugador(idPartida, nombreIconoEquipos[i].iconoEquipo, nombreIconoEquipos[i].nombreEquipo);
                    descargarPreguntas(idPartida, usuario, idMateria);
                }
            }
        }
        else {
            partidas.push(new partida(room));
            for (var i = 0; i < nombreIconoEquipos.length; i++) {
                insertarDatosJugador(partidas.length - 1, nombreIconoEquipos[i].iconoEquipo, nombreIconoEquipos[i].nombreEquipo);
                descargarPreguntas(partidas.length - 1, usuario, idMateria);
            }
        }
    });
    socket.on('inicio', function (room, rol, nombreEquipoJugar) {
        console.log("room: " + room + " rol: " + rol + " nombreEquipoJugar: " + nombreEquipoJugar);
        var idPartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (idPartida >= 0) {
            console.log("222room: " + room + " rol: " + rol + " nombreEquipoJugar: " + nombreEquipoJugar);
            if (rol == "espectador") {
                socket.join(room);
                socket.emit("nombreRol", "Espectador");
            } else {
                if (rol == "profesor") {
                    socket.join(room);
                    socket.emit("nombreRol", "Profesor");
                }
                else {
                    if (rol == "jugador") {
                        socket.join(room);
                        console.log("333room: " + room + " rol: " + rol + " nombreEquipoJugar: " + nombreEquipoJugar);
                        var nombreEquipo = nombreEquipoJugar.replace("+", " ");
                        var idJugador = partidas[idPartida].jugadores.map(function (e) {
                            return e.nombreEquipo
                        }).indexOf(nombreEquipo);
                        if (idJugador >= 0) {
                            console.log("4444room: " + room + " rol: " + rol + " nombreEquipoJugar: " + nombreEquipoJugar);

                            partidas[idPartida].jugadores[idJugador].listo = 1;
                            actualizarJugadoresIngresados(room);
                        }
                        else {
                            socket.emit("error", "El equipo: " + nombreEquipo + " ya se ha conectado");
                        }
                    }
                    else {
                        console.log("El nombre de equipo ingresado no es válido" + nombreEquipo);
                    }
                }

            }
        } else {
            console.log("El código de partida ingresada no es válido" + room);
        }

    });
    socket.on('new player', function (room, rol, nombreEquipoJugar) {
        var idPartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (idPartida >= 0) {
            if (rol == "espectador") {
                socket.join(room);
                socket.emit("nombreRol", "Espectador");
            } else {
                if (rol == "profesor") {
                    socket.join(room);
                    socket.emit("nombreRol", "Profesor");
                }
                else {
                    if (rol == "jugador") {
                        var nombreEquipo = nombreEquipoJugar.replace("+", " ");
                        var idJugador = partidas[idPartida].jugadores.map(function (e) {
                            return e.nombreEquipo
                        }).indexOf(nombreEquipo);

                        if (idJugador >= 0) {
                            if (partidas[idPartida].jugadores[idJugador].idSocket == "") {
                                socket.join(room);
                                socket.emit("nombreRol", nombreEquipo);
                                partidas[idPartida].jugadores[idJugador].idSocket = socket.id;
                                partidas[idPartida].turnoJugadores = [];
                                for (var i = 0; i < partidas[idPartida].jugadores.length; i++) {
                                    if (partidas[idPartida].jugadores[i].idSocket != "") {
                                        partidas[idPartida].turnoJugadores.push(partidas[idPartida].jugadores[i].idSocket);
                                    }
                                }
                                actualizarOrdenPartidas(room);
                            }
                            else {
                                socket.emit("error", "El equipo: " + nombreEquipo + " ya se ha conectado");
                            }
                        }
                        else {
                            console.log("El nombre de equipo ingresado no es válido" + nombreEquipo);
                        }
                    }
                    else {
                        console.log("No se ha seleccionado un rol válido" + rol);
                    }
                }
            }
        } else {
            console.log("El código de partida ingresada no es válido" + room);
        }

    });
    socket.on('disconnect', function () {
        // remove disconnected player
        /*for (var i = 0 ; i < partidas.length; i++){
            var idJugador = partidas[i].jugadores.map(function (e) { return e.idSocket;}).indexOf(socket.id);
            if(idJugador >= 0)
            {	console.log("Se eliminara al sockect: " + socket.id);
                partidas[i].jugadores.splice(idJugador, 1);
                console.log("Los nuevos Jugadores: " + partidas[i].jugadores);
            }
            else{
                console.log(i+") La partida: "+partidas[i].nombrePartida+"no posee al jugador con el id: "+socket.id);
            }
        }*/
    });
    socket.on('nuevo array', function (data, room) {
        var idPartida = consultarIdPartida(room);
        if (idPartida >= 0) {
            partidas[idPartida].turnoJugadores = data;
            actualizarOrdenPartidas(room);
        }
    });
    socket.on('iniciarPartida', function (room) {
        var idPartida = consultarIdPartida(room);
        if (idPartida >= 0) {
            io.sockets.in(room).emit('unirPartida');
        }
    });
    socket.on('dados', function (dado1, dado2, room, dadoAnterior1, dadoAnterior2, numCasillasMoverse) {
        var idPartida = consultarIdPartida(room);
        partidas[idPartida].dadoP1 = dado1;
        partidas[idPartida].dadoP2 = dado2;
        partidas[idPartida].dadoAnteriorP1 = dadoAnterior1;
        partidas[idPartida].dadoAnteriorP2 = dadoAnterior2;
        partidas[idPartida].jugadores[partidas[idPartida].jugadores.map(function (e) {
            return e.idSocket
        }).indexOf(socket.id)].numCasillasMoverseP = numCasillasMoverse;
        partidas[idPartida].jugadores[partidas[idPartida].jugadores.map(function (e) {
            return e.idSocket
        }).indexOf(socket.id)].moverseA = partidas[idPartida].jugadores[partidas[idPartida].jugadores.map(function (e) {
            return e.idSocket
        }).indexOf(socket.id)].casilla + numCasillasMoverse;
        ((partidas[idPartida].jugadores[partidas[idPartida].jugadores.map(function (e) {
            return e.idSocket
        }).indexOf(socket.id)].moverseA) > 34 ? partidas[idPartida].jugadores[partidas[idPartida].jugadores.map(function (e) {
            return e.idSocket
        }).indexOf(socket.id)].moverseA = 34 : "");
        console.log("Numero de casillas a moverse");
        console.log(partidas[idPartida].jugadores[partidas[idPartida].jugadores.map(function (e) {
            return e.idSocket
        }).indexOf(socket.id)]);
        var numDesafioMostrarse = mostrarDesafio(partidas[idPartida].jugadores[partidas[idPartida].jugadores.map(function (e) {
            return e.idSocket
        }).indexOf(socket.id)], numCasillasMoverse, partidas[idPartida].colorM);
        if(numDesafioMostrarse == -1)
        {
            numDesafioMostrarse = Math.floor(Math.random() * 3);
        }
        io.sockets.in(room).emit('dados', dado1, dado2, dadoAnterior1, dadoAnterior2, numDesafioMostrarse, socket.id);
    });
    socket.on('moverJugador', function (room, gameTime) {
        for (var i = 0; i < partidas.length; i++) {
            if (partidas[i].nombrePartida == room) {
                for (var j = 0; j < partidas[i].jugadores.length; j++) {
                    if (partidas[i].jugadores[j].idSocket == socket.id) {
                        if (!partidas[i].jugadores[j].processMovement(gameTime, room, socket.id)) {
                            if (partidas[i].jugadores[j].casilla < 34) {
                                if (partidas[i].jugadores[j].canMoveUp()) {
                                    partidas[i].jugadores[j].moveUp(gameTime);
                                }
                                else if (partidas[i].jugadores[j].canMoveDown()) {
                                    partidas[i].jugadores[j].moveDown(gameTime);
                                }
                                else if (partidas[i].jugadores[j].canMoveLeft()) {
                                    partidas[i].jugadores[j].moveLeft(gameTime);
                                }
                                else if (partidas[i].jugadores[j].canMoveRight()) {
                                    partidas[i].jugadores[j].moveRight(gameTime);
                                }
                            }
                            else {
                                for (var i = 0; i < partidas.length; i++) {
                                    io.sockets.in(partidas[i].nombrePartida).emit('partida', partidas[i]);
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    socket.on('verificarPartida', function (room) {
        var idPartida = consultarIdPartida(room);
        var arrayJugadores = [];

        if (idPartida >= 0) {
            for(var i=0; i < partidas[idPartida].jugadores.length; i++)
            {
                if(partidas[idPartida].jugadores[i].listo == 0)
                {
                    arrayJugadores.push(partidas[idPartida].jugadores[i])
                }
            }
            socket.emit('confirmacionPartida', arrayJugadores)
        }
        else {
            socket.emit('confirmacionPartida', arrayJugadores);
        }
    });
    socket.on('verificarEquipo', function (room, nombreEquipo) {
        var idPartida = consultarIdPartida(room);
        var idJugador = consultarIdJugador(idPartida, nombreEquipo);
        if (partidas[idPartida].jugadores[idJugador].idSocket == "") {
            socket.emit('confirmacionEquipo', "true")
        } else {
            socket.emit('confirmacionEquipo', "false")
        }
    });
    socket.on('guardarPreguntaOpcionMultiple', function (preguntaOpcionMultiple) {
        firebase.insertarPreguntasOpcionMultiple(preguntaOpcionMultiple);
    });
    socket.on('guardarPreguntaUnirVoltear', function (preguntaUnirVoltear) {
        firebase.insertarPreguntasUnirVoltear(preguntaUnirVoltear);
    });
    socket.on('solicitarConfiguracion', function () {
        socket.emit('configuracion', config);
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
                partidas[idPartida].preguntasUnirVoltear[i].usada == false;
            }
            contador = partidas[idPartida].preguntasUnirVoltear.length;
        }
        for (var i = 0; i < 8; i++) {
            var indice = indiceRandomicoUnirVoltear(idPartida);
            while (arrayIndices.indexOf(indice) != -1) {
                indice = indiceRandomicoUnirVoltear(idPartida);
            }
            partidas[idPartida].preguntasUnirVoltear[indice].usada == true;
            contador--;
            arrayIndices.push(indice);
        }
        partidas[idPartida].contadorPreguntasLibresUnirVoltear = contador;
        var memory_array = [];
        for (var i = 0; i < arrayIndices.length; i++) {
            memory_array.push(partidas[idPartida].preguntasUnirVoltear[arrayIndices[i]].imagen);
            memory_array.push(partidas[idPartida].preguntasUnirVoltear[arrayIndices[i]].imagen);
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
        var idPartida = consultarIdPartida(room);
        var idJugador = consultarIdJugadorSocket(idPartida, socket.id);
        partidas[idPartida].jugadores[idJugador].numCasillasMoverseP = 0;
        partidas[idPartida].jugadores[idJugador].moverseA = partidas[idPartida].jugadores[idJugador].casilla;
        var i = partidas[idPartida].turnoJugadores.shift();
        partidas[idPartida].turnoJugadores.push(i);
        actualizarOrdenPartidas(room);
    });
    socket.on('darLaVuelta', function (room) {
        var idPartida = consultarIdPartida(room);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('enviandoDarLaVuelta', socket.id);
    })
});
setInterval(function () {
    for (var i = 0; i < partidas.length; i++) {
        io.sockets.in(partidas[i].nombrePartida).emit('partida', partidas[i]);
    }
}, 1000 / 60);

function seleccionarColor(filasN, columnasN, gameMapN,) {
    var indice = 0;
    var colorMapN = [];
    for (var y = 0; y < filasN; ++y) {
        for (var x = 0; x < columnasN; ++x) {
            switch (gameMapN[((y * columnasN) + x)]) {
                case 0:
                    colorMapN[indice] = -1;
                    indice++;
                    break;
                default:
                    // var colorA = Math.floor(Math.random() * 3);
                    // 0 = Unir voltear - amarillo
                    // 1 = Emparejar - rosado
                    // 2 = Opción múltiple - azul

                    var colorA =2;

                    var colorAnterior = -1;
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
    var idPartida = consultarIdPartida(room);
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
    var indicePartidaActual = partidas.map(function (e) {
        return e.nombrePartida;
    }).indexOf(roomActual);
    var indiceJugadorActual = partidas[indicePartidaActual].jugadores.map(function (e) {
        return e.idSocket;
    }).indexOf(idSocket);
    if (this.tileFrom[0] == this.tileTo[0] && this.tileFrom[1] == this.tileTo[1]) {
        return false;
    }
    if (this.casilla == 34) {
        partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = 1;
        io.sockets.in(roomActual).emit('ocultarBoton', idSocket);
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
            for (var i = 0; i < partidas.length; i++) {
                io.sockets.in(partidas[i].nombrePartida).emit('partida', partidas[i]);
            }
        }
        else {
            partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = 0;
            var i = partidas[indicePartidaActual].turnoJugadores.shift();
            if (this.casilla != 34) {
                partidas[indicePartidaActual].turnoJugadores.push(i);
            }
            else {
            }
            actualizarOrdenPartidas(roomActual);

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
    else if ([gameMap[toIndex(x, y)]] == 0) {
        return false;
    }
    else if ([gameMap[((y * columnas) + x)]] < this.casilla) {
        return false;
    }
    return true;
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
    this.casilla += 1;
};
Character.prototype.moveRight = function (t) {
    this.tileTo[0] += 1;
    this.timeMoved = t;
    this.direction = 1;
    this.casilla += 1;
};
Character.prototype.moveUp = function (t) {
    this.tileTo[1] -= 1;
    this.timeMoved = t;
    this.direction = 0;
    this.casilla += 1;
};
Character.prototype.moveDown = function (t) {
    this.tileTo[1] += 1;
    this.timeMoved = t;
    this.direction = 2;
    this.casilla += 1;
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
    var colorCa = -1;
    for (var x = 0; x < filas; ++x) {
        for (var y = 0; y < columnas; ++y) {
            if ((gameMap[((x * columnas) + y)]) == (jugadorAct.casilla + numCasillasMoverse)) {
                colorCa = colorM[((x * columnas) + y)];
            }else {
            }
        }
    }
    return colorCa;
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
    var j, x, i;
    for (i = vectorTextoUnir.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = vectorTextoUnir[i];
        vectorTextoUnir[i] = vectorTextoUnir[j];
        vectorTextoUnir[j] = x;
    }
    return vectorTextoUnir;
}


