var ctx = null;
var color1 = new Image();
var color2 = new Image();
var color3 = new Image();
var per1 = new Image();
var per2 = new Image();
var per3 = new Image();
var per4 = new Image();
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
var partidas = ["partida1", "partida2", "partida3"];

function generarRandonPartida (){
    return Math.floor(Math.random()*3);
}

window.onload = function () {
    socket.emit('new player', partidas[generarRandonPartida()]);
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

socket.on('partida', function(data) {
    jugadores = data;
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
                    ctx.fillText(gameMap[((y * columnas) + x)], x * anchoCasilla + anchoCasilla / 2, y * altoCasilla +(anchoCasilla/4) , anchoCasilla );
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
        console.log(jugadores.length)
        ctx.fillStyle = jugadores[i].colorP;
        per1.src = 'static/tre.png';
        per2.src = 'static/cora.png';
        per3.src = 'static/mal.png';
        per4.src = 'static/pintura.png';
        var patterper1 = ctx.createPattern(per1, "repeat");
        var patterper2 = ctx.createPattern(per2, "repeat");
        var patterper3 = ctx.createPattern(per3, "repeat");
        var patterper4 = ctx.createPattern(per4, "repeat");

        switch (i) {
            case 0:
                ctx.fillStyle = patterper1;
                ctx.fillRect(jugadores[i].position[0], jugadores[i].position[1], (jugadores[i].dimensions[0] / 2)+1, (jugadores[i].dimensions[1] / 2))+1;
                break;
            case 1:
                ctx.fillStyle = patterper2;
                ctx.fillRect(jugadores[i].position[0] + jugadores[i].dimensions[1] / 2, jugadores[i].position[1], jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                break;
            case 2:
                ctx.fillStyle = patterper3;
                ctx.fillRect(jugadores[i].position[0], jugadores[i].position[1] + jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                break;
            case 3:
                ctx.fillStyle = patterper4;
                ctx.fillRect(jugadores[i].position[0] + jugadores[i].dimensions[0] / 2, jugadores[i].position[1] + jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                break;
            default:
        }
    }
}

