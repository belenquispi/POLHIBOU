// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
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
var colorMap = [];
var anchoCasilla = 60, altoCasilla = 60;
var columnas = 9, filas = 8;
var parametrosJuego = {
    gameM: gameMap,
    anchoCas: anchoCasilla,
    altoCas: altoCasilla,
    colum: columnas,
    filas: filas,
    colorM: colorMap
};
seleccionarColor();
function partida(nombrePartida) {
    this.nombrePartida = nombrePartida,
        this.jugadores = []
}

function partidaTurno(nombrePartida) {
    this.nombrePartida = nombrePartida,
        this.idSocketJugadores = []
}

var partidas = [];
var turnoJugadores = [];

function Character(c, x, y, z) {
    this.tileFrom = [2, 7];
    this.tileTo = [2, 7];
    this.timeMoved = 0;
    this.dimensions = [30, 30];
    this.position = [x, y];
    this.delayMove = 100;
    this.direction = directions.up;
    this.casilla = 0;
    this.colorP = colorJugador[c];
    this.boton = 0;
    this.puesto = 0;
    this.idSocket = z;
}

var directions = {
    up: 0,
    right: 1,
    down: 2,
    left: 3
};
var colorJugador = ["#01DF3A", "#FE2E2E", "#0431B4", "#61380B", "#8904B1"];

function seleccionarColor() {
    var indice = 0;
    for (var y = 0; y < filas; ++y) {
        for (var x = 0; x < columnas; ++x) {
            switch (gameMap[((y * columnas) + x)]) {
                case 0:
                    colorMap[indice] = -1;
                    indice++;
                    break;
                default:
                    var colorA = Math.floor(Math.random() * 3);
                    var colorAnterior = -1;
                    while(colorA == colorAnterior) {
                        colorA = Math.floor(Math.random() * 3);
                    }
                    colorAnterior = colorA;
                        switch (colorA) {
                            case 0:
                                colorMap[indice] = 0;
                                indice++;
                                break;
                            case 1:
                                colorMap[indice] = 1;
                                indice++;
                                break;
                            case 2:
                                colorMap[indice] = 2;
                                indice++;
                                break;
                            default:
                        }
            }
        }
    }
}

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static' +
    ''));
// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
io.on('connection', function (socket) {
    io.sockets.emit('parametrosJuego', parametrosJuego);
    socket.on('new player', function (room) {
        socket.join(room);
        if (partidas.length == 0) {
            partidas.push(new partida(room));
            turnoJugadores.push(new partidaTurno(room));
            partidas[partidas.length - 1].jugadores.push(new Character(0, ((anchoCasilla * 2) + (anchoCasilla / 4)), (altoCasilla * (filas - 1) + (altoCasilla / 4)), socket.id));
            partidas[partidas.length - 1].jugadores[partidas[partidas.length - 1].jugadores.length - 1].numCasillasMoverseP = 0;
            partidas[partidas.length - 1].jugadores[partidas[partidas.length - 1].jugadores.length - 1].boton = 0;
            turnoJugadores[turnoJugadores.length - 1].idSocketJugadores.push(socket.id);
        }
        else {
            var idPartida = partidas.map(function (e) {
                return e.nombrePartida
            }).indexOf(room);
            var idTurnoPartida = turnoJugadores.map(function (e) {
                return e.nombrePartida
            }).indexOf(room);

            if (idPartida >= 0) {
                if(partidas[idPartida].jugadores.length < 4) {
                    partidas[idPartida].jugadores.push(new Character(partidas[idPartida].jugadores.length, ((anchoCasilla * 2) + (anchoCasilla / 4)), (altoCasilla * (filas - 1) + (altoCasilla / 4)), socket.id));
                    partidas[idPartida].jugadores[partidas[idPartida].jugadores.length - 1].numCasillasMoverseP = 0;
                    partidas[idPartida].jugadores[partidas[idPartida].jugadores.length - 1].boton = 0;
                    turnoJugadores[idTurnoPartida].idSocketJugadores.push(socket.id);
                }
            }
            else {
                partidas.push(new partida(room));
                turnoJugadores.push(new partidaTurno(room));
                partidas[partidas.length - 1].jugadores.push(new Character(0, ((anchoCasilla * 2) + (anchoCasilla / 4)), (altoCasilla * (filas - 1) + (altoCasilla / 4)), socket.id));
                partidas[partidas.length - 1].jugadores[partidas[partidas.length - 1].jugadores.length - 1].numCasillasMoverseP = 0;
                partidas[partidas.length - 1].jugadores[partidas[partidas.length - 1].jugadores.length - 1].boton = 0;
                turnoJugadores[turnoJugadores.length - 1].idSocketJugadores.push(socket.id);
            }
        }
        actualizarOrdenPartidas();
    });
    socket.on('disconnect', function () {
        // remove disconnected player
        /* var posicion = jugadores.map(function (e) {
             return e.idSocket;
         }).indexOf(socket.id);
         console.log("Eliminats: " + posicion)
         jugadores.splice(posicion, 1);
         console.log("Los nuevos Jugadores: " + jugadores)*/
    });
    socket.on('nuevo array', function (data, room) {
        for (var i = 0; i < turnoJugadores.length; i++) {
            if (turnoJugadores[i].nombrePartida == room) {
                turnoJugadores[i].idSocket = data;
            }
        }
        actualizarOrdenPartidas();
    });
    socket.on('dados', function (dado1, dado2, room, dadoAnterior1, dadoAnterior2, numCasillasMoverse) {
        for (var i = 0; i < partidas.length; i++) {
            if (partidas[i].nombrePartida == room) {
                partidas[i].dadoP1 = dado1;
                partidas[i].dadoP2 = dado2;
                partidas[i].dadoAnteriorP1 = dadoAnterior1;
                partidas[i].dadoAnteriorP2 = dadoAnterior2;
                partidas[i].jugadores[partidas[i].jugadores.map(function (e) {
                    return e.idSocket
                }).indexOf(socket.id)].numCasillasMoverseP = numCasillasMoverse;
                var numDesafioMostrarse = mostrarDesafio(partidas[i].jugadores[partidas[i].jugadores.map(function (e) {
                    return e.idSocket
                }).indexOf(socket.id)], numCasillasMoverse);
                io.sockets.in(room).emit('dados', dado1, dado2, dadoAnterior1, dadoAnterior2, numDesafioMostrarse);
            if (numDesafioMostrarse == 0){
                io.sockets.in(room).emit('emparejar', newBoard());

            } }
        }
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
    })
});

function actualizarOrdenPartidas() {
    for (var i = 0; i < turnoJugadores.length; i++) {
        console.log("num22 Ju:  " + turnoJugadores.length + "  " + turnoJugadores[0].idSocketJugadores);
        io.sockets.in(turnoJugadores[i].nombrePartida).emit('turnoPartida', turnoJugadores[i].idSocketJugadores);
    }
};

setInterval(function () {
    for (var i = 0; i < partidas.length; i++) {
        io.sockets.in(partidas[i].nombrePartida).emit('partida', partidas[i]);
    }
}, 1000 / 60);

Character.prototype.placeAt = function (x, y) {
    this.tileFrom = [x, y];
    this.tileTo = [x, y];
    this.position = [((anchoCasilla * x) + ((anchoCasilla - this.dimensions[0]) / 2)), ((altoCasilla * y) + ((altoCasilla - this.dimensions[1]) / 2))];
};

Character.prototype.processMovement = function (t, roomActual, idSocket) {
    var indicePartidaActual = partidas.map(function (e) {
        return e.nombrePartida;
    }).indexOf(roomActual)
    var indiceJugadorActual = partidas[indicePartidaActual].jugadores.map(function (e) {
        return e.idSocket;
    }).indexOf(idSocket)

    if (this.tileFrom[0] == this.tileTo[0] && this.tileFrom[1] == this.tileTo[1]) {
        return false;
    }

    if (this.casilla == 34) {
        console.log("estoy en la casilla 33")
        partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = 1 ;

        io.sockets.in(roomActual).emit('ocultarBoton', idSocket);
    }

    if ((t - this.timeMoved) >= this.delayMove) {
        console.log("puedo moverme")
        this.placeAt(this.tileTo[0], this.tileTo[1]);

        if (partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP > 1) {
            console.log("mayor que 1 "+ partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP )
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
            console.log("Soy menor que 1 " + partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP)
            partidas[indicePartidaActual].jugadores[indiceJugadorActual].numCasillasMoverseP = 0;
            var indicePartidaActualJu = turnoJugadores.map(function (e) {
                return e.nombrePartida
            }).indexOf(roomActual);
            var i = turnoJugadores[indicePartidaActualJu].idSocketJugadores.shift();
            if(this.casilla != 34)
            {

                turnoJugadores[indicePartidaActualJu].idSocketJugadores.push(i);


            }
            else {
                console.log("44443434")

            }

            actualizarOrdenPartidas();

            if(turnoJugadores[indicePartidaActualJu].idSocketJugadores.length != 0) {
                partidas[indicePartidaActual].jugadores[partidas[indicePartidaActual].jugadores.map(function (value) {
                    return value.idSocket
                }).indexOf(turnoJugadores[indicePartidaActualJu].idSocketJugadores[0])].boton = 0;
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

function mostrarDesafio(jugadorAct, numCasillasMoverse) {
    var colorCa = -1;
    for (var x = 0; x < filas; ++x) {
        for (var y = 0; y < columnas; ++y) {
            if ((gameMap[((x * columnas) + y)]) == (jugadorAct.casilla + numCasillasMoverse)) {
                colorCa = colorMap[((x * columnas) + y)];
                return colorCa;
            }
        }
    }
}

Array.prototype.memory_tile_shuffle = function () {
    var i = this.length, j, temp;
    console.log("eee"+i);
    while (--i > 0) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[j];
        this[j] = this[i];
        this[i] = temp;
    }
};

function newBoard() {
    tiles_flipped = 0;
    var output = '';
    return memory_array.memory_tile_shuffle();
}