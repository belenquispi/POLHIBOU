var socket = io();
window.onload = function () {
    var jugadores = document.getElementById("numeroEquipos").value;
    var nombreIconoEquipos = [];
    for(var i=0; i<jugadores; i++){
        var jugador = {
            iconoEquipo: document.getElementById("imagenEquipo"+i).value,
            nombreEquipo: document.getElementById("nombreEquipo"+i).value
        }
        nombreIconoEquipos.push(jugador)
    }
    socket.emit('nuevaPartida',document.getElementById('idPartida').value, document.getElementById('rol').value, nombreIconoEquipos, document.getElementById("usuario").value, document.getElementById('materia').value );

}
