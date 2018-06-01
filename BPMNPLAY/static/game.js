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
var currentSpeed = 0;
var socket = io();
var jugadores = [];
var turnoJugadores = [];
var partidas = ["partida1", "partida2", "partida3"];
var respuestaCorrecta = false;
var turnoFinalizado = true;
var idSocketActual;
var roomActual;
var dado1 = -1, dado2 = -1, dadoAnterior1 = 1, dadoAnterior2 = 1;

var numCasillasMoverse = 0;

function generarRandonPartida() {
    return Math.floor(Math.random() * 1);
}
function partidaTurno(nombrePartida) {
    this.nombrePartida = nombrePartida,
        this.idSocketJugadores = []
}
function dados (nombrePartida) {
    this.nombrePartida = nombrePartida;
    this.dado1 = dado1;
    this.dado2 = dado2;
}
var moverse = false;

window.onload = function () {
    roomActual = partidas[generarRandonPartida()]
    socket.emit('new player',roomActual);
    ctx = document.getElementById('game').getContext("2d");
    requestAnimationFrame(drawGame);
    ctx.font = "bold 10pt sans-serif";
    console.log("adios")
};
socket.on('parametrosJuego', function (data) {
    filas = data.filas;
    columnas = data.colum;
    anchoCasilla = data.anchoCas;
    altoCasilla = data.altoCas;
    gameMap = data.gameM;
    colorMap = data.colorM;
    idSocketActual = socket.io.engine.id;
    console.log("Mi socket: "+idSocketActual )
});
socket.on('partida', function (data) {
    jugadores = data.jugadores;
    for (var i = 0; i <jugadores.length; i++)
    {

        if(jugadores[i].idSocket == idSocketActual)
        {
            jugadorActual = jugadores[i];
            numCasillasMoverse = jugadores[i].numCasillasMoverseP
        }
    }

});
socket.on('turnoPartida', function (data) {
    turnoJugadores = data;
    console.log("hola jugadores: " + turnoJugadores);
});
socket.on('dados', function (dadoN1, dadoN2, dadoAnteriorN1, dadoAnteriorN2) {
    dado1 = dadoN1;
    dado2 = dadoN2;
    dadoAnterior1 = dadoAnteriorN1;
    dadoAnterior2 = dadoAnteriorN2;
    moverDado();
    moverDado2();
});
function agregarNumerosCasilla() {
    for (var y = 0; y < filas; ++y) {
        for (var x = 0; x < columnas; ++x) {
            switch (gameMap[((y * columnas) + x)]) {
                case 0:
                    //ctx.fillStyle = "#685b48";
                    break;
                default:
                    ctx.fillStyle = "#000000";
                    ctx.fillText(gameMap[((y * columnas) + x)], x * anchoCasilla + anchoCasilla / 2, y * altoCasilla + (anchoCasilla / 4), anchoCasilla);
            }
        }
    }
}

function drawGame() {
    if (ctx == null) {
        return;
    }
    var currentFrameTime = Date.now();
    var sec = Math.floor(Date.now() / 1000);
    if (sec != currentSecond) {
        currentSecond = sec;
        framesLastSecond = frameCount;
        frameCount = 1;
    }
    else {
        frameCount++;
    }

    if(numCasillasMoverse > 0 && (turnoJugadores[0] == idSocketActual)){
        console.log(numCasillasMoverse);
        socket.emit('moverJugador', roomActual, numCasillasMoverse, currentFrameTime);
    }else
    {
        bloquearBoton();
        if(numCasillasMoverse == 0 && turnoJugadores.length > 0 && (turnoJugadores[0] == idSocketActual) && (jugadores[jugadores.map(function (value) { return value.idSocket }).indexOf((idSocketActual))].boton == 0)){
            desbloquearBoton();
            numCasillasMoverse == -1;
            jugadores[jugadores.map(function (value) { return value.idSocket }).indexOf((idSocketActual))].boton == 1;
        }

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
                ctx.fillRect(jugadores[i].position[0], jugadores[i].position[1], (jugadores[i].dimensions[0] / 2) + 1, (jugadores[i].dimensions[1] / 2)) + 1;
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

function desbloquearBoton() {
  //  console.log("Id boton: " + document.getElementById("botonLanzar").id);
    if(document.getElementById("botonLanzar")){
        document.getElementById("botonLanzar").removeAttribute("disabled");
    }
}

function bloquearBoton() {
    if(document.getElementById("botonLanzar")){
        //console.log("Bloqueando el boton: "+idBoton);
        document.getElementById("botonLanzar").setAttribute("disabled","");
    }
}

function lanzarDado() {
    bloquearBoton();
    /* var i = turnoJugadores.shift();
    turnoJugadores.push(i);
    var nuevoArray = new partidaTurno(roomActual);
    nuevoArray.idSocketJugadores = turnoJugadores;
    socket.emit('nuevo array', nuevoArray);*/
    dadoRandomico();
    moverDado();
    moverDado2();
    dadoAnterior1 = dado1;
    dadoAnterior2 = dado2;
    numCasillasMoverse = dado1 + dado2;
    socket.emit('dados', dado1, dado2, roomActual,dadoAnterior1, dadoAnterior2, numCasillasMoverse);

}

function dadoRandomico() {
    dado1 = Math.floor(Math.random() * 6 + 1);
    dado2 = Math.floor(Math.random() * 6 + 1);
    if (dado1 == dadoAnterior1 || dado2 == dadoAnterior2) {
        dadoRandomico();
    }
}

function moverDado() {
    var element;
    switch (dado1) {
        case 1:
            element = document.getElementById("radio-uno");
            element.checked = "true";
            break;
        case 2:
            element = document.getElementById("radio-dos");
            element.checked = "true";
            break;
        case 3:
            element = document.getElementById("radio-tres");
            element.checked = "true";
            break;
        case 4:
            element = document.getElementById("radio-top");
            element.checked = "true";
            break;
        case 5:
            element = document.getElementById("radio-bottom");
            element.checked = "true";
            break;
        case 6:
            element = document.getElementById("radio-back");
            element.checked = "true";
            break;
    }

}

function moverDado2() {
    var element2;
    switch (dado2) {
        case 1:
            element2 = document.getElementById("radio-uno-2");
            element2.checked = "true";
            break;
        case 2:
            element2 = document.getElementById("radio-dos-2");
            element2.checked = "true";
            break;
        case 3:
            element2 = document.getElementById("radio-tres-2");
            element2.checked = "true";
            break;
        case 4:
            element2 = document.getElementById("radio-top-2");
            element2.checked = "true";
            break;
        case 5:
            element2 = document.getElementById("radio-bottom-2");
            element2.checked = "true";
            break;
        case 6:
            element2 = document.getElementById("radio-back-2");
            element2.checked = "true";
            break;
    }
}


