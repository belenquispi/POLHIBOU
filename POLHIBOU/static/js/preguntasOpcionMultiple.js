var mostrarVistaPreviaImagen = function (event, imagen) {
    var output = document.getElementById(imagen);
    if(event.target.files[0] != null) {
        output.src = URL.createObjectURL(event.target.files[0]);
        if( document.getElementById("botonArchivoEnunciado").value != "") {
            document.getElementById("eliminarImagen").removeAttribute("hidden");
        }
    }
    else {
        output.src = "../../static/imagenes/imagenVacia.svg";
        document.getElementById("eliminarImagen").setAttribute("hidden", "");
    }
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
    if(file != null) {
        reader.onloadend = function () {
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
    }else {
        switch (element.id) {
            case "botonArchivoEnunciado":
                document.getElementById("imagenEnunciado").value = "";
                break;
            case "botonArchivoRes1":
                document.getElementById("imagenRes1").value = "";
                break;
            case "botonArchivoRes2":
                document.getElementById("imagenRes2").value = "";
                break;
            case "botonArchivoRes3":
                document.getElementById("imagenRes3").value = "";
                break;
            case "botonArchivoRes4":
                document.getElementById("imagenRes4").value = "";
                break;
        }
    }
}

function cambiar(){
    var pdrs = document.getElementById('file-upload').files[0].name;
    document.getElementById('info').innerHTML = pdrs;
}

function eliminarImagenCargada() {
    let input = document.getElementById("botonArchivoEnunciado");
    let  imagen = document.getElementById("imagenCargadaEnunciado");

    var imagenNueva = document.createElement("IMG");
    imagenNueva.setAttribute("id", "imagenCargadaEnunciado");
    imagenNueva.setAttribute("width", "50" );
    imagenNueva.setAttribute("height", "50");

    var inputNuevo = document.createElement("INPUT");
    inputNuevo.setAttribute("type", "file");
    inputNuevo.setAttribute("id", "botonArchivoEnunciado");
    inputNuevo.setAttribute("class", "btn btn-file btn-light");
    inputNuevo.setAttribute("accept", ".png, .jpg, .jpeg");
    inputNuevo.setAttribute("value", "uploadEnunciado");
    inputNuevo.setAttribute("onchange", "validarImagen(event, 'imagenCargadaEnunciado', this)");

    if (!imagen){
        alert("El elemento selecionado no existe");
    } else {
       var padre = imagen.parentNode;
        padre.removeChild(imagen);
        padre.appendChild(imagenNueva);
    }
    if (!input){
        alert("El elemento selecionado no existe");
    } else {
       var padre2 = input.parentNode;
        padre2.removeChild(input);
        padre2.appendChild(inputNuevo)
    }
    document.getElementById("eliminarImagen").setAttribute("hidden","");
    document.getElementById("imagenEnunciado").value = "";
}

function verificarIngreso(valor) {
    if (document.getElementById(valor.id).value.trim().length < 1) {
        alert("El texto ingresado está en blanco");
        document.getElementById(valor.id).value = "";
    }
}

function validarImagen(event, imagen, elemento) {
    let fileSize = event.target.files[0].size;
    if (parseInt(fileSize) >  1048576) {
        alert("La imagen es muy grande. Solo se permite cargar imagenes menores a 1 MB ");
        document.getElementById(elemento.id).value = "";
        return false;
    }
    else {
        mostrarVistaPreviaImagen(event, imagen);
        encodeImageFileAsURL(elemento);
    }
}