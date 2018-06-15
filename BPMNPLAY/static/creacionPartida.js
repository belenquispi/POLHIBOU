function generarPartida() {
    var idMateria = document.getElementById('idMateria').value;
    var idPartida = idMateria + Math.floor((1 + Math.random()) * 0x1000).toString(5).substring(1);
    document.getElementById('codigoPartida').value = idPartida;
    document.getElementById('codigoPartidaL').innerHTML = idPartida;
}

function generarDatosEquipo(numero) {
    var id = numero.id;
    console.log(id);
    if (document.getElementById("equipo1")) {
        document.getElementById("equipo1").parentNode.removeChild(document.getElementById("equipo1"));
        document.getElementById("labelEquipo1").parentNode.removeChild(document.getElementById("labelEquipo1"))
    }
    if (document.getElementById("equipo2")) {
        document.getElementById("equipo2").parentNode.removeChild(document.getElementById("equipo2"));
        document.getElementById("labelEquipo2").parentNode.removeChild(document.getElementById("labelEquipo2"))
    }
    if (document.getElementById("equipo3")) {
        document.getElementById("equipo3").parentNode.removeChild(document.getElementById("equipo3"));
        document.getElementById("labelEquipo3").parentNode.removeChild(document.getElementById("labelEquipo3"))
    }
    if (document.getElementById("equipo4")) {
        document.getElementById("equipo4").parentNode.removeChild(document.getElementById("equipo4"));
        document.getElementById("labelEquipo4").parentNode.removeChild(document.getElementById("labelEquipo4"))
    }

    for (var i = 0; i < document.getElementById(id).value; i++) {
        var label = document.createElement("LABEL");
        label.setAttribute("id", "labelEquipo" + (i + 1));
        label.setAttribute("class", "control-label col-md-4");
        document.body.appendChild(label);
        document.getElementById('labelEquipo' + (i + 1)).innerHTML = "Nombre del Equipo" + (i + 1);
        var x = document.createElement("INPUT");
        x.setAttribute("type", "text");
        x.setAttribute("id", "equipo" + (i + 1));
        document.body.appendChild(x);

    }

}
