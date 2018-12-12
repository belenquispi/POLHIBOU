var ctx = null;
var color1 = new Image();
var color2 = new Image();
var color3 = new Image();
var llegada = new Image();
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
var patterColor1, patterColor2, patterColor3, patterLlegada, patterInicio, patterIncierto, patterFin, patterB, patterP,
    patterM, patterN, patterPlay;
var socket = io();
var jugadores = [];
var turnoJugadores = [];
var respuestaCorrecta = false;
var turnoFinalizado = true;
var idSocketActual;
var roomActual, rol, nombreEquipo;
var dado1 = -1, dado2 = -1, dadoAnterior1 = 1, dadoAnterior2 = 1;
var numCasillasMoverse = 0;
var memory_array = [];
var memory_values = [];
var memory_tile_ids = [];
var tiles_flipped = 0;
var preguntasOpcionMultiple = [];
var preguntasUnirVoltear = [];
var resCorrecta;
var respuestaUnir = [];
var imagenUnir = ['botonImagenAUnir1', 'botonImagenAUnir2', 'botonImagenAUnir3', 'botonImagenAUnir4'];
var textoUnir = ['textoAUnir1', 'textoAUnir2', 'textoAUnir3', 'textoAUnir4'];
var respuestaCorrectaUnir = [];
var fps = 30;
let tiempoVoltear = 0;
let respuestaVoltearATiempo = -1;
function dados(nombrePartida) {
    this.nombrePartida = nombrePartida;
    this.dado1 = dado1;
    this.dado2 = dado2;
}

function obtenerDatosQuienSeConecto() {
    roomActual = document.getElementById("idPartida").value;
    rol = document.getElementById("rol").value;
    nombreEquipo = document.getElementById("nombreEquipo").value;
    console.log("eeee   " + roomActual, rol, nombreEquipo);
}

window.onload = function () {
    obtenerDatosQuienSeConecto();
    socket.emit('new player', roomActual, rol, nombreEquipo);
    color1.src = 'static/imagenes/0.png';
    color2.src = 'static/imagenes/1.png';
    color3.src = 'static/imagenes/2.png';
    llegada.src = 'static/imagenes/llegada-30.png';
    //llegada.src = 'static/imagenes/buho1.gif';
    casillaInicio.src = 'static/inicio.jpg';
    casillaIncierto.src = 'static/imagenes/incierto.png';
    casillaFin.src = 'static/fin.jpg';
    //console.log(casillaFin.toDataURL());
    //casillaFin = contrastImage(casillaFin.toDataURL(), 30);
    casillaB.src = 'static/imagenes/b.png';
    casillaP.src = 'static/imagenes/p.png';
    casillaM.src = 'static/imagenes/m.png';
    casillaN.src = 'static/imagenes/n.png';
    casillaPlay.src = 'static/imagenes/play.png';
    ctx = document.getElementById('game').getContext("2d");
    setTimeout(function () {
        requestAnimationFrame(drawGame);
    }, 1000 / fps);
    ctx.font = "bold 10pt sans-serif";
};

socket.on('nombreRol', function (nombre) {
    document.getElementById("sesion").innerHTML = nombre;
});

socket.on('error', function (nombre) {
    alert(nombre);
});

socket.on('parametrosJuego', function () {
    idSocketActual = socket.io.engine.id;
    console.log("Mi socket: " + idSocketActual)
});

socket.on('partida', function (data) {
    filas = data.filas;
    columnas = data.colum;
    anchoCasilla = data.anchoCas;
    altoCasilla = data.altoCas;
    gameMap = data.gameM;
    colorMap = data.colorM;
    jugadores = data.jugadores;
    preguntasOpcionMultiple = data.preguntasOpcionMultiple;
    preguntasUnirVoltear = data.preguntasUnirVoltear;
    for (let i = 0; i < jugadores.length; i++) {
        if (jugadores[i].idSocket == idSocketActual) {
            numCasillasMoverse = jugadores[i].numCasillasMoverseP;
        }
    }
});

socket.on('mensajeMisterio', function (num, casillasExtras) {
    if (num == 1) {
        misterioPositivo();
    }
    else {
        if (num == 0) {
            misterioNegativo();
        }
    }
});

socket.on('turnoPartida', function (data) {
    turnoJugadores = data;
    console.log("hola jugadores: " + turnoJugadores);
});

socket.on('dados', function (dadoN1, dadoN2, dadoAnteriorN1, dadoAnteriorN2, numDesafioMostrarse, idSocket) {
    dado1 = dadoN1;
    dado2 = dadoN2;
    dadoAnterior1 = dadoAnteriorN1;
    dadoAnterior2 = dadoAnteriorN2;
    moverDado();
    moverDado2();
    mostrarDesafio(numDesafioMostrarse, idSocket);
});

socket.on('ocultarBoton', function (idSocket) {
    if (idSocket == idSocketActual) {
        if (document.getElementById("botonLanzar")) {
            document.getElementById("botonLanzar").classList.add("invisible");
            document.getElementById("botonLanzar").classList.add("disabledbutton")
        }
        document.getElementById("tarjeta").classList.add("disabledbutton")
    }
});

socket.on('respondiendoIndicePreguntaOpcionMultiple', function (indicePregunta) {
    cargarPreguntaOpcionMultiple(indicePregunta);
});

socket.on('respondiendoIndicePreguntaUnir', function (arrayIndices, arrayTexto) {
    respuestaCorrectaUnir = [];
    for (let i = 0; i < arrayIndices.length; i++) {
        respuestaCorrectaUnir.push("botonImagenAUnir" + (i + 1));
        respuestaCorrectaUnir.push(preguntasUnirVoltear[arrayIndices[i]].texto);
        cargarPreguntaUnirVoltear(arrayIndices[i], arrayTexto[i], (i + 1));
    }
});

socket.on('respondiendoIndicePreguntaVoltear', function (memory) {
    memory_array = memory;
    newBoard();
});

socket.on('enviandoParEncontrado', function (memory_tile_ids, idSocketN) {
    if (idSocketN != idSocketActual) {
        for (var i = 0; i < memory_tile_ids.length; i++) {
            document.getElementById(memory_tile_ids[i]).click();
        }
    }
});

socket.on('enviandoRespuestaOpcionMultiple', function (botonSeleccionado, idSocketN) {
    if (idSocketN != idSocketActual) {
        document.getElementById(botonSeleccionado).click();
    }
});

socket.on('enviandoRespuestaUnir', function (respuestaUnir, idSocketN) {
    if (idSocketN != idSocketActual) {
        reiniciarUnir();
        for (var i = 0; i < respuestaUnir.length; i++) {
            document.getElementById(respuestaUnir[i]).click();
        }
    }
});

socket.on('enviandoVerificarUnir', function (idSocketN) {
    if (idSocketN != idSocketActual) {
        verificarRespuestaUnir();
    }
});

socket.on('enviandoDarLaVuelta', function (idSocketN) {
    if (idSocketN != idSocketActual) {
        darLaVuelta();
    }
});
socket.on('partidaFinalizada', function () {
    document.getElementById("botonFinalizacion").removeAttribute("disabled");
    document.getElementById("botonFinalizacion").click();
});

socket.on('partidaCancelada', function () {
    document.getElementById("linkFinalizarPartida").click();
});

function agregarNumerosCasilla() {
    for (var y = 0; y < filas; ++y) {
        for (var x = 0; x < columnas; ++x) {
            switch (gameMap[((y * columnas) + x)]) {
                case -1:
                case 0 :
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
    if (numCasillasMoverse > 0 && (turnoJugadores[0] == idSocketActual) && respuestaCorrecta == true) {
        socket.emit('moverJugador', roomActual);
    } else {
        respuestaCorrecta = false;
        bloquearBoton();
        if (jugadores.length > 0 && numCasillasMoverse == 0 && turnoJugadores.length > 0 && (turnoJugadores[0] == idSocketActual) && (jugadores[jugadores.map(function (value) {
            return value.idSocket
        }).indexOf(idSocketActual)].boton == 0)) {
            desbloquearBoton();
            /* numCasillasMoverse = -1;
              jugadores[jugadores.map(function (value) {
                    return value.idSocket
                }).indexOf((idSocketActual))].boton = 1;*/
        }
        mostrarJugadorActual();

    }

    for (let y = 0; y < filas; ++y) {
        for (let x = 0; x < columnas; ++x) {

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
                case -1:
                    //ctx.fillStyle = "#6A0888";
                    ctx.fillStyle = "#0B610B";

                    break;
                case 0:
                    ctx.fillStyle = patterInicio;
                    break;
                case 7:
                case 13:
                case 21:
                case 27:
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
    dibujarLlegarA();
    habilitarTablaJugador();
    /*ctx.fillStyle = "#ff0000";
    ctx.fillText("FPS: " + framesLastSecond, 10, 20);
    let lastFrameTime = currentFrameTime;*/
    requestAnimationFrame(drawGame);
}
function controlarTiempo() {
    let temporizador = setInterval(function () {
        tiempoVoltear--;
        if (tiempoVoltear > 0) {
            document.getElementById("progreso").style.width = tiempoVoltear - 2 + "%";
        } else {
            clearTimeout(temporizador);
            if(respuestaVoltearATiempo == 0){
                desafioIncorrecto();
                voltearTarjeta(2000);
            }
        }
    }, 400);
}

function dibujarJugador() {
    for (let i = 0; i < jugadores.length; i++) {
        if (jugadores[i].idSocket != "") {
            ctx.fillStyle = jugadores[i].colorP;
            per1.src = 'static/imagenes/equipo'+jugadores[i].iconoEquipo+'.svg';
            //per1.src = 'static/imagenes/flor.jpg';
            per2.src = 'static/imagenes/star.png';
            per3.src = 'static/imagenes/mal.png';
            per4.src = 'static/imagenes/pintura.png';

            switch (i) {
                case 0:
                    ctx.drawImage(per1, jugadores[i].position[0], jugadores[i].position[1], (jugadores[i].dimensions[0] / 2), (jugadores[i].dimensions[1] / 2));
                    break;
                case 1:
                    ctx.drawImage(per2, jugadores[i].position[0] + jugadores[i].dimensions[1] / 2, jugadores[i].position[1], jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                    break;
                case 2:
                    ctx.drawImage(per3, jugadores[i].position[0], jugadores[i].position[1] + jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                    break;
                case 3:
                    ctx.drawImage(per4, jugadores[i].position[0] + jugadores[i].dimensions[0] / 2, jugadores[i].position[1] + jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[0] / 2, jugadores[i].dimensions[1] / 2);
                    break;
                default:
            }
        }
    }
}

function dibujarLlegarA() {
    if (jugadores.length > 0) {
        if (indiceDelJugadorConTurno() >= 0 && jugadores[indiceDelJugadorConTurno()].moverseA > 0) {
            var moverseA = jugadores[indiceDelJugadorConTurno()].moverseA;
            if (moverseA != jugadores[indiceDelJugadorConTurno()].casilla) {
                var casilla = jugadores[indiceDelJugadorConTurno()].casilla;
                patterLlegada = ctx.createPattern(llegada, "repeat");
                for (var y = 0; y < filas; ++y) {
                    for (var x = 0; x < columnas; ++x) {
                        var caso = gameMap[((y * columnas) + x)];
                        switch (true) {
                            case (caso == casilla):
                            case (caso == moverseA):
                                /*ctx.fillStyle = patterLlegada;
                                ctx.fillRect((x * anchoCasilla)+anchoCasilla/4, (y * altoCasilla)+altoCasilla/4, anchoCasilla/2, altoCasilla/2);
                                y = filas;
                                x = columnas;*/
                                break;
                            case (caso >= 0 && caso < 35):
                                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                                ctx.fillRect(x * anchoCasilla, y * altoCasilla, anchoCasilla, altoCasilla);
                                break;
                            default:
                        }
                    }
                }
            }

        }
    }
}

function indiceDelJugadorConTurno() {
    var indice = -1;
    if (jugadores.length > 0) {
        indice = jugadores.map(function (value) {
            return value.idSocket;
        }).indexOf(turnoJugadores[0]);
    } else {
        indice = -1;
    }
    return indice;
}

function desbloquearBoton() {

    if (document.getElementById("botonLanzar")) {
        document.getElementById("botonLanzar").classList.remove("invisible");
        document.getElementById("botonLanzar").classList.remove("disabledbutton")
    }
    document.getElementById("tarjeta").classList.add("disabledbutton")
}

function bloquearBoton() {
    if (document.getElementById("botonLanzar")) {
        document.getElementById("botonLanzar").classList.add("invisible");
        document.getElementById("botonLanzar").classList.add("disabledbutton")
    }
    document.getElementById("tarjeta").classList.add("disabledbutton");

    if (turnoJugadores.length > 0 && turnoJugadores[0] == idSocketActual) {
        document.getElementById("tarjeta").classList.remove("disabledbutton")
    }
}

function lanzarDado() {
    bloquearBoton();
    var misterio = jugadores[jugadores.map(function (value) {
        return value.idSocket;
    }).indexOf(idSocketActual)].maldicion;
    if (misterio == 1) {
        dado1 = 1;
        dado2 = 1;
    } else {
        // dadoRandomico();
        dado1 = 6;
        dado2 = 6;
    }
    moverDado();
    moverDado2();
    dadoAnterior1 = dado1;
    dadoAnterior2 = dado2;
    numCasillasMoverse = dado1 + dado2;
    socket.emit('dados', dado1, dado2, roomActual, dadoAnterior1, dadoAnterior2, numCasillasMoverse, misterio);
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
    for (var i = 0; i < jugadores.length; i++) {
        if (jugadores[i].idSocket != "") {
            document.getElementById("tablajug" + (i + 1)).style.visibility = 'visible';
        }
    }
}

function mostrarJugadorActual() {
    for (let i = 0; i < jugadores.length; i++) {
        document.getElementById("tablajug" + (i + 1)).style.border = "thick grey";
        document.getElementById("tablajug" + (i + 1)).style.background = "#FFFFFF";
        document.getElementById("turno" + (i + 1)).setAttribute("hidden", "");
    }

    for (let j = 0; j < jugadores.length; j++) {
        if (!document.getElementById("imagenJugador" + (j + 1)) && jugadores[j].idSocket != "") {
            let images = document.createElement("IMG");
            images.setAttribute("src", "static/imagenes/equipo" + (jugadores[j].iconoEquipo) + ".svg");
            images.setAttribute("id", "imagenJugador" + (j + 1));
            images.setAttribute("height", "50");
            images.setAttribute("width", "50");
            document.getElementById("columna" + (j + 1)).appendChild(images);
            document.getElementById("nombreEquipo" + (j + 1)).innerHTML = jugadores[j].nombreEquipo;
        }
    }
    var indiceJugadorActual = indiceDelJugadorConTurno();

    if (indiceJugadorActual >= 0 && turnoJugadores.length > 0) {
        //  document.getElementById("nombreEquipoActual").innerHTML = jugadores[indiceJugadorActual].nombreEquipo;
        if (document.getElementById("tablajug" + (indiceJugadorActual + 1))) {
            document.getElementById("tablajug" + (indiceJugadorActual + 1)).style.background = "#A9BCF5";
            document.getElementById("turno" + (indiceJugadorActual + 1)).removeAttribute("hidden");
            document.getElementById("tablajug" + (indiceJugadorActual + 1)).classList.add('miTurno');
            cambiarImagen(indiceJugadorActual);
        }
    }
    else {
        /* for (var j = 0; j < turnoJugadores.length; j++) {
             if (jugadores.length > 0) {
                 //console.log("jjjjjojojojo: "+j)
                 document.getElementById("imagenJugador" + (j + 1)).src = "static/buhoInicial" + jugadores[j].iconoEquipo + ".gif";
             }
         }*/
    }
}

function cambiarImagen(num) {
    for (var j = 0; j < turnoJugadores.length; j++) {
        if (j == num) {
            document.getElementById("imagenJugador" + (j + 1)).src = "static/imagenes/equipo" + jugadores[j].iconoEquipo + ".svg";
        } else {
            if (document.getElementById("imagenJugador" + (j + 1))) {
                document.getElementById("imagenJugador" + (j + 1)).src = "static/imagenes/equipo" + jugadores[j].iconoEquipo + ".svg";
            }
        }
    }
}

function mostrarDesafio(colorCa, idSocket) {
    document.getElementById('textoTarjeta').innerText = "Voltéame";
    switch (colorCa) {
        case 0:
            document.getElementById('tarjeta').style.backgroundColor = "#F2F5A9";
            document.getElementById('desafios').style.backgroundColor = "#F2F5A9";
            if (idSocket == idSocketActual) {
                socket.emit('solicitarPreguntaVoltear', roomActual);
            }
            document.getElementById("tipoJuego").innerHTML = "Voltear";
            document.getElementById("desafios").removeAttribute("hidden");
            document.getElementById("memory_boardMulti").removeAttribute("hidden");
            document.getElementById("barraTiempoUnir").removeAttribute("hidden");
            document.getElementById("respuestaUnirVoltear").removeAttribute("hidden");
            document.getElementById("ultimoPar").setAttribute("src", "../../../static/imagenes/0.png");
            document.getElementById("ultimoNombre").innerHTML = "";
            document.getElementById("unir").setAttribute("hidden", "");
            document.getElementById("opcionMultiple").setAttribute("hidden", "");
            respuestaVoltearATiempo = 0;
            break;
        case 1:
            document.getElementById('tarjeta').style.backgroundColor = "#F6CED8";
            document.getElementById('desafios').style.backgroundColor = "#F6CED8";
            respuestaUnir = [];
            if (idSocket == idSocketActual) {
                socket.emit('solicitarPreguntaUnir', roomActual);
            }
            document.getElementById("tipoJuego").innerHTML = "Unir";
            document.getElementById("desafios").removeAttribute("hidden");
            document.getElementById("unir").removeAttribute("hidden");
            document.getElementById("memory_boardMulti").setAttribute("hidden", "");
            document.getElementById("barraTiempoUnir").setAttribute("hidden", "");
            document.getElementById("respuestaUnirVoltear").setAttribute("hidden", "");
            document.getElementById("opcionMultiple").setAttribute("hidden", "");
            break;
        case 2:
            document.getElementById('tarjeta').style.backgroundColor = "#81DAF5";
            document.getElementById('desafios').style.backgroundColor = "#81DAF5";
            if (idSocket == idSocketActual) {
                socket.emit('solicitarPreguntaOpcionMultiple', roomActual);
            }
            document.getElementById("tipoJuego").innerHTML = "Opción Múltiple";
            document.getElementById("desafios").removeAttribute("hidden");
            document.getElementById("opcionMultiple").removeAttribute("hidden");
            document.getElementById("unir").setAttribute("hidden", "");
            document.getElementById("memory_boardMulti").setAttribute("hidden", "");
            document.getElementById("barraTiempoUnir").setAttribute("hidden", "");
            document.getElementById("respuestaUnirVoltear").setAttribute("hidden", "");
            break;
        default:
    }
}

function newBoard() {
    tiles_flipped = 0;
    let output = '';
    for (let i = 0; i < memory_array.length; i++) {
        if (idSocketActual == turnoJugadores[0]) {
            output += '<img id="tile_' + i + '" alt="" onclick="memoryFlipTile(this,\'' + memory_array[i] + '\')">';
        }
        else {
            output += '<img id="tile_' + i + '"  class = "disabledbutton" alt="" onclick="memoryFlipTile(this,\'' + memory_array[i] + '\')">';
        }
    }
    document.getElementById('memory_boardMulti').innerHTML = output;
}

function memoryFlipTile(tile, val) {
    if (tile.alt == "" && memory_values.length < 2) {
        //tile.style.background = '#FFF';
        tile.src = val;
        tile.alt = val;
        if (memory_values.length == 0) {

            memory_values.push(val);
            memory_tile_ids.push(tile.id);
        } else if (memory_values.length == 1) {

            memory_values.push(val);
            memory_tile_ids.push(tile.id);
            if (memory_values[0] == memory_values[1]) {
                tiles_flipped += 2;
                mostrarMensajeParEncontrado(memory_values[0]);
                if (turnoJugadores[0] == idSocketActual) {
                    socket.emit('parEncontrado', roomActual, memory_tile_ids);
                }
                // Clear both arrays
                memory_values = [];
                memory_tile_ids = [];
                // Check to see if the whole board is cleared
                if (tiles_flipped == memory_array.length) {
                    // alert("Board cleared... generating new board");
                    respuestaVoltearATiempo = 1;
                    desafioCorrecto();
                    voltearTarjeta(2000);
                }
            } else {
                function flip2Back() {
                    // Flip the 2 tiles back over
                    var tile_1 = document.getElementById(memory_tile_ids[0]);
                    var tile_2 = document.getElementById(memory_tile_ids[1]);
                    // tile_1.style.background = 'url(corona.png) no-repeat';
                    tile_1.src = "corona.png";
                    tile_1.alt = "";
                    tile_1.removeAttribute("src");
                    //tile_2.style.background = 'url(corona.png) no-repeat';
                    tile_2.src = "corona.png";
                    tile_2.alt = "";
                    tile_2.removeAttribute("src");
                    // Clear both arrays
                    memory_values = [];
                    memory_tile_ids = [];
                }

                setTimeout(flip2Back, 700);
            }
        }
    }
}

function cargarPreguntaOpcionMultiple(indicePregunta) {

    if (idSocketActual != turnoJugadores[0]) {
        document.getElementById("opcionMultiple").classList.add("disabledbutton")
    }
    else {
        if (document.getElementById("opcionMultiple").classList.contains("disabledbutton")) {
            document.getElementById("opcionMultiple").classList.remove("disabledbutton")
        }
    }
    document.getElementById("enunciado").innerHTML = preguntasOpcionMultiple[indicePregunta].enunciado;
    if (preguntasOpcionMultiple[indicePregunta].hasOwnProperty("imagenEnunciado") && preguntasOpcionMultiple[indicePregunta].imagenEnunciado != "") {
        document.getElementById("imagenEnunciado").src = preguntasOpcionMultiple[indicePregunta].imagenEnunciado;
    } else {
        document.getElementById("imagenEnunciado").src = "static/imagenes/vacio.png";
    }
    document.getElementById("divRespuestasOpcionMultiple").removeAttribute("hidden");

    if (document.getElementById("res1")) {
        for (var j = 0; j < 4; j++) {
            var elemento = document.getElementById("res" + (j + 1));
            elemento.parentNode.removeChild(elemento);
        }
    }
    for (let j = 0; j < 4; j++) {
        let boton = document.createElement("BUTTON");
        boton.setAttribute("id", "res" + (j + 1));
        boton.setAttribute("onclick", "validarRespuesta(this)");
        boton.setAttribute("class", "btn btn-block btn-outline-dark cortaPalabra");
        boton.setAttribute("type", "button");
        boton.style.margin = "0px 5px";
        document.getElementById("botonTextoUnir" + (j + 1)).appendChild(boton);
    }
    if (preguntasOpcionMultiple[indicePregunta].hasOwnProperty("imagenRes1") && preguntasOpcionMultiple[indicePregunta].imagenRes1 != "") {
        for (var j = 0; j < 4; j++) {
            var images = document.createElement("IMG");
            switch (j) {
                case 0:
                    images.setAttribute("src", preguntasOpcionMultiple[indicePregunta].imagenRes1);
                    break;
                case 1:
                    images.setAttribute("src", preguntasOpcionMultiple[indicePregunta].imagenRes2);
                    break;
                case 2:
                    images.setAttribute("src", preguntasOpcionMultiple[indicePregunta].imagenRes3);
                    break;
                case 3:
                    images.setAttribute("src", preguntasOpcionMultiple[indicePregunta].imagenRes4);
                    break;
            }
            images.setAttribute("id", "imagenRes" + (j + 1));
            images.setAttribute("class", "img-thumbnail");
            images.setAttribute("height", "50");
            images.setAttribute("width", "50");
            document.getElementById("res" + (j + 1)).appendChild(images);
        }
    }

    else {
        for (var j = 0; j < 4; j++) {
            var texto = "";
            document.getElementById("res" + (j + 1)).setAttribute("value", "res");
            switch (j) {
                case 0:
                    texto = document.createTextNode(preguntasOpcionMultiple[indicePregunta].res1);
                    break;
                case 1:
                    texto = document.createTextNode(preguntasOpcionMultiple[indicePregunta].res2);
                    break;
                case 2:
                    texto = document.createTextNode(preguntasOpcionMultiple[indicePregunta].res3);
                    break;
                case 3:
                    texto = document.createTextNode(preguntasOpcionMultiple[indicePregunta].res4);
                    break;
            }
            document.getElementById("res" + (j + 1)).appendChild(texto);

        }
    }
    resCorrecta = preguntasOpcionMultiple[indicePregunta].respuestaCorrecta;
}

function cargarPreguntaUnirVoltear(indicePregunta, texto, a) {
    if (idSocketActual != turnoJugadores[0]) {
        document.getElementById("unir").classList.add("disabledbutton");
        document.getElementById("reiniciarUnir").classList.add("invisible");
        document.getElementById("enviarUnir").classList.add("invisible")

    }
    else {
        if (document.getElementById("unir").classList.contains("disabledbutton")) {
            document.getElementById("unir").classList.remove("disabledbutton")
        }
        if (document.getElementById("reiniciarUnir").classList.contains("invisible")) {
            document.getElementById("reiniciarUnir").classList.remove("invisible")
        }
        if (document.getElementById("enviarUnir").classList.contains("invisible")) {
            document.getElementById("enviarUnir").classList.remove("invisible")
        }
    }
    document.getElementById("botonImagenAUnir" + (a)).setAttribute("nombre", preguntasUnirVoltear[indicePregunta].imagen);
    document.getElementById("imagenAUnir" + (a)).src = preguntasUnirVoltear[indicePregunta].imagen;
    document.getElementById("textoAUnir" + (a)).innerHTML = texto;
}

function obtenerId(e) {
    let id = e.id;
    switch (true) {

        case respuestaUnir.length < 2:
            document.getElementById(id).style.border = "thick solid #B78E4C";
            document.getElementById(id).style.background = "#B78E4C";
            document.getElementById(id).style.color = "black";
            break;
        case respuestaUnir.length < 4:
            document.getElementById(id).style.border = "thick solid #4CB0B7";
            document.getElementById(id).style.background = "#4CB0B7";
            document.getElementById(id).style.color = "black";

            break;
        case respuestaUnir.length < 6:
            document.getElementById(id).style.border = "thick solid #864CB7";
            document.getElementById(id).style.background = "#864CB7";
            document.getElementById(id).style.color = "black";

            break;
        case respuestaUnir.length < 8:
            document.getElementById(id).style.border = "thick solid #F9B052";
            document.getElementById(id).style.background = "#F9B052";
            document.getElementById(id).style.color = "black";

            break;

    }
    respuestaUnir.push(id);

    if (turnoJugadores[0] == idSocketActual) {
        socket.emit("respuestaUnir", roomActual, respuestaUnir);
    }

    if (imagenUnir.indexOf(id) >= 0) {
        for (let i = 0; i < imagenUnir.length; i++) {
            document.getElementById(imagenUnir[i]).setAttribute("disabled", "");
        }
        for (let j = 0; j < textoUnir.length; j++) {
            if (respuestaUnir.indexOf(textoUnir[j]) > 0) {
                document.getElementById(textoUnir[j]).setAttribute("disabled", "");
            } else {
                document.getElementById(textoUnir[j]).removeAttribute("disabled");
            }
        }
    } else if (textoUnir.indexOf(id) >= 0) {
        for (let k = 0; k < textoUnir.length; k++) {
            document.getElementById(textoUnir[k]).setAttribute("disabled", "");
        }

        for (let l = 0; l < imagenUnir.length; l++) {
            if (respuestaUnir.indexOf(imagenUnir[l]) >= 0) {
                document.getElementById(imagenUnir[l]).setAttribute("disabled", "");
            } else {
                document.getElementById(imagenUnir[l]).removeAttribute("disabled");
            }
        }
    }
}

function verificarCompletoUnir() {
    if (respuestaUnir.length != 8) {
        document.getElementById("enviarUnir").setAttribute("disabled", "");
    }
    else {
        document.getElementById("enviarUnir").removeAttribute("disabled");
    }
}

function reiniciarUnir() {
    for (let i = 0; i < respuestaUnir.length; i++) {
        document.getElementById(respuestaUnir[i]).removeAttribute("style");
        document.getElementById(respuestaUnir[i]).style.border = "gray";
        if (imagenUnir.indexOf(respuestaUnir[i]) >= 0) {
            document.getElementById(respuestaUnir[i]).removeAttribute("disabled");
        }
    }

    for (let j = respuestaUnir.length; j > 0; j--) {
        respuestaUnir.pop();
    }
    if (turnoJugadores[0] == idSocketActual) {
        socket.emit("respuestaUnir", roomActual, respuestaUnir);
    }
}

function mostrarMensajeParEncontrado(url) {
    let indicePreguntaUnir = preguntasUnirVoltear.map(function (e) {
        return e.imagen
    }).indexOf(url);
    if (indicePreguntaUnir >= 0) {
        document.getElementById("ultimoPar").setAttribute("src", url);
        document.getElementById("ultimoNombre").innerHTML = preguntasUnirVoltear[indicePreguntaUnir].texto;
    }

}

function validarRespuesta(boton) {
    if (turnoJugadores[0] == idSocketActual) {
        socket.emit("respuestaOpcionMultiple", roomActual, boton.id);
    }
    if (boton.id == resCorrecta) {
        desafioCorrecto();
        document.getElementById(boton.id).classList.remove('btn-outline-dark');
        document.getElementById(boton.id).classList.add('btn-success');
    }
    else {
        desafioIncorrecto();
        document.getElementById(boton.id).classList.remove("btn-outline-dark");
        document.getElementById(boton.id).classList.add("btn-danger");
        document.getElementById(resCorrecta).classList.remove("btn-outline-dark");
        document.getElementById(resCorrecta).classList.add("btn-success");
    }

    voltearTarjeta(2000);
}

function verificarRespuestaUnir() {
    if (turnoJugadores[0] == idSocketActual) {
        socket.emit('verificarUnir', roomActual);
    }
    let contadorRespuestas = 0;
    for (let j = 0; j < respuestaUnir.length - 1; j = j + 2) {
        for (let k = 0; k < respuestaCorrectaUnir.length - 1; k++) {
            let idBoton1 = respuestaUnir[j];
            let idBoton2 = respuestaUnir[j + 1];
            if (idBoton1 == respuestaCorrectaUnir[k]
                && document.getElementById(idBoton2).textContent == respuestaCorrectaUnir[k + 1]) {
                contadorRespuestas++;
                k = respuestaUnir.length;
            }
            else {
                k++;
            }
        }
    }
    let texto = [];
    for (let a = 0; a < respuestaUnir.length - 1; a = a + 2) {
        texto.push(document.getElementById(respuestaUnir[a + 1]).textContent);
    }
    for (let x = 0; x < respuestaCorrectaUnir.length - 1; x = x + 2) {
        for (let y = 0; y < respuestaUnir.length - 1; y = y + 2) {
            if (respuestaCorrectaUnir[x] == respuestaUnir[y]) {
                document.getElementById("textoAUnir" + ((x / 2) + 1)).textContent = texto[y / 2];
                y = respuestaUnir.length;
            }
        }
    }
    for (let c = 0; c < respuestaCorrectaUnir.length - 1; c = c + 2) {
        for (let d = 1; d < 5; d++) {
            if (respuestaCorrectaUnir[c + 1] == document.getElementById("textoAUnir" +d).textContent) {
                document.getElementById("textoAUnir" + (d)).style.background = document.getElementById(respuestaCorrectaUnir[c]).style.background;
                d = 5;
            }
        }
    }

    mostrarRespuestaCorrectaUnir();
    if (contadorRespuestas == 4) {
        desafioCorrecto();
    }
    else {
        desafioIncorrecto();
    }
    document.getElementById("botonLanzar").classList.add("disabledbutton");
    document.getElementById("botonLanzar").classList.add("invible");
    voltearTarjeta(2000);
    setTimeout(function () {
        reiniciarUnir();
    }, 2000)
}

function desafioIncorrecto() {
    mostrarMensaje("snackbarIn");
    respuestaCorrecta = false;
    if (turnoJugadores[0] == idSocketActual) {
        socket.emit('pasarTurno', roomActual);
    }
}

function desafioCorrecto() {
    mostrarMensaje("snackbar");
    respuestaCorrecta = true;
}

function misterioPositivo() {
    mostrarMensaje("snackbarPositivo");
}

function misterioNegativo() {
    mostrarMensaje("snackbarNegativo");
}

function mostrarMensaje(texto) {
    let x = document.getElementById(texto);
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 2000);
}

function mostrarRespuestaCorrectaUnir() {
    for (let i = 0; i < 4; i++) {
        if (document.getElementById("textoAUnir" + (i + 1)).textContent == respuestaCorrectaUnir[(i * 2) + 1]) {
            document.getElementById("textoAUnir" + (i + 1)).style.border = "thick solid green";
            document.getElementById("botonImagenAUnir" + (i + 1)).style.border = "thick solid green";
        } else {
            document.getElementById("textoAUnir" + (i + 1)).style.border = "thick solid red";
            document.getElementById("botonImagenAUnir" + (i + 1)).style.border = "thick solid red";
        }
    }
}

function darLaVuelta() {
    document.getElementById("tarjeta").style.transform = "perspective( 600px ) rotateY( -180deg )";
    document.getElementById("desafios").style.transform = "perspective( 600px ) rotateY( 0deg )";
    if (turnoJugadores[0] == idSocketActual) {
        socket.emit('darLaVuelta', roomActual);
    }
    if(respuestaVoltearATiempo== 0){
        tiempoVoltear = 100;
        controlarTiempo();
    }
}

function voltearTarjeta(t) {
    setTimeout(function () {
            document.getElementById("desafios").style.transform = "perspective( 600px ) rotateY( 180deg )";
            document.getElementById('tarjeta').style.backgroundColor = "#bdffbf";
            document.getElementById("tarjeta").style.transform = "perspective( 600px ) rotateY( 0deg )";
            document.getElementById('textoTarjeta').innerText = "Polhibou";
            setTimeout(function () {
                document.getElementById('desafios').style.backgroundColor = "#bdffbf";
            }, 1000);
        }
        , t);
}
function finalizarPartida() {
    let r = confirm("¿Está seguro de finalizar la partida?");
    if (r == true) {
        socket.emit('partidaCancelada', roomActual);
        document.getElementById('linkFinalizarPartida').click();
    }
}