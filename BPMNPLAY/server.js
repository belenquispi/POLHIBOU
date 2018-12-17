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
app.use('/static', express.static(__dirname + '/static' + ''));
// create application/json parser
app.use(bodyParser.json());
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: true}));

var gameMap = [
    13, 14, 15, 16, 17, 18, 19, 20, 21,
    12, -1, -1, -1, -1, -1, -1, -1, 22,
    11, 10, 9, -1, 'B', -1, 25, 24, 23,
    -1, -1, 8, -1, 'P', -1, 26, -1, -1,
    -1, -1, 7, -1, 'M', -1, 27, -1, -1,
    4, 5, 6, -1, 'N', -1, 28, 29, 30,
    3, -1, -1, -1, '>', -1, -1, -1, 31,
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
app.get('/', routes.get_inicio);
app.get('/inicioSesion', routes.get_inicio_sesion);
app.post('/creacionCuenta', routes.post_creacion_cuenta);
app.post('/ingreso', routes.post_inicio_sesion);
app.get('/ingresoFacilitador', routes.get_ingreso_profesor);
app.get('/ingresoParticipante', routes.get_ingreso_estudiante);
app.get('/salir', routes.salir);
app.route('/tablero')
    .get(routes.error)
    .post(routes.post_tablero)
    .put(routes.error);
app.get('/ingresoFacilitador/preguntasOpcionMultiple/:materia/ingresoOpcionMultiple/:materia', routes.get_opcion_multiple);
app.get('/unirVoltear/:materia', routes.get_unir_voltear);
app.get('/ingresoFacilitador/creacionPartida/:materia', routes.get_creacion_partida);
app.post('/ingresoMateria', routes.post_ingreso_materia);
app.get('/preguntasOpcionMultiple/:materia', routes.get_preguntas_opcion);
app.get('/ingresoFacilitador/preguntasUnirVoltear/:materia', routes.get_preguntas_unir_voltear);
app.post('/ingresoFacilitador/preguntasOpcionMultiple', routes.post_preguntas_opcion);
app.get('/ingresoFacilitador/eliminarPreguntaOpcionMultiple/:idMateria', routes.get_eliminar_pregunta_opcion);
app.post('/detalleOpcionMultiple', routes.post_detalle_opcion_multiple);
app.get('/ingresoPartida', routes.get_ingreso_partida);
app.post('/agregarUnirVoltear', routes.post_agregar_unir_voltear);
app.post('/eliminarUnirVoltear', routes.post_eliminar_unir_voltear);
app.post('/agregarVariasUnirVoltear', routes.post_agregar_varias_unir_voltear);
app.post('/lobby', routes.post_lobby);
app.post('/lobbyParticipante', routes.post_lobby_pariticipante);
app.post('/cambiarTipoMateria', routes.post_cambiar_tipo_materia);
app.post('/eliminarMateria', routes.post_eliminar_materia);
app.get('/validarCuenta', routes.get_validar_cuenta);
app.post('/confirmarCuenta', routes.post_confirmar_cuenta);
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
app.get('/estadisticaParticipante/:materia', routes.get_estadistica_participante);
app.get('/estadisticaPregunta/:materia', routes.get_estadistica_preguntas);
app.post('/detalleParticipante', routes.post_detalle_participante);
app.get('/ingresoAdministrador', routes.get_ingreso_administrador);
app.route('/recuperarContrasenia')
    .get(routes.get_recuperar_contrasenia)
    .post(routes.post_recuperar_contrasenia)
    .put(routes.error);
app.route('/cambiarContrasenia')
    .get(routes.get_cambiar_contrasenia)
    .post(routes.post_cambiar_contrasenia)
    .put(routes.error);
app.post('/partidaFinalizada', routes.post_partida_finalizada);
app.post('/salirPartida', routes.post_salir_partida);


// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
io.on('connection', function (socket) {
    io.sockets.emit('parametrosJuego');
    socket.on('nuevaPartida', function (room, rol, nombreIconoEquipos, usuario, idMateria) {
        socket.join(room);
        let idPartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (idPartida >= 0) {
            if (partidas[idPartida].jugadores.length < 4) {
                for (let i = 0; i < nombreIconoEquipos.length; i++) {
                    insertarDatosJugador(idPartida, nombreIconoEquipos[i].iconoEquipo, nombreIconoEquipos[i].nombreEquipo);
                    descargarPreguntas(idPartida, usuario, idMateria);
                }
            }
        }
        else {
            partidas.push(new partida(room));
            for (let j = 0; j < nombreIconoEquipos.length; j++) {
                insertarDatosJugador(partidas.length - 1, nombreIconoEquipos[j].iconoEquipo, nombreIconoEquipos[j].nombreEquipo);
                descargarPreguntas(partidas.length - 1, usuario, idMateria);
            }
        }
    });
    socket.on('inicio', function (room, rol, nombreEquipoJugar) {
        console.log("Se realizo uno emit de inicio");
        var idPartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (idPartida >= 0) {
            if (rol == "espectador") {
                socket.join(room);
                socket.emit("nombreRol", "Espectador");
            } else {
                if (rol == "facilitador") {
                    console.log("Inicio el profesor");
                    socket.join(room);
                    socket.emit("nombreRol", "Profesor");
                }
                else {
                    if (rol == "participante") {
                        socket.join(room);
                        console.log("Inicio el jugador : " + room + " rol: " + rol + " nombreEquipoJugar: " + nombreEquipoJugar);
                        var nombreEquipo = nombreEquipoJugar.replace("+", " ");
                        console.log("Inicio el jugador2 : " + room + " rol: " + rol + " nombreEquipoJugar: " + nombreEquipoJugar);
                        var idJugador = partidas[idPartida].jugadores.map(function (e) {
                            return e.nombreEquipo
                        }).indexOf(nombreEquipo);
                        if (idJugador >= 0) {
                            partidas[idPartida].jugadores[idJugador].listo = 1;
                        }
                        else {
                            socket.emit("error", "El equipo: " + nombreEquipo + " ya se ha conectado");
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
    socket.on('new player', function (room, rol, nombreEquipoJugar) {
        let idPartida = partidas.map(function (e) {
            return e.nombrePartida
        }).indexOf(room);
        if (idPartida >= 0) {
            if (rol == "espectador") {
                socket.join(room);
                socket.emit("nombreRol", "Espectador");
            } else {
                if (rol == "facilitador") {
                    socket.join(room);
                    socket.emit("nombreRol", "Facilitador");
                }
                else {
                    if (rol == "participante") {
                        let nombreEquipo = nombreEquipoJugar.replace("+", " ");
                        let idJugador = partidas[idPartida].jugadores.map(function (e) {
                            return e.nombreEquipo
                        }).indexOf(nombreEquipo);

                        if (idJugador >= 0) {
                            if (partidas[idPartida].jugadores[idJugador].idSocket == "") {
                                socket.join(room);
                                socket.emit("nombreRol", nombreEquipo);
                                partidas[idPartida].jugadores[idJugador].idSocket = socket.id;
                                partidas[idPartida].turnoJugadores = [];
                                for (let i = 0; i < partidas[idPartida].jugadores.length; i++) {
                                    if (partidas[idPartida].jugadores[i].idSocket != "") {
                                        partidas[idPartida].turnoJugadores.push(partidas[idPartida].jugadores[i].idSocket);
                                    }
                                }
                                actualizarOrdenPartidas(room);
                             /*   Partida.findOne({idPartida: partidas[idPartida].nombrePartida}, function (error, doc) {
                                    if(error){
                                        console.log("Error3 en consultar la partida desde la BDD: "+error)
                                    }
                                    if(doc != null){
                                        for(let x = 0; x < partidas[idPartida].jugadores.length; x++ ){
                                            let jugadorF = {
                                                idSocket: partidas[idPartida].jugadores[x].idSocket,
                                                nombre: partidas[idPartida].jugadores[x].nombreEquipo,
                                                iconoEquipo: partidas[idPartida].jugadores[x].iconoEquipo
                                            };
                                            if(doc.jugadores.map(function (jugador){
                                                return jugador.idSocket
                                            }).indexOf(partidas[idPartida].jugadores[x].idSocket) < 0)
                                            {
                                                console.log("El id es: "+doc.jugadores.map(function (jugador){
                                                    return jugador.idSocket
                                                }).indexOf(partidas[idPartida].jugadores[x].idSocket));
                                                doc.jugadores.push(jugadorF);
                                            }
                                        }
                                        doc.save(function (err) {
                                            if(err){
                                                console.log("Error al guardar los cambios: "+err);
                                            }else{
                                                console.log("Se han actualizado correctamente los datos");
                                                actualizarOrdenPartidas(room);
                                            }
                                        });
                                    }

                                });*/
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
                    if(doc == null){
                        let partida = new Partida({
                            idPartida: partidas[idPartida].nombrePartida,
                            jugadores: [],
                            turnoJugadores: []
                        });
                        partida.save(function (err) {
                            if (err) return console.log(err);
                            console.log("La partida se ha guardado en la BD");
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
        for (let i = 0; i < partidas.length; i++) {
            if (partidas[i].nombrePartida == room) {
                for (let j = 0; j < partidas[i].jugadores.length; j++) {
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
                                for (let k = 0; k < partidas.length; k++) {
                                    io.sockets.in(partidas[k].nombrePartida).emit('partida', partidas[k]);
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
            for (var i = 0; i < partidas[idPartida].jugadores.length; i++) {
                if (partidas[idPartida].jugadores[i].listo == 0) {
                    arrayJugadores.push(partidas[idPartida].jugadores[i])
                }
            }
        }
        socket.emit('confirmacionPartida', arrayJugadores, idPartida);
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
    socket.on('darLaVuelta', function (room) {
        let idPartida = consultarIdPartida(room);
        io.sockets.in(partidas[idPartida].nombrePartida).emit('enviandoDarLaVuelta', socket.id);
    });
    socket.on('partidaCancelada', function (room) {
        Partida.deleteOne({ idPartida: room }, function (err) {
            if(err){
                console.log("No se elimino la partida: "+err)
            }
            else {
                console.log("Se elimino correctamente la partida: "+err)

            }
        });
        io.sockets.in(partidas[consultarIdPartida(room)].nombrePartida).emit('partidaCancelada', socket.id);
    })
});
setInterval(function () {
    for (var i = 0; i < partidas.length; i++) {
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
                   // let colorA = 0;
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
    console.log(this.casilla);
    if (this.casilla == 34) {
        console.log(this.casilla);
        console.log("La casilla es 34");
        console.log("id Jugador:"+ partidas[indicePartidaActual].jugadores[indiceJugadorActual].idSocket);
        partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = 0;
        if( partidas[indicePartidaActual].lugaresJugadores.indexOf(this.idSocket) == -1){
            partidas[indicePartidaActual].lugaresJugadores.push(this.idSocket);
            console.log("El jugador "+this.idSocket+" se ha agregado en el array de lugares "+ partidas[indicePartidaActual].lugaresJugadores);
            partidas[indicePartidaActual].turnoJugadores.splice(partidas[indicePartidaActual].turnoJugadores.indexOf(this.idSocket), 1);
            io.sockets.in(roomActual).emit('ocultarBoton', idSocket);
        }
        actualizarOrdenPartidas(roomActual);
        if(partidas[indicePartidaActual].lugaresJugadores.length == partidas[indicePartidaActual].jugadores.length){
            Partida.findOne({idPartida: partidas[indicePartidaActual].nombrePartida}, function (error, doc) {
                if (error) {
                    console.log("Error en la busqueda de la partida en la BDD: " + error);
                }
                else {
                    if(doc != null){
                           doc.turnoJugadores = partidas[indicePartidaActual].lugaresJugadores;
                        doc.save(function (err, partidaF) {
                            if (err) return console.log(err);
                            console.log("Se ha almacenado en la BD el lugar de los jugadores");
                            console.log("Partida finalizada desde server");
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
    if ((t - this.timeMoved) >= this.delayMove) {
        this.placeAt(this.tileTo[0], this.tileTo[1]);
        console.log("La casilla es 34 pero aun me muevo");
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
                    console.log("Buena suerte");
                    partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = Math.floor(Math.random() * 3 + 1);
                    io.sockets.in(partidas[indicePartidaActual].nombrePartida).emit('mensajeMisterio', 1, partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP);
                    partidas[indicePartidaActual].jugadores[indiceJugadorActual].moverseA += partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP;
                } else {
                    console.log("Mala suerte");
                    io.sockets.in(partidas[indicePartidaActual].nombrePartida).emit('mensajeMisterio', 0, partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP);
                    partidas[indicePartidaActual].jugadores[indiceJugadorActual].maldicion = 1;
                }
            }

            if (this.casilla != 34 ) {
                let j = partidas[indicePartidaActual].turnoJugadores.shift();
                console.log("JJJJ: "+j)
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


