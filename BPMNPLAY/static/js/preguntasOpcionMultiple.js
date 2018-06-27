var socket = io();
var imagenes = [];
var file = null, file1 = null, file2 = null, file3 = null, file4 = null;
var botonArchivoEnunciado = document.getElementById("botonArchivoEnunciado")
botonArchivoEnunciado.addEventListener('change', function (e) {
        file = e.target.files[0];
        if (imagenes.indexOf("file") < 0) {
            imagenes.push("file");
        }
    }
)

var botonArchivoRes1 = document.getElementById("botonArchivoRes1")
botonArchivoRes1.addEventListener('change', function (e) {
        file1 = e.target.files[0];
        if (imagenes.indexOf("file1") < 0) {
            imagenes.push("file1");
        }
    }
)

var botonArchivoRes2 = document.getElementById("botonArchivoRes2")
botonArchivoRes2.addEventListener('change', function (e) {
        file2 = e.target.files[0];
        if (imagenes.indexOf("file2") < 0) {
            imagenes.push("file2");
        }
    }
)

var botonArchivoRes3 = document.getElementById("botonArchivoRes3")
botonArchivoRes3.addEventListener('change', function (e) {
        file3 = e.target.files[0];
        if (imagenes.indexOf("file3") < 0) {
            imagenes.push("file3");
        }
    }
)

var botonArchivoRes4 = document.getElementById("botonArchivoRes4")
botonArchivoRes4.addEventListener('change', function (e) {
        file4 = e.target.files[0];
        if (imagenes.indexOf("file4") < 0) {
            imagenes.push("file4");
        }
    }
)


var mostrarVistaPreviaImagen = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};


function mostrarRespuestas(valor) {
    if (valor == 1) {
        document.getElementById("divRespuestasTexto").removeAttribute("hidden")
        document.getElementById("divRespuestasImagenes").setAttribute("hidden", "")
        document.getElementById("soloImagenes").setAttribute("hidden", "")

    }
    if (valor == 2) {

        document.getElementById("divRespuestasImagenes").removeAttribute("hidden")
        document.getElementById("divRespuestasTexto").setAttribute("hidden", "")
        document.getElementById("soloTexto").setAttribute("hidden", "")

    }
    document.getElementById("divRespuestas").removeAttribute("hidden")
    document.getElementById("divBotonGuardar").removeAttribute("hidden")

}


function verificarBotonGuardar() {
    console.log("hola" + document.getElementById("enunciado").value)
    if (document.getElementById("enunciado").value != ""
        &&
        ((document.getElementById("res1").value != ""
            && document.getElementById("res2").value != ""
            && document.getElementById("res3").value != ""
            && document.getElementById("res4").value != "")
            || (document.getElementById("botonArchivoRes1").value != ""
                && document.getElementById("botonArchivoRes2").value != ""
                && document.getElementById("botonArchivoRes3").value != ""
                && document.getElementById("botonArchivoRes4").value != ""))) {
        document.getElementById("botonGuardar").removeAttribute("disabled")
    }
    else {
        document.getElementById("botonGuardar").setAttribute("disabled", "")
    }
    console.log("tamaño " + imagenes.length)

}

function guardarPreguntaOpcionMultiple(){

    var preguntaOpcionMultiple = {
        usuario : "bquispi",
        idMateria : "bpmn",
        enunciado: document.getElementById('enunciado').value,
        res1: document.getElementById('res1').value,
        res2: document.getElementById('res2').value,
        res3: document.getElementById('res3').value,
        res4: document.getElementById('res4').value,
        resCorrecta : document.getElementById('resCorrecta').value
    }

    socket.emit('guardarPreguntaOpcionMultiple', imagenes, file, file1, file2, file3, file4, preguntaOpcionMultiple);
}