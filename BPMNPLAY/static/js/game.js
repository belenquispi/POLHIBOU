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
var imagenUnir = ['botonImagenAUnir1','botonImagenAUnir2','botonImagenAUnir3','botonImagenAUnir4'];
var textoUnir = ['textoAUnir1','textoAUnir2','textoAUnir3','textoAUnir4'];

function dados(nombrePartida) {
    this.nombrePartida = nombrePartida;
    this.dado1 = dado1;
    this.dado2 = dado2;
}

function obtenerDatosQuienSeConecto() {
    var parameters = location.search.substring(1).split("&");
    var temp = parameters[0].split("=");
    roomActual = temp[1];
    temp = parameters[1].split("=");
    rol = temp[1];
    temp = parameters[2].split("=");
    nombreEquipo = temp[1];
    console.log("eeee   " + roomActual, rol, nombreEquipo);
}

window.onload = function () {
    obtenerDatosQuienSeConecto();
    socket.emit('new player', roomActual, rol, nombreEquipo);
    color1.src = 'static/imagenes/0.png';
    color2.src = 'static/imagenes/1.png';
    color3.src = 'static/imagenes/2.png';
    casillaInicio.src = 'static/inicio.jpg';
    casillaIncierto.src = 'static/imagenes/incierto.png';
    casillaFin.src = 'static/fin.jpg';
    casillaB.src = 'static/imagenes/b.png';
    casillaP.src = 'static/imagenes/p.png';
    casillaM.src = 'static/imagenes/m.png';
    casillaN.src = 'static/imagenes/n.png';
    casillaPlay.src = 'static/imagenes/play.png';
    console.log("carge las imagenes");
    ctx = document.getElementById('game').getContext("2d");
    requestAnimationFrame(drawGame);
    ctx.font = "bold 10pt sans-serif";
    console.log("adios")
};

socket.on('nombreRol', function (nombre) {
    document.getElementById("sesion").innerHTML = nombre;
});

socket.on('error', function (nombre) {
    alert(nombre);
});

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
    preguntasOpcionMultiple = data.preguntasOpcionMultiple;
    preguntasUnirVoltear = data.preguntasUnirVoltear;
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
    console.log("rrr: " + idSocket + "  " + idSocketActual);
    if (idSocket == idSocketActual) {
        if (document.getElementById("botonLanzar")) {
            document.getElementById("botonLanzar").classList.add("invisible")
            document.getElementById("botonLanzar").classList.add("disabledbutton")
        }
    }
});

socket.on('emparejar', function (array) {
    console.log(array.length);
    memory_array = array;
    newBoard();
});

socket.on('respondiendoIndicePreguntaOpcionMultiple', function (indicePregunta) {
    console.log("Voy a cargar opcion")
    cargarPreguntaOpcionMultiple(indicePregunta);
});

socket.on('respondiendoIndicePreguntaUnir', function (arrayIndices, arrayTexto) {
    console.log("Voy a cargar unir "+ arrayIndices)
    cargarPreguntaUnirVoltear(arrayIndices[0],arrayTexto[0],1);
    cargarPreguntaUnirVoltear(arrayIndices[1],arrayTexto[1],2);
    cargarPreguntaUnirVoltear(arrayIndices[2],arrayTexto[2],3);
    cargarPreguntaUnirVoltear(arrayIndices[3],arrayTexto[3],4);
});

socket.on('respondiendoIndicePreguntaVoltear', function (memory) {
    memory_array = memory ;
    console.log("Voy a cargar voltear "+ memory)
    newBoard();
});

socket.on('enviandoParEncontrado', function (memory_tile_ids, idSocketN) {
console.log("un par recibido" + memory_tile_ids.length)
console.log("socket id" + idSocketN)
console.log("socket actual" + idSocketActual)
    if(idSocketN != idSocketActual){
        for(var i = 0; i < memory_tile_ids.length; i++)
        {
            console.log("clic en "+memory_tile_ids[i]);
            document.getElementById(memory_tile_ids[i]).click();
        }
    }
})

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
                    //ctx.fillStyle = "#6A0888";
                    ctx.fillStyle = "#0B610B";
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
        if (jugadores[i].idSocket != "") {
            ctx.fillStyle = jugadores[i].colorP;
            per1.src = 'static/imagenes/trebol.png';
            per2.src = 'static/imagenes/star.png';
            per3.src = 'static/imagenes/mal.png';
            per4.src = 'static/imagenes/pintura.png';
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
}

function desbloquearBoton() {
    if (document.getElementById("botonLanzar")) {
        document.getElementById("botonLanzar").classList.remove("invisible")
        document.getElementById("botonLanzar").classList.remove("disabledbutton")
        /*
        document.getElementById("botonLanzar").removeAttribute("disabled");
        document.getElementById("botonLanzar").style.backgroundColor = "#0174DF";
        document.getElementById("botonLanzar").style.borderColor = "#0174DF";
        */
    }
}

function bloquearBoton() {
    if (document.getElementById("botonLanzar")) {
        /*
        document.getElementById("botonLanzar").setAttribute("disabled", "");
        document.getElementById("botonLanzar").style.backgroundColor = "white";
        document.getElementById("botonLanzar").style.borderColor = "white";

        */
        document.getElementById("botonLanzar").classList.add("invisible")
        document.getElementById("botonLanzar").classList.add("disabledbutton")
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
            if(jugadores[i].idSocket != "") {
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

    for (var j = 0; j < jugadores.length; j++) {
        if (!document.getElementById("imagenJugador" + (j + 1)) && jugadores[j].idSocket !="" ) {
            var images = document.createElement("IMG");
            images.setAttribute("src", "static/buhoInicial" + (jugadores[j].iconoEquipo) + ".gif");
            images.setAttribute("id", "imagenJugador" + (j + 1));
            images.setAttribute("height", "50");
            images.setAttribute("width", "50");
            document.getElementById("columna" + (j + 1)).appendChild(images);
            document.getElementById("nombreEquipo"+(j+1)).innerHTML = jugadores[j].nombreEquipo;
        }
    }

    if (indiceJugadorActual >= 0 && turnoJugadores.length > 0) {
        if (document.getElementById("tablajug" + (indiceJugadorActual + 1))) {
            document.getElementById("tablajug" + (indiceJugadorActual + 1)).style.border = "thick solid #A9BCF5";
            cambiarImagen(indiceJugadorActual);
        }
    }
    else {
        for (var j = 0; j < turnoJugadores.length; j++) {
            if (jugadores.length > 0) {
                document.getElementById("imagenJugador" + (j + 1)).src = "static/buhoInicial" + jugadores[j].iconoEquipo + ".gif";
            }
        }
    }
}

function cambiarImagen(num) {
    for (var j = 0; j < turnoJugadores.length; j++) {
        console.log("j" + j);
        if (j == num) {
            document.getElementById("imagenJugador" + (j + 1)).src = "static/buho" + jugadores[j].iconoEquipo + ".gif";
        } else {
            if(document.getElementById("imagenJugador" + (j + 1))) {
                document.getElementById("imagenJugador" + (j + 1)).src = "static/buhoInicial" + jugadores[j].iconoEquipo + ".gif";
            }
        }
    }
}

function mostrarDesafio(colorCa, idSocket) {
   switch (colorCa) {
        case 0:
            //newBoard();
            if(idSocket == idSocketActual)
            {
                socket.emit('solicitarPreguntaVoltear',roomActual);}
            document.getElementById("tipoJuego").innerHTML = "Voltear";
            document.getElementById("desafios").removeAttribute("hidden");
            document.getElementById("memory_board").removeAttribute("hidden");
            document.getElementById("unir").setAttribute("hidden", "");
            document.getElementById("opcionMultiple").setAttribute("hidden", "");
            break;
        case 1:
            // mostrarUnir();
            if(idSocket == idSocketActual)
            {
            socket.emit('solicitarPreguntaUnir',roomActual);}
            document.getElementById("tipoJuego").innerHTML = "Unir";
            document.getElementById("desafios").removeAttribute("hidden");
            document.getElementById("unir").removeAttribute("hidden");
            document.getElementById("memory_board").setAttribute("hidden", "");
            document.getElementById("opcionMultiple").setAttribute("hidden", "");
            break;
        case 2:
            // cargarPreguntasOpcionMultiple();
            if(idSocket == idSocketActual)
            { socket.emit('solicitarPreguntaOpcionMultiple',roomActual); }
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
        if(idSocketActual == turnoJugadores[0]) {
            output += '<img id="tile_' + i + '" alt="" onclick="memoryFlipTile(this,\'' + memory_array[i] + '\')">';
        }
        else
        {
            output += '<img id="tile_' + i + '"  class = "disabledbutton" alt="" onclick="memoryFlipTile(this,\'' + memory_array[i] + '\')">';
        }
    }
    document.getElementById('memory_board').innerHTML = output;
}

function memoryFlipTile(tile, val) {
    console.log("url: " + tile.src);
    if (tile.alt == "" && memory_values.length < 2) {
        console.log("url: " + tile.src);
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
                if(turnoJugadores[0] == idSocketActual) {
                    socket.emit('parEncontrado', roomActual, memory_tile_ids);
                }
                // Clear both arrays
                memory_values = [];
                memory_tile_ids = [];
                // Check to see if the whole board is cleared
                if (tiles_flipped == memory_array.length) {
                    // alert("Board cleared... generating new board");
                    desafioCorrecto();
                    document.getElementById('memory_board').innerHTML = "";
                    //newBoard();
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
    if(idSocketActual != turnoJugadores[0])
    {
     document.getElementById("opcionMultiple").classList.add("disabledbutton")
    }
    document.getElementById("enunciado").innerHTML = preguntasOpcionMultiple[indicePregunta].enunciado;
    if (preguntasOpcionMultiple[indicePregunta].urlEnunciado != null) {
        document.getElementById("imagenEnunciado").src = preguntasOpcionMultiple[indicePregunta].urlEnunciado;
    } else
    {
        document.getElementById("imagenEnunciado").src = "vacio.png";
    }
    document.getElementById("divRespuestasOpcionMultiple").removeAttribute("hidden");

    for (var j = 0; j < 4; j++) {
        console.log("Se ha ingresado a: " + j);
        var boton = document.createElement("BUTTON");
        boton.setAttribute("id", "res" + (j + 1));
        boton.setAttribute("onclick", "validarRespuesta(this)");
        boton.setAttribute("class", "btn btn-block btn-info");
        boton.setAttribute("type", "button");
        boton.style.margin = "0px 5px";
        document.getElementById("puesto" + (j + 1)).appendChild(boton);
    }

    if (preguntasOpcionMultiple[indicePregunta].urlRes1 != null) {
        for (var j = 0; j < 4; j++) {
            var images = document.createElement("IMG");
            switch (j){
                case 0:
                    console.log(j)
                    images.setAttribute("src", preguntasOpcionMultiple[indicePregunta].urlRes1);
                    break;
                case 1:
                    console.log(j)
                    images.setAttribute("src", preguntasOpcionMultiple[indicePregunta].urlRes2);
                    break;
                case 2:
                    console.log(j)
                    images.setAttribute("src", preguntasOpcionMultiple[indicePregunta].urlRes3);
                    break;
                case 3:
                    console.log(j)
                    images.setAttribute("src", preguntasOpcionMultiple[indicePregunta].urlRes4);
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
     /*   document.getElementById("divRespuestasTexto").removeAttribute("hidden");
        document.getElementById("divRespuestasImagenes").setAttribute("hidden", "");
        document.getElementById("res1").innerHTML = preguntasOpcionMultiple[indicePregunta].res1;
        document.getElementById("res2").innerHTML = preguntasOpcionMultiple[indicePregunta].res2;
        document.getElementById("res3").innerHTML = preguntasOpcionMultiple[indicePregunta].res3;
        document.getElementById("res4").innerHTML = preguntasOpcionMultiple[indicePregunta].res4; */

        for (var j = 0; j < 4; j++) {
            console.log("Se ha ingresado a: "+j);
            switch (j){
                case 0:
                    console.log(j)
                    document.getElementById("res1").innerHTML = preguntasOpcionMultiple[indicePregunta].res1;
                    break;
                case 1:
                    console.log(j)
                    document.getElementById("res1").innerHTML = preguntasOpcionMultiple[indicePregunta].res2;
                    break;
                case 2:
                    console.log(j)
                    document.getElementById("res1").innerHTML = preguntasOpcionMultiple[indicePregunta].res3;
                    break;
                case 3:
                    console.log(j)
                    document.getElementById("res1").innerHTML = preguntasOpcionMultiple[indicePregunta].res4;
                    break;
            }
        }
    }
    resCorrecta = preguntasOpcionMultiple[indicePregunta].resCorrecta;
}

function cargarPreguntaUnirVoltear(indicePregunta, texto, a) {
    if(idSocketActual != turnoJugadores[0])
    {
        document.getElementById("unir").classList.add("disabledbutton")
        document.getElementById("reiniciarUnir").classList.add("invisible")
        document.getElementById("enviarUnir").classList.add("invisible")

    }
        document.getElementById("botonImagenAUnir"+(a)).setAttribute("nombre",preguntasUnirVoltear[indicePregunta]);
        document.getElementById("imagenAUnir"+(a)).src = preguntasUnirVoltear[indicePregunta].urlImagenUnirVoltear;
        document.getElementById("textoAUnir"+(a)).innerHTML = texto;
}

function obtenerId(e) {
    var id = e.id;
    switch (true){

        case respuestaUnir.length < 2:
            document.getElementById(id).style.border = "thick solid green";
            break;
        case respuestaUnir.length < 4:
            document.getElementById(id).style.border = "thick solid red";
            break;
        case respuestaUnir.length < 6:
            document.getElementById(id).style.border = "thick solid black";
            break;
        case respuestaUnir.length < 8:
            document.getElementById(id).style.border = "thick solid yellow";
            break;

    }
    respuestaUnir.push(id);
    if(imagenUnir.indexOf(id) >= 0) {
        for(var i = 0; i<imagenUnir.length; i++){
            document.getElementById(imagenUnir[i]).setAttribute("disabled","");
        }
        for(var j = 0 ; j < textoUnir.length; j++){
            if(respuestaUnir.indexOf(textoUnir[j])>0)
            {
                document.getElementById(textoUnir[j]).setAttribute("disabled","");
            }else {
                document.getElementById(textoUnir[j]).removeAttribute("disabled");
            }
        }
    } else if (textoUnir.indexOf(id) >=0){
        for(var i = 0; i<textoUnir.length; i++) {
            document.getElementById(textoUnir[i]).setAttribute("disabled", "");
        }

        for(var j = 0 ; j < imagenUnir.length; j++){
            if(respuestaUnir.indexOf(imagenUnir[j])>=0)
            {
                document.getElementById(imagenUnir[j]).setAttribute("disabled","");
            }else {
                document.getElementById(imagenUnir[j]).removeAttribute("disabled");
            }
        }
    }
}

function verificarCompletoUnir() {
    if(respuestaUnir.length != 8) {
        document.getElementById("enviarUnir").setAttribute("disabled","");
    }
    else {
        document.getElementById("enviarUnir").removeAttribute("disabled");
    }
}

function reiniciarUnir() {
    for (var i =0; i < respuestaUnir.length; i++){
        document.getElementById(respuestaUnir[i]).style.border = "gray";
        if(imagenUnir.indexOf(respuestaUnir[i])>=0) {
            document.getElementById(respuestaUnir[i]).removeAttribute("disabled");
        }
    }
    for(var i = respuestaUnir.length; i > 0 ; i--) {
        respuestaUnir.pop();
    }
}

function desafioCorrecto() {
    mostrarMensaje("snackbar");
    respuestaCorrecta = true;
    document.getElementById("desafios").setAttribute("hidden","");

}

function mostrarMensajeParEncontrado(url) {
var indicePreguntaUnir = preguntasUnirVoltear.map(function (e) {     return e.urlImagenUnirVoltear   }).indexOf(url);
if(indicePreguntaUnir >=0) {
    document.getElementById("mensajeVoltear").removeAttribute("hidden");
    document.getElementById("nombreParEncontrado").innerHTML = preguntasUnirVoltear[indicePreguntaUnir].textoUnirVoltear;

    setTimeout(function(){
        document.getElementById("mensajeVoltear").setAttribute("hidden","");
        document.getElementById("nombreParEncontrado").innerHTML = "";
        }, 2000);
}

}

function validarRespuesta(boton) {

    if(boton.id == resCorrecta )
    { desafioCorrecto(boton.id);
    }
    else
    { desafioIncorrecto(boton.id, resCorrecta)
    }
   // document.getElementById("desafios").setAttribute("hidden","");

}

function desafioIncorrecto(idBoton, resCorrecta) {
    document.getElementById(idBoton).classList.remove("btn-info");
    document.getElementById(idBoton).classList.add("btn-danger");
    document.getElementById(resCorrecta).classList.remove("btn-info");
    document.getElementById(resCorrecta).classList.add("btn-success");
    mostrarMensaje("snackbarIn");
    respuestaCorrecta = false;
}

function desafioCorrecto(idBoton) {
    console.log("Correcto: "+ idBoton);
    document.getElementById(idBoton).classList.remove('btn-info');
    document.getElementById(idBoton).classList.add('btn-success');
    mostrarMensaje("snackbar");
    respuestaCorrecta = true;
}

function mostrarMensaje(texto) {
    var x = document.getElementById(texto);
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 2000);
}