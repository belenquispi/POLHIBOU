function generarPartida() {
    var idMateria = document.getElementById('idMateria').value;
    var idPartida = idMateria + Math.floor((1 + Math.random()) * 0x1000).toString(5).substring(1);

    document.getElementById('codigoPartida').value = idPartida;
    document.getElementById('codigoPartidaL').innerHTML = idPartida;

}