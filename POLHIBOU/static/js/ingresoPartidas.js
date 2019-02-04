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
    if (document.getElementById("tipoIngreso").value == "participante") {
        document.getElementById("divNombreEquipo").removeAttribute("hidden");
        document.getElementById("botonUnir").removeAttribute("hidden");
        document.getElementById("textoEspectador").setAttribute("hidden","");

    } else {
        document.getElementById("divNombreEquipo").setAttribute("hidden", "");
        if (document.getElementById("tipoIngreso").value == "espectador") {
            console.log("se ha seleccionado espectador");
            document.getElementById("botonUnir").removeAttribute("hidden");
            document.getElementById("textoEspectador").setAttribute("hidden","");
            document.getElementById("divNombreEquipo").setAttribute("hidden","");
        }
    }
}

function verificarDisponibilidadEquipo() {
    socket.emit('verificarEquipo', document.getElementById("codigoPartida").value, document.getElementById("nombreEquipo").value);
}
