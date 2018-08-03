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
        console.log('RESULT', reader.result);
        console.log('ELEMENT', element.id);
        switch (element.id) {
            case "botonArchivoEnunciado":
                document.getElementById("imagenEnunciado").value = reader.result;
                break;
            case "botonArchivoimagenRes1":
                document.getElementById("imagenRes1").value = reader.result;
                break;
            case "botonArchivoimagenRes2":
                document.getElementById("imagenRes2").value = reader.result;
                break;
            case "botonArchivoimagenRes3":
                document.getElementById("imagenRes3").value = reader.result;
                break;
            case "botonArchivoimagenRes4":
                document.getElementById("imagenRes4").value = reader.result;
                break;
        }
    }
    reader.readAsDataURL(file);
}
function cambiarImagen(boton) {
    console.log(boton.id);
    console.log(boton.id.indexOf("belen"));
    var idBoton = boton.id;
    if(idBoton.indexOf("Enunciado")>=0){
        document.getElementById("vistaImagenBase").setAttribute("hidden","");
        document.getElementById("vistaImagenBase").innerHTML="";
        var div = document.createElement("DIV");
        div.setAttribute("id", "cargaImagenEnunciado");
        div.setAttribute("class", "form-group col-md-4 ");
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
        input.setAttribute("required", "");
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
        var br = document.createElement("BR");
        document.getElementById("vistaImagenEnunciado").appendChild(br);
        var img = document.createElement("IMG");
        img.setAttribute("id", "imagenCargadaEnunciado");
        img.setAttribute("width", "50");
        img.setAttribute("height", "50");
        document.getElementById("vistaImagenEnunciado").appendChild(img);
    }else {
        if(idBoton.indexOf("imagenRes")>=0){
            console.log(idBoton.substr(9,1));
            document.getElementById("card"+idBoton).innerHTML="";
            var divR = document.createElement("DIV");
            divR.setAttribute("id", "rcard"+idBoton);
            divR.setAttribute("class", "row");
            document.getElementById("card"+idBoton).appendChild(divR);

            var div = document.createElement("DIV");
            div.setAttribute("id", "datos"+idBoton);
            div.setAttribute("class", "form-group col-md-8");
            document.getElementById("rcard"+idBoton).appendChild(div);

            var label = document.createElement("LABEL");
            label.setAttribute("for", "botonArchivo"+idBoton);
            var t = document.createTextNode("Respuesta "+idBoton.substr(9,1)+":");
            label.appendChild(t);
            document.getElementById("datos"+idBoton).appendChild(label);
            var input = document.createElement("INPUT");
            input.setAttribute("type", "file");
            input.setAttribute("class", "form-control-file");
            input.setAttribute("id", "botonArchivo"+idBoton);
            input.setAttribute("value", "upload"+idBoton);
            input.setAttribute("accept", "image/*");
            input.setAttribute("required", "");
            input.setAttribute("onchange", "mostrarVistaPreviaImagen(event, 'nueva"+idBoton+"'), encodeImageFileAsURL(this)");
            document.getElementById("datos"+idBoton).appendChild(input);

            var input2 = document.createElement("INPUT");
            input2.setAttribute("type", "text");
            input2.setAttribute("id", idBoton);
            input2.setAttribute("name", idBoton);
            input2.setAttribute("hidden", "");
            document.getElementById("datos"+idBoton).appendChild(input2);

            var div2 = document.createElement("DIV");
            div2.setAttribute("id", "vista"+idBoton);
            div2.setAttribute("class", "form-group col-sm-4");
            document.getElementById("rcard"+idBoton).appendChild(div2);

            var br = document.createElement("BR");
            document.getElementById("vista"+idBoton).appendChild(br);
            var img = document.createElement("IMG");
            img.setAttribute("id", "nueva"+idBoton);
            img.setAttribute("width", "50");
            img.setAttribute("height", "50");
            document.getElementById("vista"+idBoton).appendChild(img);
        }
    }
}

var mostrarVistaPreviaImagen = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};