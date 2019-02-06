//var socket = io();
var socket = io.connect ('http://polhibou.epn.edu.ec/');
var disponible = false;
socket.on('confirmacionPartida', function (data, indicePartida) {
    console.log("Recibi la confirmación");
    if (indicePartida > -1) {
        if (document.getElementById("codigoPartida").value != "") {
            document.getElementById("divTipoEquipo").removeAttribute("hidden");
            if (data.length > 0) {
                if (document.getElementById("nombreEquipo")) {
                    document.getElementById("nombreEquipo").innerHTML = "";
                    let option1 = document.createElement("OPTION");
                    option1.setAttribute("value", "ninguno");
                    let nombre1 = document.createTextNode("Selecciona el equipo que representas");
                    option1.appendChild(nombre1);
                    document.getElementById("nombreEquipo").appendChild(option1);
                    for (let i = 0; i < data.length; i++) {
                        let option = document.createElement("OPTION");
                        option.setAttribute("value", data[i].nombreEquipo);
                        let nombre = document.createTextNode(data[i].nombreEquipo);
                        option.appendChild(nombre);
                        document.getElementById("nombreEquipo").appendChild(option);
                    }
                }
            }
        } else {
            document.getElementById("divTipoEquipo").setAttribute("hidden", "");
        }
    }
    else {
        alert("La partida ingresada no es válida");
    }
});
socket.on('confirmacionEquipo', function (data) {
    if (data == "true") {
        disponible = true;
    } else {
        disponible = false;
    }
});


function verificarPartida() {
    console.log("Realice el emit");
    socket.emit('verificarPartida', document.getElementById("codigoPartida").value);
}

function habilitarNombreEquipo() {
    verificarPartida();
    document.getElementById("botonUnir1").removeAttribute("hidden");

    if (document.getElementById("tipoIngreso").value == "participante") {
        document.getElementById("divNombreEquipo").removeAttribute("hidden");
    } else {
        document.getElementById("divNombreEquipo").setAttribute("hidden", "");
                   console.log("se ha seleccionado espectador");
    }
}

function verificarDisponibilidadEquipo() {
    if (document.getElementById("nombreEquipo").value != "ninguno") {
        socket.emit('verificarEquipo', document.getElementById("codigoPartida").value, document.getElementById("nombreEquipo").value);
    }
}

function verificarParticipanteSeleccionado() {
    if (((document.getElementById("nombreEquipo").value == "ninguno") || (document.getElementById("nombreEquipo").value == "") )&&(document.getElementById("tipoIngreso").value == "participante")) {
        alert("Debe seleccionar un nombre de equipo o ingresar como espectador");
    } else {
        console.log("Contenido: " + document.getElementById("nombreEquipo").value);
        document.getElementById("botonUnir").removeAttribute("hidden");
        document.getElementById("botonUnir").click();
    }
}
