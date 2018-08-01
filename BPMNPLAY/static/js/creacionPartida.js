var partida = [];
var socket = io();
function generarPartida() {
    if(document.getElementById('codigoPartida').value != 'ninguna') {
        if (document.getElementById('codigoPartida').value == 'nuevo') {
            var idMateria = document.getElementById('idMateria').value.replace(" ", "_");
            var idPartida = idMateria + Math.floor((1 + Math.random()) * 0x1000).toString(5).substring(1);
            document.getElementById('codigoPartida').value = idPartida;
            document.getElementById('codigoPartidaL').innerHTML = idPartida;
        } else {

        }
    } else{
        alert("Seleccione una de las materias");
    }

    var nombreIconoEquipos = [];
    var usuario ='bquispi';
    for(var i=0; i < partida.length; i++){
        var datoEquipo = {
            nombreEquipo : document.getElementById("nombreEquipo" + (i + 1)).value,
            iconoEquipo : partida[i]
        };
        nombreIconoEquipos.push(datoEquipo);
    }
    socket.emit('nuevaPartida',document.getElementById('codigoPartida').value, document.getElementById('rol').value, nombreIconoEquipos, usuario, document.getElementById('idMateria').value );
}

function verificarSeleccion() {
    if(document.getElementById('idMateria').value != 'ninguna' && document.getElementById('numeroEquipo').value > 0) {
        document.getElementById('botonModal').removeAttribute('disabled');
    }
    else {
        document.getElementById('botonModal').setAttribute('disabled','');
    }
}

function generarDatosEquipo(numero) {
    var id = numero.id;
    console.log(id);
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
        partida[i]=0;
        var divGrupo = document.createElement("DIV");
        divGrupo.setAttribute("class", " row align-items-center form-group col-md-12");
        divGrupo.setAttribute("id", "form-group" + (i + 1));
        document.getElementById("centro").appendChild(divGrupo);

        var label = document.createElement("LABEL");
        label.setAttribute("id", "labelEquipo" + (i + 1));
        label.setAttribute("class", "col-md-3");
        document.getElementById("form-group" + (i + 1)).appendChild(label);
        document.getElementById('labelEquipo' + (i + 1)).innerHTML = "Nombre del Equipo " + (i + 1);

        var inputs = document.createElement("INPUT");
        inputs.setAttribute("class", "form-control col-md-3");
        inputs.setAttribute("placeholder", "Nombre del equipo"+(i+1));
        inputs.setAttribute("onkeypress", "return validarIngreso(event)");
        inputs.setAttribute("maxlength", "10");
        inputs.setAttribute("type", "text");
        inputs.setAttribute("required", "");
        inputs.setAttribute("name", "nombreEquipo"+ (i + 1));
        inputs.setAttribute("id", "nombreEquipo" + (i + 1));
        document.getElementById("form-group" + (i + 1)).appendChild(inputs);


        for (var j = 0; j < 6; j++) {
            var boton = document.createElement("BUTTON");
            boton.setAttribute("id", "buttonImagen" + (j + 1) + "Equipo" + (i + 1));
            boton.setAttribute("onclick", "bloquearIconoJugador(this)");
            boton.setAttribute("type", "button");
            boton.style.margin = "0px 5px";
            document.getElementById("form-group" + (i + 1)).appendChild(boton);
            var images = document.createElement("IMG");
            images.setAttribute("src", "static/buhoInicial" + (j + 1) + ".gif");
            images.setAttribute("id", "buhoInicial" + (j + 1) + "Equipo" + (i + 1));
            images.setAttribute("class", "img-thumbnail");
            images.setAttribute("height", "50");
            images.setAttribute("width", "50");
            document.getElementById("buttonImagen" + (j + 1) + "Equipo" + (i + 1)).appendChild(images);
        }
        var inputImagen = document.createElement("INPUT");
        inputImagen.setAttribute("type", "text");
        inputImagen.setAttribute("hidden", "");
        inputImagen.setAttribute("name", "imagenEquipo"+ (i + 1));
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
    var numEquipo = id.substr(19,1);
    console.log(numImagen);
    console.log(numEquipo);
    console.log(id);
    var contador = 0;
    for(var i = 0 ; i < partida.length; i++)
    {
        if(partida[i]==numImagen){
            contador++;
        }
    }
    if(contador==0){
        for(var j = 0 ; j < 6 ; j++)
        {
            document.getElementById("buttonImagen" + (j + 1) + "Equipo" + numEquipo).style.border = "gray";
        }
        partida[numEquipo-1]= numImagen;
        console.log("equipo:"+numEquipo);

        document.getElementById("imagenEquipo"+numEquipo).value = numImagen;
        document.getElementById(id).style.border = "thick solid green";
    }else
    {
        console.log("Ya se encuentra seleccionado por otro equipo")   ;
    }
}

function unirsePartida() {

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