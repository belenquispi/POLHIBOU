// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var gameMap = [
    13, 14, 15, 16, 17, 18, 19, 20,
    12, 0, 0, 0, 0, 0, 0, 21,
    11, 10, 9, 0, 0, 24, 23, 22,
    0, 0, 8, 0, 0, 25, 0, 0,
    0, 0, 7, 0, 0, 26, 0, 0,
    4, 5, 6, 0, 0, 27, 28, 29,
    3, 0, 0, 0, 0, 0, 0, 30,
    2, 1, "Inicio", 0, 0, 33, 32, 31
];
var colorMap = [];
var anchoCasilla = 80, altoCasilla = 80;
var columnas = 8, filas = 8;
seleccionarColor();
var parametrosJuego = {gameM: gameMap,
    anchoCas : anchoCasilla,
    altoCas : altoCasilla,
    colum: columnas,
    filas: filas,
    colorM : colorMap}

var jugadores = [];
function Character(c, x, y, z) {
    this.tileFrom = [2, 7];
    this.tileTo = [2, 7];
    this.timeMoved = 0;
    this.dimensions = [40, 40];
    this.position = [x, y];
    this.delayMove = 100;
    this.direction = directions.up;
    this.casilla = 0;
    this.colorP = colorJugador[c];
    this.boton = "";
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
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function() {
    console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
io.on('connection', function(socket) {
    io.sockets.emit('parametrosJuego', parametrosJuego);
    socket.on('new player', function() {
        if(jugadores.length < 3) {
            jugadores.push(new Character(jugadores.length, 180, 580, socket.id));
        }
        socket.emit('jugadores', jugadores);
    });
    socket.on('disconnect', function() {
        // remove disconnected player
       console.log("El usuario: "+socket.id + " se ha desconectado. ")
    });

});

setInterval(function() {
  //  io.sockets.emit('message', 'hi!');
}, 1000)
