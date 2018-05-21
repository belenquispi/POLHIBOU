var ctx = null;
var color1 = new Image();
var color2 = new Image();
var color3 = new Image();
var filas, columnas, anchoCasilla, altoCasilla;
var gameMap = [];
var colorMap = [];

var patterColor1, patterColor2, patterColor3;
var currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;
var gameTime = 0;
var gameSpeeds = [
    {name: "Normal", mult: 1},
    {name: "Paused", mult: 0}
];
var currentSpeed = 0;

var socket = io();
socket.on('message', function(data) {
    console.log(data);
});

var jugadores = [];

window.onload = function () {
    socket.emit('new player');
    ctx = document.getElementById('game').getContext("2d");
    requestAnimationFrame(drawGame);
    ctx.font = "bold 10pt sans-serif";
    console.log("adios")
};


socket.on('parametrosJuego', function(data) {
    filas = data.filas;
    columnas = data.colum;
    anchoCasilla = data.anchoCas;
    altoCasilla = data.altoCas;
    gameMap = data.gameM;
    colorMap = data.colorM;
})

socket.on('jugadores', function(data) {
    jugadores = data;

    for(var i = 0; i< jugadores.length; i++) {
        console.log("rrrr:  " + jugadores[i].idSocket);
    }
})


function agregarNumerosCasilla() {
    for (var y = 0; y < filas; ++y) {
        for (var x = 0; x < columnas; ++x) {
            switch (gameMap[((y * columnas) + x)]) {
                case 0:
                    //ctx.fillStyle = "#685b48";
                    break;
                default:
                    ctx.fillStyle = "#000000";
                    ctx.fillText(gameMap[((y * columnas) + x)], x * anchoCasilla + anchoCasilla / 2, y * altoCasilla + anchoCasilla / 2, anchoCasilla / 2, altoCasilla / 2);
            }
        }
    }
}

function drawGame() {
    if (ctx == null) {
        return;
    }
    var currentFrameTime = Date.now();
    var timeElapsed = currentFrameTime - lastFrameTime;
    gameTime += Math.floor(timeElapsed * gameSpeeds[currentSpeed].mult);

    var sec = Math.floor(Date.now() / 1000);
    if (sec != currentSecond) {
        currentSecond = sec;
        framesLastSecond = frameCount;
        frameCount = 1;
    }
    else {
        frameCount++;
    }


    for (var y = 0; y < filas; ++y) {
        for (var x = 0; x < columnas; ++x) {
            color1.src = 'static/0.png';
            color2.src = 'static/1.png';
            color3.src = 'static/2.png';
            patterColor1 = ctx.createPattern(color1, "repeat");
            patterColor2 = ctx.createPattern(color2, "repeat");
            patterColor3 = ctx.createPattern(color3, "repeat");

            switch (gameMap[((y * columnas) + x)]) {
                case 0:
                    ctx.fillStyle = "#6A0888";
                    break;
                default:
                    switch (colorMap[((y * columnas) + x)]) {
                        case 0:
                            ctx.fillStyle = patterColor1;
                            break;
                        case 1:
                            ctx.fillStyle = patterColor2;
                            break;
                        case 2:
                            ctx.fillStyle = patterColor3;
                            break;
                        default:
                            ctx.fillStyle = "#5aa457";
                    }
            }
            ctx.fillRect(x * anchoCasilla, y * altoCasilla, anchoCasilla, altoCasilla);
        }
    }

    agregarNumerosCasilla();
    dibujarJugador();

    ctx.fillStyle = "#ff0000";
    ctx.fillText("FPS: " + framesLastSecond, 10, 20);

    lastFrameTime = currentFrameTime;

    requestAnimationFrame(drawGame);
}

function dibujarJugador() {
    for (var i = 0; i < jugadores.length; i++) {
        ctx.fillStyle = jugadores[i].colorP;

        switch (i) {
            case 0:
                ctx.fillRect(jugadores[i].position[0], jugadores[i].position[1], jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                break;
            case 1:
                ctx.fillRect(jugadores[i].position[0] + jugadores[i].dimensions[1] / 2, jugadores[i].position[1], jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                break;
            case 2:
                ctx.fillRect(jugadores[i].position[0], jugadores[i].position[1] + jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                break;
            case 3:
                ctx.fillRect(jugadores[i].position[0] + jugadores[i].dimensions[0] / 2, jugadores[i].position[1] + jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                break;
            default:
        }
    }
}

