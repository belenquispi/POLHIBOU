var ctx = null;
var contexto = null;
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
var colorJugador = ["#01DF3A", "#FE2E2E", "#0431B4", "#61380B", "#8904B1"];
var vistaDado = 0;
var anchoCasilla = 80, altoCasilla = 80;
var columnas = 8, filas = 8;
var currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;
var clic1 = false;
var clic2 = false;
var clic3 = false;
var clic4 = false;
var dado = -1, dadoAnterior;
var gameTime = 0;
var gameSpeeds = [
    {name: "Normal", mult: 1},
    {name: "Paused", mult: 0}
];
var currentSpeed = 0;
var directions = {
    up: 0,
    right: 1,
    down: 2,
    left: 3
};
var jugadores = [];
var jugadoresPos = [];
var jugadorActual = new Character();
var color1 = new Image();
var color2 = new Image();
var color3 = new Image();
var patterColor1, patterColor2, patterColor3;
var mueve = 0;
var respuestaCorrecta = false;
var respuestaCorrectaUnir = ['imagen1','respuesta4','imagen2','respuesta3','imagen3','respuesta1','imagen4','respuesta2'];
var imagenUnir = ['imagen1','imagen2','imagen3','imagen4'];
var textoUnir = ['respuesta1','respuesta2','respuesta3','respuesta4'];
var respuestaUnir = [];
var memory_array = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D'];
var memory_values = [];
var memory_tile_ids = [];
var tiles_flipped = 0;

function Character(c, x, y) {
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
}

Character.prototype.placeAt = function (x, y) {
    this.tileFrom = [x, y];
    this.tileTo = [x, y];
    this.position = [((anchoCasilla * x) + ((anchoCasilla - this.dimensions[0]) / 2)), ((altoCasilla * y) + ((altoCasilla - this.dimensions[1]) / 2))];
};

Character.prototype.processMovement = function (t) {
    if (this.tileFrom[0] == this.tileTo[0] && this.tileFrom[1] == this.tileTo[1]) {
        return false;
    }

    if (this.casilla == 33) {
        ocultarBoton(jugadorActual.boton);
        dado = 0;
    }

    if ((t - this.timeMoved) >= this.delayMove) {
        this.placeAt(this.tileTo[0], this.tileTo[1]);

        if (dado > 1) {
            if (this.canMoveDirection(this.direction)) {
                this.moveDirection(this.direction, t);
            }
            else {
                this.nuevaDireccion();
                this.moveDirection(this.direction, t);
            }
            dado = dado - 1;
            mueve -= 2;
        }
        else {
            clic1 = false;
            clic2 = false;
            clic3 = false;
            clic4 = false;
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


window.onload = function () {


        obtenerPreguntas();



    seleccionarColor();
    ctx = document.getElementById('game').getContext("2d");
    agregarJugador(3);
    requestAnimationFrame(drawGame);
    ctx.font = "bold 10pt sans-serif";
    color1.src = "0.png";
    color2.src = "1.png";
    color3.src = "2.png";
    document.getElementById("boton1").addEventListener("click", function () {
        jugadorActual = jugadores[0];
        jugadorActual.boton = "boton1";
        clic1 = true;
    });
    document.getElementById("boton2").addEventListener("click", function () {
        jugadorActual = jugadores[1];
        jugadorActual.boton = "boton2";
        clic2 = true;
    });
    document.getElementById("boton3").addEventListener("click", function () {
        jugadorActual = jugadores[2];
        jugadorActual.boton = "boton3";
        clic3 = true;
    });
    document.getElementById("boton4").addEventListener("click", function () {
        jugadorActual = jugadores[3];
        jugadorActual.boton = "boton4";
        clic4 = true;
    });
    window.addEventListener("keyup", function (e) {
        if (e.keyCode == 83) {
            currentSpeed = (currentSpeed >= (gameSpeeds.length - 1) ? 0 : currentSpeed + 1);
        }
    })
};

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

function dadoRandomico() {
    dado = Math.floor(Math.random() * 6 + 1);
    vistaDado = dado;
    if (dado == dadoAnterior) {
        dadoRandomico();
    }
}

function ocultarBoton(boton) {
    document.getElementById(boton).style.visibility = 'hidden';
}

function actualizarCasilla() {

    for (var i = 0; i < jugadores.length; i++) {
        document.getElementById("jugador" + (i + 1)).innerHTML = (jugadores[i].casilla).toString();
    }
}

function agregarJugador(num) {

    for (var i = 0; i < num; i++) {
        var jugador = new Character(i, 180, 580);
        jugadores.push(jugador);

        if (i >= 2) {
            document.getElementById("tablajug" + (i + 1)).style.visibility = "visible";
        }
    }
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

function agregarPuestoJugador(jugadorAct) {
    var exite = false;
    if (jugadorAct.casilla == 33) {
        if (jugadoresPos.length == 0) {
            jugadoresPos.push(jugadorAct);
        }
        for (var i = 0; i < jugadoresPos.length; i++) {
            if (jugadorAct.colorP == jugadoresPos[i].colorP) {
                exite = true;
            }
        }
        if (!exite) {
            jugadoresPos.push(jugadorAct);
        }
        for (var x = 0; x < jugadoresPos.length; x++) {
            for (var y = 0; y < jugadores.length; y++) {
                if (jugadores[y].colorP == jugadoresPos[x].colorP) {
                    jugadores[y].puesto = (x + 1);
                }
            }
        }
    }
}

function ordenar() {
    var indiceMa = [];
    var cont = 0, juga = -1;

    for (var i = 0; i < jugadores.length; i++) {
        indiceMa.push(jugadores[i].casilla);
    }

    for (var j = 0; j < indiceMa.length; j++) {
        if (indiceMa[j] == Math.max.apply(null, indiceMa)) {
            cont++;
            juga = j;
        }
    }

    if (cont == 1 && (Math.max.apply(null, indiceMa) != 33)) {
        for (var j = 0; j < indiceMa.length; j++) {
            document.getElementById("corona" + (j + 1)).style.visibility = 'hidden';
            if (j == juga) {
                document.getElementById("corona" + (j + 1)).style.visibility = 'visible';
            }
        }
    } else {

        for (var j = 0; j < indiceMa.length; j++) {
            document.getElementById("corona" + (j + 1)).style.visibility = 'hidden';
        }

        for (var j = 0; j < jugadores.length; j++) {
            switch (jugadores[j].puesto) {
                case 1:
                    document.getElementById("corona" + (j + 1)).src = "coronaOro.png";
                    document.getElementById("corona" + (j + 1)).style.visibility = 'visible';
                    break;
                case 2:
                    document.getElementById("corona" + (j + 1)).src = "coronaPlata.png";
                    document.getElementById("corona" + (j + 1)).style.visibility = 'visible';
                    break;
                case 3:
                    document.getElementById("corona" + (j + 1)).src = "coronaBronce.png";
                    document.getElementById("corona" + (j + 1)).style.visibility = 'visible';
                    break;
                default:
                    document.getElementById("corona" + (j + 1)).style.visibility = 'hidden';
                    break;
            }
        }
    }
}

function mostrarDesafio(jugadorAct) {
    var colorCa;
    for (var x = 0; x < filas; ++x) {
        for (var y = 0; y < columnas; ++y) {
            if ((gameMap[((x * columnas) + y)]) == (jugadorAct.casilla + dado)) {
                colorCa = colorMap[((x * columnas) + y)];

                switch (colorCa) {
                    case 0:
                        document.getElementById("tipoJuego").innerHTML = "Voltear";
                        document.getElementById("desafios").removeAttribute("hidden");
                        document.getElementById("memory_board").removeAttribute("hidden");
                        document.getElementById("unir").setAttribute("hidden", "");
                        document.getElementById("opcionMultiple").setAttribute("hidden", "");

                        break;
                    case 1:
                        document.getElementById("tipoJuego").innerHTML = "Unir";
                        document.getElementById("desafios").removeAttribute("hidden");
                        document.getElementById("unir").removeAttribute("hidden");
                        document.getElementById("memory_board").setAttribute("hidden", "");
                        document.getElementById("opcionMultiple").setAttribute("hidden", "");
                        break;
                    case 2:
                        cargarPreguntas();
                        document.getElementById("tipoJuego").innerHTML = "Opción Múltiple";
                        document.getElementById("desafios").removeAttribute("hidden");
                        document.getElementById("opcionMultiple").removeAttribute("hidden");
                        document.getElementById("unir").setAttribute("hidden", "");
                        document.getElementById("memory_board").setAttribute("hidden", "");

                        break;
                    default:
                }
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
    actualizarCasilla();
    var sec = Math.floor(Date.now() / 1000);
    if (sec != currentSecond) {
        currentSecond = sec;
        framesLastSecond = frameCount;
        frameCount = 1;
    }
    else {
        frameCount++;
    }

    if (!jugadorActual.processMovement(gameTime) && gameSpeeds[currentSpeed].mult != 0) {
        if (clic1 || clic2 || clic3 || clic4) {

            if (jugadorActual.casilla <= 33) {
                if (!respuestaCorrecta) {
                    dadoRandomico();
                    moverDado(dado);
                    mostrarDesafio(jugadorActual);
                }
                dadoAnterior = dado;
                if (respuestaCorrecta) {
                    respuestaCorrecta = false;
                    if (jugadorActual.canMoveUp()) {
                        jugadorActual.moveUp(gameTime);
                    }
                    else if (jugadorActual.canMoveDown()) {
                        jugadorActual.moveDown(gameTime);
                    }
                    else if (jugadorActual.canMoveLeft()) {
                        jugadorActual.moveLeft(gameTime);
                    }
                    else if (jugadorActual.canMoveRight()) {
                        jugadorActual.moveRight(gameTime);
                    }
                }
            }
            clic1 = false;
            clic2 = false;
            clic3 = false;
            clic4 = false;
        }
    }

    agregarPuestoJugador(jugadorActual);

    ordenar();

    for (var y = 0; y < filas; ++y) {
        for (var x = 0; x < columnas; ++x) {
            color1.src = '0.png';
            color2.src = '1.png';
            color3.src = '2.png';
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
    var output = '';
    memory_array.memory_tile_shuffle();
    for (var i = 0; i < memory_array.length; i++) {
        output += '<div id="tile_' + i + '" onclick="memoryFlipTile(this,\'' + memory_array[i] + '\')"></div>';
    }
    document.getElementById('memory_board').innerHTML = output;

}

function memoryFlipTile(tile, val) {
    if (tile.innerHTML == "" && memory_values.length < 2) {
        tile.style.background = '#FFF';
        tile.innerHTML = val;
        if (memory_values.length == 0) {
            memory_values.push(val);
            memory_tile_ids.push(tile.id);
        } else if (memory_values.length == 1) {
            memory_values.push(val);
            memory_tile_ids.push(tile.id);
            if (memory_values[0] == memory_values[1]) {
                tiles_flipped += 2;
                // Clear both arrays
                memory_values = [];
                memory_tile_ids = [];
                // Check to see if the whole board is cleared
                if (tiles_flipped == memory_array.length) {
                    // alert("Board cleared... generating new board");
                    desafioCorrecto();
                    document.getElementById('memory_board').innerHTML = "";
                    newBoard();
                }
            } else {
                function flip2Back() {
                    // Flip the 2 tiles back over
                    var tile_1 = document.getElementById(memory_tile_ids[0]);
                    var tile_2 = document.getElementById(memory_tile_ids[1]);
                    tile_1.style.background = 'url(corona.png) no-repeat';
                    tile_1.innerHTML = "";
                    tile_2.style.background = 'url(corona.png) no-repeat';
                    tile_2.innerHTML = "";
                    // Clear both arrays
                    memory_values = [];
                    memory_tile_ids = [];
                }

                setTimeout(flip2Back, 700);
            }
        }
    }
}

function validarRespuesta(boton)
{
    if(boton.id == resCorrecta )
    {
        desafioCorrecto();

    }
    else
    {
        desafioIncorrecto()
    }
}


function desafioIncorrecto()
{
    mostrarMensaje("snackbarIn");
    respuestaCorrecta = false;
    document.getElementById("desafios").setAttribute("hidden","");
}




function desafioCorrecto()
{
    mostrarMensaje("snackbar");
    respuestaCorrecta = true;
    clic1 = true;
    document.getElementById("desafios").setAttribute("hidden","");
}

function moverDado(cara) {
    var element;
    switch (cara) {
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

function mostrarMensaje(texto) {
    var x = document.getElementById(texto);
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 2000);
}

function obtenerId(e) {
    var id = e.id;
    switch (true){

        case respuestaUnir.length < 2:
            console.log("verde")
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

function reiniciarUnir() {
    for (var i =0; i < respuestaUnir.length; i++){
        document.getElementById(respuestaUnir[i]).style.border = "gray";
        document.getElementById(respuestaUnir[i]).removeAttribute("disabled");
    }
    for(var i = respuestaUnir.length; i > 0 ; i--) {
        respuestaUnir.pop();
    }
}

function verificarCompletoUnir() {
    if(respuestaUnir.length != 8)
    {
        document.getElementById("enviarUnir").setAttribute("disabled","");
    }
    else {
        document.getElementById("enviarUnir").removeAttribute("disabled");
    }
}
function verificarRespuestaUnir() {
    var contadorRespuestas = 0;
    for(var j = 0; j < respuestaUnir.length-1; j++){
        for (var k = 0; k < respuestaCorrectaUnir.length-1; k++)
        {
            if(respuestaUnir[j] == respuestaCorrectaUnir[k] && respuestaUnir[j+1] == respuestaCorrectaUnir[k+1])
            {
                contadorRespuestas++;
                j++;
                k = respuestaUnir.length
            }

        }
    }
    if(contadorRespuestas == 4)
    {
        respuestaCorrecta = true;
    }

}
