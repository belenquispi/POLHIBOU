var socket = io();
var jugadoresConectados = [];
window.onload = function () {
    var jugadores = document.getElementById("numeroEquipos").value;
    var nombreIconoEquipos = [];
    for(var i=0; i<jugadores; i++){
        var jugador = {
            iconoEquipo: document.getElementById("imagenEquipo"+i).value,
            nombreEquipo: document.getElementById("nombreEquipo"+i).value
        };
        nombreIconoEquipos.push(jugador)
    }
    socket.emit('nuevaPartida',document.getElementById('idPartida').value, document.getElementById('rol').value, nombreIconoEquipos, document.getElementById("usuario").value, document.getElementById('materia').value );
};

socket.on('ingresoJugadores', function (data) {
    jugadoresConectados = data;
    console.log("hola jugadores: " + jugadoresConectados);
    actualizacion();
});
function actualizacion() {
    document.getElementById("jugadoresConectados").innerText="";
    for(var i = 0 ; i < jugadoresConectados.length; i++){
        var divCard = document.createElement("DIV");
        divCard.setAttribute("id", "card"+(i+1));
        divCard.setAttribute("class", "card");
        document.getElementById("jugadoresConectados").appendChild(divCard);
        var divCard2 = document.createElement("DIV");
        divCard2.setAttribute("id", "cardB"+(i+1));
        divCard2.setAttribute("class", "card-body text-center");
        document.getElementById("card"+(i+1)).appendChild(divCard2);
        var img = document.createElement("IMG");
        img.setAttribute("id", "imagen"+(i+1));
        img.setAttribute("src", "static/buhoInicial" + (jugadoresConectados[i].iconoEquipo) + ".gif");
        img.setAttribute("width", "50px");
        img.setAttribute("height", "50px");
        document.getElementById("card"+(i+1)).appendChild(img);
        var h5 = document.createElement("H5");
        h5.setAttribute("class", "card-title");
        var t = document.createTextNode(jugadoresConectados[i].nombreEquipo);
        h5.appendChild(t);
        document.getElementById("card"+(i+1)).appendChild(h5);
    }
}

function unirPartida() {
    console.log("Hice clic ");
    socket.emit("iniciarPartida", document.getElementById('idPartida').value );
    document.getElementById('botonIniciar').click();
}