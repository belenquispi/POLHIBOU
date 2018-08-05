var socket = io();
var disponible = false;
socket.on('confirmacionEquipo', function (data) {
    if (data == "true") {
        disponible = true;
        return false;
    } else {
        return true;
    }
});
socket.on('confirmacionPartida', function (data) {
    if (data.length > 0) {
        if (document.getElementById("codigoPartida").value != "") {
            document.getElementById("divTipoEquipo").removeAttribute("hidden");
            document.getElementById("nombreEquipo").innerHTML = "";
            var option1 = document.createElement("OPTION");
            option1.setAttribute("value", "ninguno");
            var nombre1 = document.createTextNode("Selecciona el equipo que representas");
            option1.appendChild(nombre1);
            document.getElementById("nombreEquipo").appendChild(option1);
            for (var i = 0; i < data.length; i++) {
                var option = document.createElement("OPTION");
                option.setAttribute("value", data[i].nombreEquipo);
                var nombre = document.createTextNode(data[i].nombreEquipo);
                option.appendChild(nombre);
                document.getElementById("nombreEquipo").appendChild(option);
            }

        } else {
            document.getElementById("divTipoEquipo").setAttribute("hidden", "");
        }

    }
    else {
        alert("La partida ingresada no es válida");

    }
});

function consultarJugadores() {
    socket.emit('verificarPartida', document.getElementById("codigoPartida").value);
}

function habilitarNombreEquipo() {
    if (document.getElementById("tipoIngreso").value == "jugador") {
        document.getElementById("divNombreEquipo").removeAttribute("hidden");
        document.getElementById("botonUnir").removeAttribute("hidden");

    } else {
        document.getElementById("divNombreEquipo").setAttribute("hidden", "");
        if (document.getElementById("tipoIngreso").value == "espectador"){
            document.getElementById("botonUnir").removeAttribute("hidden");

        }else {
            document.getElementById("botonUnir").setAttribute("hidden", "");
        }
    }
}

function verificarDisponibilidadEquipo() {
    socket.emit('verificarEquipo', document.getElementById("codigoPartida").value, document.getElementById("nombreEquipo").value);
}

function unirsePartida() {
    if (document.getElementById("tipoIngreso") == "espectador") {
        //document.getElementById('unirPartida').click();
    }
    else {
        if (document.getElementById('tipoIngreso').value == "jugador") {
            if (document.getElementById('nombreEquipo').value == "ninguno") {
                alert("Seleccione un nombre de equipo.")
            }
            else {
                if (disponible) {
                    //  document.getElementById('unirPartida').click();
                    document.getElementById("imagenE").removeAttribute("hidden");
                    socket.emit('new player', document.getElementById('codigoPartida').value, document.getElementById('tipoIngreso').value, document.getElementById('nombreEquipo').value);
                }
                else {
                    document.getElementById("imagenE").setAttribute("hidden", "");
                    alert("El equipo con el cual desea ingresar ya se encuentra conectado. Se sugiere ingresar con el nombre de otro jugador o como de espectador");
                }
            }
        }
        else
        {
            if (document.getElementById('tipoIngreso').value == "ninguno") {
                alert("Seleccione un tipo de ingreso a la partida");
            }
            else {
                document.getElementById('unirPartida').click();
            }

        }
    }
}
