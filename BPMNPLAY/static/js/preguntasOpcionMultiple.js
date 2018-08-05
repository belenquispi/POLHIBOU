var mostrarVistaPreviaImagen = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};

function mostrarRespuestas(valor) {
    if (valor == 1) {
        document.getElementById("divRespuestasTexto").removeAttribute("hidden");
        document.getElementById("divRespuestasImagenes").setAttribute("hidden", "");
        document.getElementById("soloImagenes").setAttribute("hidden", "")
    }
    if (valor == 2) {
        document.getElementById("divRespuestasImagenes").removeAttribute("hidden");
        document.getElementById("divRespuestasTexto").setAttribute("hidden", "");
        document.getElementById("soloTexto").setAttribute("hidden", "")
    }
    document.getElementById("divRespuestas").removeAttribute("hidden");
}

function verificarBotonGuardar() {
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
}

function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        console.log('RESULT', reader.result)
        switch (element.id) {
            case "botonArchivoEnunciado":
                document.getElementById("imagenEnunciado").value = reader.result;
                break;
            case "botonArchivoRes1":
                document.getElementById("imagenRes1").value = reader.result;
                break;
            case "botonArchivoRes2":
                document.getElementById("imagenRes2").value = reader.result;
                break;
            case "botonArchivoRes3":
                document.getElementById("imagenRes3").value = reader.result;
                break;
            case "botonArchivoRes4":
                document.getElementById("imagenRes4").value = reader.result;
                break;
        }
    };
    reader.readAsDataURL(file);
}function cambiar(){
    var pdrs = document.getElementById('file-upload').files[0].name;
    document.getElementById('info').innerHTML = pdrs;
}