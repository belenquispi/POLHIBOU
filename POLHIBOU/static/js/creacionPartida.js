var partida = [];
var iconoSeleccionados = [];

function verificarSeleccion() {
    if (document.getElementById('numeroEquipo').value > 0 && (verificarIconosSeleccionados() == true)) {
        document.getElementById('generarCodigo').removeAttribute('disabled');
    }
    else {
        document.getElementById('generarCodigo').setAttribute('disabled', '');
    }
}

function verificarIconosSeleccionados() {
    var res = false;
    if (iconoSeleccionados.length == document.getElementById('numeroEquipo').value) {
        res = true;
    }
    return res;
}

function generarDatosEquipo(numero) {
    var id = numero.id;
    iconoSeleccionados = [];
    if (document.getElementById("generarCodigo")) {
        document.getElementById("generarCodigo").removeAttribute("hidden");
    }
    if (document.getElementById("form-group1")) {
        eliminarAnteriores(1);
    }
    if (document.getElementById("form-group2")) {
        eliminarAnteriores(2);
    }
    if (document.getElementById("form-group3")) {
        eliminarAnteriores(3);
    }
    if (document.getElementById("form-group4")) {
        eliminarAnteriores(4);
    }
    partida = [];
    for (var i = 0; i < document.getElementById(id).value; i++) {
        partida[i] = 0;
        var divGrupo = document.createElement("DIV");
        divGrupo.setAttribute("class", " row align-items-center form-group col-md-12");
        divGrupo.setAttribute("id", "form-group" + (i + 1));
        document.getElementById("centro").appendChild(divGrupo);

        var label = document.createElement("LABEL");
        label.setAttribute("id", "labelEquipo" + (i + 1));
        label.setAttribute("class", "col-md-3 textoBlanco");
        document.getElementById("form-group" + (i + 1)).appendChild(label);
        document.getElementById('labelEquipo' + (i + 1)).innerHTML = "DATOS DEL EQUIPO " + (i + 1)+":";

        var inputs = document.createElement("INPUT");
        inputs.setAttribute("class", "form-control col-md-3");
        inputs.setAttribute("placeholder", "Nombre del equipo" + (i + 1));
        inputs.setAttribute("onkeypress", "return validarIngreso(event)");
        inputs.setAttribute("maxlength", "15");
        inputs.setAttribute("type", "text");
        inputs.setAttribute("required", "");
        inputs.setAttribute("name", "nombreEquipo" + (i + 1));
        inputs.setAttribute("id", "nombreEquipo" + (i + 1));
        document.getElementById("form-group" + (i + 1)).appendChild(inputs);


        for (var j = 0; j < 6; j++) {
            var boton = document.createElement("BUTTON");
            boton.setAttribute("id", "buttonImagen" + (j + 1) + "Equipo" + (i + 1));
            boton.setAttribute("onclick", "bloquearIconoJugador(this)");
            boton.setAttribute("type", "button");
            boton.setAttribute("class", "btn btn-outline-light");
            boton.style.margin = "0px 5px";
            document.getElementById("form-group" + (i + 1)).appendChild(boton);
            var images = document.createElement("IMG");
            images.setAttribute("src", "../../static/imagenes/equipo"+ (j + 1)+".svg");
            images.setAttribute("id", "buhoInicial" + (j + 1) + "Equipo" + (i + 1));
            images.setAttribute("height", "50");
            images.setAttribute("width", "50");
            document.getElementById("buttonImagen" + (j + 1) + "Equipo" + (i + 1)).appendChild(images);
        }
        var inputImagen = document.createElement("INPUT");
			inputImagen.setAttribute("type", "text");
			inputImagen.setAttribute("hidden", "");
			inputImagen.setAttribute("name", "imagenEquipo" + (i + 1));
			inputImagen.setAttribute("id", "imagenEquipo" + (i + 1));
			document.getElementById("form-group" + (i + 1)).appendChild(inputImagen);
    }
}

function eliminarAnteriores(num) {
    document.getElementById("form-group" + (num)).parentNode.removeChild(document.getElementById("form-group" + (num)));
}

function bloquearIconoJugador(num) {
    var id = num.id;
    var numImagen = id.substr(12, 1);
    var numEquipo = id.substr(19, 1);
    var contador = 0;
    for (var i = 0; i < partida.length; i++) {
        if (partida[i] == numImagen) {
            contador++;
        }
    }
    if (contador == 0) {
        for (var j = 0; j < 6; j++) {
            document.getElementById("buttonImagen" + (j + 1) + "Equipo" + numEquipo).style.border = null;
            document.getElementById("buttonImagen" + (j + 1) + "Equipo" + numEquipo).classList.add("btn-outline-light");
        }
        partida[numEquipo - 1] = numImagen;
        ((iconoSeleccionados.indexOf(numEquipo) < 0) ? iconoSeleccionados.push(numEquipo) : console.log("El equipo ya tiene un icono seleccionado"));
        document.getElementById("imagenEquipo" + numEquipo).value = numImagen;
        document.getElementById(id).style.border = "thick solid #28CB1E";
    } else {
        console.log("Ya se encuentra seleccionado por otro equipo");
    }
}

function validarIngreso(e) {
    var tecla = (document.all) ? e.keyCode : e.which;
    //Tecla de retroceso para borrar, siempre la permite
    if (tecla == 8) {
        return true;
    }
    // Patron de entrada, en este caso solo acepta numeros y letras
    var patron = /[A-Za-z0-9 ]/;
    var tecla_final = String.fromCharCode(tecla);
    return patron.test(tecla_final);
}