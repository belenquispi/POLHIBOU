var ctx = null;
var color1 = new Image();
var color2 = new Image();
var color3 = new Image();
var casillaInicio = new Image();
var casillaFin = new Image();
var casillaIncierto = new Image();
var casillaB = new Image();
var casillaP = new Image();
var casillaM = new Image();
var casillaN = new Image();
var casillaPlay = new Image();
var per1 = new Image();
var per2 = new Image();
var per3 = new Image();
var per4 = new Image();
var filas, columnas, anchoCasilla, altoCasilla;
var gameMap = [];
var colorMap = [];
var patterColor1, patterColor2, patterColor3, patterInicio, patterIncierto, patterFin, patterB, patterP, patterM,
    patterN, patterPlay;
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
var memory_array = [];
var memory_values = [];
var memory_tile_ids = [];
var tiles_flipped = 0;

function generarRandonPartida() {
    return Math.floor(Math.random() * 1);
}

function dados(nombrePartida) {
    this.nombrePartida = nombrePartida;
    this.dado1 = dado1;
    this.dado2 = dado2;
}

window.onload = function () {
    roomActual = partidas[generarRandonPartida()]
    socket.emit('new player', roomActual);
    color1.src = 'static/0.png';
    color2.src = 'static/1.png';
    color3.src = 'static/2.png';
    casillaInicio.src = 'static/inicio.jpg';
    casillaIncierto.src = 'static/incierto.png';
    casillaFin.src = 'static/fin.jpg';
    casillaB.src = 'static/b.png';
    casillaP.src = 'static/p.png';
    casillaM.src = 'static/m.png';
    casillaN.src = 'static/n.png';
    casillaPlay.src = 'static/play.png';
    console.log("carge las imagenes")
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
    console.log("Mi socket: " + idSocketActual)
});
socket.on('partida', function (data) {
    jugadores = data.jugadores;
    for (var i = 0; i < jugadores.length; i++) {

        if (jugadores[i].idSocket == idSocketActual) {
            jugadorActual = jugadores[i];
            numCasillasMoverse = jugadores[i].numCasillasMoverseP
        }
    }

});
socket.on('turnoPartida', function (data) {
    turnoJugadores = data;
    console.log("hola jugadores: " + turnoJugadores);
});
socket.on('dados', function (dadoN1, dadoN2, dadoAnteriorN1, dadoAnteriorN2, numDesafioMostrarse) {
    dado1 = dadoN1;
    dado2 = dadoN2;
    dadoAnterior1 = dadoAnteriorN1;
    dadoAnterior2 = dadoAnteriorN2;
    moverDado();
    moverDado2();
    mostrarDesafio(numDesafioMostrarse);

});
socket.on('ocultarBoton', function (idSocket) {
    console.log("rrr: " + idSocket + "  " + idSocketActual);
    if (idSocket == idSocketActual) {
        if (document.getElementById("botonLanzar")) {
            document.getElementById("botonLanzar").hide();
        }
    }
});

socket.on('emparejar', function (array) {
    memory_array = array;
    newBoard();
});

function agregarNumerosCasilla() {
    for (var y = 0; y < filas; ++y) {
        for (var x = 0; x < columnas; ++x) {
            switch (gameMap[((y * columnas) + x)]) {
                case 0:
                case 'I':
                case 34:
                case 7:
                case 13:
                case 21:
                case 27:
                case 'B':
                case 'P':
                case 'M':
                case 'N':
                case '>':
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
    var sec = Math.floor(Date.now() / 500);
    if (sec != currentSecond) {
        currentSecond = sec;
        framesLastSecond = frameCount;
        frameCount = 1;
    }
    else {
        frameCount++;
    }

    if (numCasillasMoverse > 0 && (turnoJugadores[0] == idSocketActual)) {
        socket.emit('moverJugador', roomActual, currentFrameTime);
    } else {
        bloquearBoton();
        if (jugadores.length > 0 && numCasillasMoverse == 0 && turnoJugadores.length > 0 && (turnoJugadores[0] == idSocketActual) && (jugadores[jugadores.map(function (value) {
            return value.idSocket
        }).indexOf(idSocketActual)].boton == 0)) {
            desbloquearBoton();
            numCasillasMoverse == -1;
            jugadores[jugadores.map(function (value) {
                return value.idSocket
            }).indexOf((idSocketActual))].boton == 1;
        }
        mostrarJugadorActual();
    }

    for (var y = 0; y < filas; ++y) {
        for (var x = 0; x < columnas; ++x) {

            patterColor1 = ctx.createPattern(color1, "repeat");
            patterColor2 = ctx.createPattern(color2, "repeat");
            patterColor3 = ctx.createPattern(color3, "repeat");
            patterInicio = ctx.createPattern(casillaInicio, "repeat");
            patterIncierto = ctx.createPattern(casillaIncierto, "repeat");
            patterFin = ctx.createPattern(casillaFin, "repeat");
            patterB = ctx.createPattern(casillaB, "repeat");
            patterP = ctx.createPattern(casillaP, "repeat");
            patterM = ctx.createPattern(casillaM, "repeat");
            patterN = ctx.createPattern(casillaN, "repeat");
            patterPlay = ctx.createPattern(casillaPlay, "repeat");

            switch (gameMap[((y * columnas) + x)]) {
                case 0:
                    ctx.fillStyle = "#6A0888";
                    break;
                case 'I':
                    ctx.fillStyle = patterInicio;
                    break;
                case 7:
                case 13:
                case 21:
                case  27:
                    ctx.fillStyle = patterIncierto;
                    break;
                case 34:
                    ctx.fillStyle = patterFin;
                    break;
                case 'B':
                    ctx.fillStyle = patterB;
                    break;
                case 'P':
                    ctx.fillStyle = patterP;
                    break;
                case 'M':
                    ctx.fillStyle = patterM;
                    break;
                case 'N':
                    ctx.fillStyle = patterN;
                    break;
                case '>':
                    ctx.fillStyle = patterPlay;
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
    habilitarTablaJugador();

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
    if (document.getElementById("botonLanzar")) {
        document.getElementById("botonLanzar").removeAttribute("disabled");
    }
}

function bloquearBoton() {
    if (document.getElementById("botonLanzar")) {
        document.getElementById("botonLanzar").setAttribute("disabled", "");
    }
}

function lanzarDado() {
    bloquearBoton();
    dadoRandomico();
    moverDado();
    moverDado2();
    dadoAnterior1 = dado1;
    dadoAnterior2 = dado2;
    numCasillasMoverse = dado1 + dado2;
    socket.emit('dados', dado1, dado2, roomActual, dadoAnterior1, dadoAnterior2, numCasillasMoverse);
    mostrarDesafio();
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

function habilitarTablaJugador() {
    if (jugadores.length < 5) {
        for (var i = 1; i < jugadores.length; i++) {
            document.getElementById("tablajug" + (i + 1)).style.visibility = 'visible';
        }
    }
}

function mostrarJugadorActual() {
    for (var i = 0; i < jugadores.length; i++) {
        document.getElementById("tablajug" + (i + 1)).style.border = "thick grey";
    }

    var indiceJugadorActual = jugadores.map(function (value) {
        return value.idSocket
    }).indexOf(turnoJugadores[0]);
    if (indiceJugadorActual >= 0 && turnoJugadores.length > 0) {
        if (document.getElementById("tablajug" + (indiceJugadorActual + 1))) {
            document.getElementById("tablajug" + (indiceJugadorActual + 1)).style.border = "thick solid #A9BCF5";
            switch ((indiceJugadorActual + 1)) {
                case 1:
                    document.getElementById("imagenJugador1").src = "static/buho1.gif";
                    document.getElementById("imagenJugador2").src = "static/buhoInicial2.gif";
                    document.getElementById("imagenJugador3").src = "static/buhoInicial3.gif";
                    document.getElementById("imagenJugador4").src = "static/buhoInicial4.gif";
                    break;
                case 2:
                    document.getElementById("imagenJugador1").src = "static/buhoInicial1.gif";
                    document.getElementById("imagenJugador2").src = "static/buho2.gif";
                    document.getElementById("imagenJugador3").src = "static/buhoInicial3.gif";
                    document.getElementById("imagenJugador4").src = "static/buhoInicial4.gif";
                    break;
                case 3:
                    document.getElementById("imagenJugador1").src = "static/buhoInicial1.gif";
                    document.getElementById("imagenJugador2").src = "static/buhoInicial2.gif";
                    document.getElementById("imagenJugador3").src = "static/buho3.gif";
                    document.getElementById("imagenJugador4").src = "static/buhoInicial4.gif";
                    break;
                case 4:
                    document.getElementById("imagenJugador1").src = "static/buhoInicial1.gif";
                    document.getElementById("imagenJugador2").src = "static/buhoInicial2.gif";
                    document.getElementById("imagenJugador3").src = "static/buhoInicial3.gif";
                    document.getElementById("imagenJugador4").src = "static/buho4.gif";
                    break;
            }

        }

    }
    else {
        document.getElementById("imagenJugador1").src = "static/buhoInicial1.gif";
        document.getElementById("imagenJugador2").src = "static/buhoInicial2.gif";
        document.getElementById("imagenJugador3").src = "static/buhoInicial3.gif";
        document.getElementById("imagenJugador4").src = "static/buhoInicial4.gif";
    }
}

function mostrarDesafio(colorCa) {
    switch (colorCa) {
        case 0:
            //newBoard();
            document.getElementById("tipoJuego").innerHTML = "Voltear";
            document.getElementById("desafios").removeAttribute("hidden");
            document.getElementById("memory_board").removeAttribute("hidden");
            document.getElementById("unir").setAttribute("hidden", "");
            document.getElementById("opcionMultiple").setAttribute("hidden", "");

            break;
        case 1:
           // mostrarUnir();
            document.getElementById("tipoJuego").innerHTML = "Unir";
            document.getElementById("desafios").removeAttribute("hidden");
            document.getElementById("unir").removeAttribute("hidden");
            document.getElementById("memory_board").setAttribute("hidden", "");
            document.getElementById("opcionMultiple").setAttribute("hidden", "");
            break;
        case 2:
           // cargarPreguntasOpcionMultiple();
            document.getElementById("tipoJuego").innerHTML = "Opción Múltiple";
            document.getElementById("desafios").removeAttribute("hidden");
            document.getElementById("opcionMultiple").removeAttribute("hidden");
            document.getElementById("unir").setAttribute("hidden", "");
            document.getElementById("memory_board").setAttribute("hidden", "");

            break;
        default:
    }
}

function newBoard() {
    tiles_flipped = 0;
    var output = '';
    for (var i = 0; i < memory_array.length; i++) {
        console.log("eee");
        output += '<img id="tile_' + i + '" alt="" onclick="memoryFlipTile(this,\'' + memory_array[i] + '\')">';
    }
    document.getElementById('memory_board').innerHTML = output;

}