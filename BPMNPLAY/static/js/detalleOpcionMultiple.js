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
    if (file != null) {
        var reader = new FileReader();
        reader.onloadend = function () {
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
        };
        reader.readAsDataURL(file);
    }
    else {
        switch (element.id) {
            case "botonArchivoEnunciado":
                document.getElementById("imagenEnunciado").value = "";
                break;
            case "botonArchivoimagenRes1":
                document.getElementById("imagenRes1").value = "";
                break;
            case "botonArchivoimagenRes2":
                document.getElementById("imagenRes2").value = "";
                break;
            case "botonArchivoimagenRes3":
                document.getElementById("imagenRes3").value = "";
                break;
            case "botonArchivoimagenRes4":
                document.getElementById("imagenRes4").value = "";
                break;
        }
    }
}

function cambiarImagen(boton) {
    let idBoton = boton.id;
    if (idBoton.indexOf("Enunciado") >= 0) {
        document.getElementById("vistaImagenBase").setAttribute("hidden", "");
        document.getElementById("vistaImagenBase").innerHTML = "";
        let div = document.createElement("DIV");
        div.setAttribute("id", "cargaImagenEnunciado");
        div.setAttribute("class", "form-group col-md-6 ");
        document.getElementById("rowEnunciado").appendChild(div);
        let label = document.createElement("LABEL");
        label.setAttribute("for", "botonArchivoEnunciado");
        label.setAttribute("class", "textoBlanco");
        let t = document.createTextNode("CARGAR IMAGEN (OPCIONAL):");
        label.appendChild(t);
        document.getElementById("cargaImagenEnunciado").appendChild(label);
        let input = document.createElement("INPUT");
        input.setAttribute("type", "file");
        input.setAttribute("class", "btn btn-file btn-light");
        input.setAttribute("id", "botonArchivoEnunciado");
        input.setAttribute("value", "uploadEnunciado");
        input.setAttribute("accept", ".png, .jpg, .jpeg");
        input.setAttribute("onchange", "mostrarVistaPreviaImagen(event, 'imagenCargadaEnunciado'), encodeImageFileAsURL(this)");
        document.getElementById("cargaImagenEnunciado").appendChild(input);
        let input2 = document.createElement("INPUT");
        input2.setAttribute("type", "text");
        input2.setAttribute("id", "imagenEnunciado");
        input2.setAttribute("name", "imagenEnunciado");
        input2.setAttribute("hidden", "");
        document.getElementById("cargaImagenEnunciado").appendChild(input2);

        let div2 = document.createElement("DIV");
        div2.setAttribute("id", "vistaImagenEnunciado");
        div2.setAttribute("class", "form-group col-md-2");
        document.getElementById("rowEnunciado").appendChild(div2);
        let br = document.createElement("BR");
        document.getElementById("vistaImagenEnunciado").appendChild(br);
        let img = document.createElement("IMG");
        img.setAttribute("id", "imagenCargadaEnunciado");
        img.setAttribute("width", "50");
        img.setAttribute("height", "50");
        document.getElementById("vistaImagenEnunciado").appendChild(img);
    } else {
        if (idBoton.indexOf("imagenRes") >= 0) {
            document.getElementById("card" + idBoton).innerHTML = "";
            let divR = document.createElement("DIV");
            divR.setAttribute("id", "rcard" + idBoton);
            divR.setAttribute("class", "row");
            document.getElementById("card" + idBoton).appendChild(divR);

            let div = document.createElement("DIV");
            div.setAttribute("id", "datos" + idBoton);
            div.setAttribute("class", "form-group col-md-8");
            document.getElementById("rcard" + idBoton).appendChild(div);

            let label = document.createElement("LABEL");
            label.setAttribute("for", "botonArchivo" + idBoton);
            label.setAttribute("class", "textoBlanco");
            let t = document.createTextNode("RESPUESTA " + idBoton.substr(9, 1) + ":");
            label.appendChild(t);
            document.getElementById("datos" + idBoton).appendChild(label);
            let input = document.createElement("INPUT");
            input.setAttribute("type", "file");
            input.setAttribute("class", "form-control-file textoBlanco");
            input.setAttribute("id", "botonArchivo" + idBoton);
            input.setAttribute("value", "upload" + idBoton);
            input.setAttribute("accept", ".png, .jpg, .jpeg");
            input.setAttribute("required", "");
            input.setAttribute("onchange", "mostrarVistaPreviaImagen(event, 'nueva" + idBoton + "'), encodeImageFileAsURL(this)");
            document.getElementById("datos" + idBoton).appendChild(input);

            let input2 = document.createElement("INPUT");
            input2.setAttribute("type", "text");
            input2.setAttribute("id", idBoton);
            input2.setAttribute("name", idBoton);
            input2.setAttribute("hidden", "");
            document.getElementById("datos" + idBoton).appendChild(input2);

            let div2 = document.createElement("DIV");
            div2.setAttribute("id", "vista" + idBoton);
            div2.setAttribute("class", "form-group col-sm-4");
            document.getElementById("rcard" + idBoton).appendChild(div2);

            let br = document.createElement("BR");
            document.getElementById("vista" + idBoton).appendChild(br);
            let img = document.createElement("IMG");
            img.setAttribute("id", "nueva" + idBoton);
            img.setAttribute("width", "50");
            img.setAttribute("height", "50");
            document.getElementById("vista" + idBoton).appendChild(img);
        }
    }
}

let mostrarVistaPreviaImagen = function (event, imagen) {
    let output = document.getElementById(imagen);
    if (event.target.files[0] != null) {
        output.src = URL.createObjectURL(event.target.files[0]);
        if(document.getElementById("eliminarImagen") && (document.getElementById("botonArchivoEnunciado").value != ""))
        {
            document.getElementById("eliminarImagen").removeAttribute("hidden");
        }

    }
    else {
        output.src = "../../static/imagenes/imagenVacia.svg";
        document.getElementById("eliminarImagen").setAttribute("hidden", "");
    }
};

function eliminarImagenCargada() {
    let input = document.getElementById("botonArchivoEnunciado");
    let imagen = document.getElementById("imagenCargadaEnunciado");

    let imagenNueva = document.createElement("IMG");
    imagenNueva.setAttribute("id", "imagenCargadaEnunciado");
    imagenNueva.setAttribute("width", "50");
    imagenNueva.setAttribute("height", "50");

    let inputNuevo = document.createElement("INPUT");
    inputNuevo.setAttribute("type", "file");
    inputNuevo.setAttribute("id", "botonArchivoEnunciado");
    inputNuevo.setAttribute("class", "btn btn-file btn-light");
    inputNuevo.setAttribute("accept", ".png, .jpg, .jpeg");
    inputNuevo.setAttribute("value", "uploadEnunciado");
    inputNuevo.setAttribute("onchange", "mostrarVistaPreviaImagen(event, 'imagenCargadaEnunciado'), encodeImageFileAsURL(this)");

    if (!imagen) {
        alert("El elemento selecionado no existe");
    } else {
        let padre = imagen.parentNode;
        padre.removeChild(imagen);
        padre.appendChild(imagenNueva);
    }
    if (!input) {
        alert("El elemento selecionado no existe");
    } else {
        let padre2 = input.parentNode;
        padre2.removeChild(input);
        padre2.appendChild(inputNuevo)
    }
    document.getElementById("eliminarImagen").setAttribute("hidden", "");
    document.getElementById("imagenEnunciado").value = "";

}
function verificarIngreso(valor) {
    if (document.getElementById(valor.id).value.trim().length < 1) {
        alert("El texto ingresado está en blanco");
        document.getElementById(valor.id).value = "";
    }
}