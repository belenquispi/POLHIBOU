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
    for(var i = 0; i<element.files.length; i++){
        console.log(element.files[i])
    }
    var reader = new FileReader();
    reader.onloadend = function () {
        console.log('RESULT', reader.result)
        switch (element.id) {
            case "botonArchivoEnunciado":
                document.getElementById("imagenEnunciado").value = reader.result;
            case "botonArchivoRes1":
                document.getElementById("imagenRes1").value = reader.result;
            case "botonArchivoRes2":
                document.getElementById("imagenRes2").value = reader.result;
            case "botonArchivoRes3":
                document.getElementById("imagenRes3").value = reader.result;
            case "botonArchivoRes4":
                document.getElementById("imagenRes4").value = reader.result;
        }
    }
    reader.readAsDataURL(file);
}
function cambiarImagen(boton) {
    console.log(boton.id)
    console.log(boton.id.indexOf("belen"))
    var idBoton = boton.id;
    if(idBoton.indexOf("Enunciado")>=0){
        document.getElementById("vistaImagenBase").setAttribute("hidden","");
        var div = document.createElement("DIV");
        div.setAttribute("id", "cargaImagenEnunciado");
        div.setAttribute("class", "form-group col-md-4 mb-3");
        document.getElementById("rowEnunciado").appendChild(div);

        var label = document.createElement("LABEL");
        label.setAttribute("for", "botonArchivoEnunciado");
        var t = document.createTextNode("Cargar imagen (opcional):");
        label.appendChild(t);
        document.getElementById("cargaImagenEnunciado").appendChild(label);
        var input = document.createElement("INPUT");
        input.setAttribute("type", "file");
        input.setAttribute("class", "form-control-file");
        input.setAttribute("id", "botonArchivoEnunciado");
        input.setAttribute("value", "uploadEnunciado");
        input.setAttribute("accept", "image/*");
        input.setAttribute("onchange", "mostrarVistaPreviaImagen(event, 'imagenCargadaEnunciado'), encodeImageFileAsURL(this)");
        document.getElementById("cargaImagenEnunciado").appendChild(input);
        var input2 = document.createElement("INPUT");
        input2.setAttribute("type", "text");
        input2.setAttribute("id", "imagenEnunciado");
        input2.setAttribute("name", "imagenEnunciado");
        input2.setAttribute("hidden", "");
        document.getElementById("cargaImagenEnunciado").appendChild(input2);

        var div2 = document.createElement("DIV");
        div2.setAttribute("id", "vistaImagenEnunciado");
        div2.setAttribute("class", "form-group col-md-2");
        document.getElementById("rowEnunciado").appendChild(div2);

        var img = document.createElement("IMG");
        img.setAttribute("id", "imagenCargadaEnunciado");
        img.setAttribute("width", "50");
        img.setAttribute("height", "50");
        document.getElementById("vistaImagenEnunciado").appendChild(img);
    }
}

var mostrarVistaPreviaImagen = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};