

var botonArchivoEnunciado = document.getElementById("botonArchivoEnunciado")
botonArchivoEnunciado.addEventListener('change', function (e) {

        file = e.target.files[0];
        imagenes.push("file");
    }
)

var botonArchivoRes1 = document.getElementById("botonArchivoRes1")
botonArchivoRes1.addEventListener('change', function (e) {
    file1 = e.target.files[0];
    imagenes.push("file1");
    }
)

var botonArchivoRes2 = document.getElementById("botonArchivoRes2")
botonArchivoRes2.addEventListener('change', function (e) {
    file2 = e.target.files[0];
    imagenes.push("file2");
    }
)

var botonArchivoRes3 = document.getElementById("botonArchivoRes3")
botonArchivoRes3.addEventListener('change', function (e) {
    file3 = e.target.files[0];
    imagenes.push("file3");
    }
)

var botonArchivoRes4 = document.getElementById("botonArchivoRes4")
botonArchivoRes4.addEventListener('change', function (e) {
    file4 = e.target.files[0];
    imagenes.push("file4");
    }
)



var loadFile = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};


function mostrarRespuestas(valor) {
    if (valor == 1)
    {
        document.getElementById("divRespuestasTexto").removeAttribute("hidden")
        document.getElementById("divRespuestasImagenes").setAttribute("hidden","")

    }
    if (valor == 2)
    {

        document.getElementById("divRespuestasImagenes").removeAttribute("hidden")
        document.getElementById("divRespuestasTexto").setAttribute("hidden","")

    }
    document.getElementById("divRespuestas").removeAttribute("hidden")
    document.getElementById("divBotonGuardar").removeAttribute("hidden")

}

function quitarObligatorio(tipoRespuesta)
{
    var elms = document.getElementById(tipoRespuesta)
    for (var i = 0; i < elms.length; i++) {
            document.getElementById(elms[i]).removeAttribute("required")
        }
}

/*
function agregarObligatorio()
{
    var elms = document.getElementById("divRespuestasImagenes")
    for (var i = 0; i < elms.length; i++) {
        document.getElementById(elms[i]).setAttribute("required","")
    }
    var elms2 = document.getElementById("divRespuestasTexto")
    for (var i = 0; i < elms2.length; i++) {
        document.getElementById(elms2[i]).setAttribute("required","")
    }
}

*/

function desbloquearGuardar()
{

}