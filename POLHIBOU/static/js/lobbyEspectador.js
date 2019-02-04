var socket = io();
//var socket = io.connect ('http://polhibou.epn.edu.ec/');
var jugadoresConectados = [];

window.onload = function () {
    var codigoPartida = document.getElementById("codigoPartida").value;
    var tipoIngreso = document.getElementById("tipoIngreso").value;
    var nombreEquipo = document.getElementById("nombreEquipo").value;
    console.log(nombreEquipo);
    socket.emit('inicio', codigoPartida, tipoIngreso, nombreEquipo);
};

socket.on('ingresoJugadores', function (data) {
    jugadoresConectados = data;
    console.log("hola jugadores: " + jugadoresConectados);
    actualizacion();
});

socket.on('unirPartida', function () {
    console.log("Hice clic en el cliente");
    document.getElementById('botonUnirPartida').click();
});
function actualizacion() {
    document.getElementById("jugadoresConectados").innerText="";
    for(var i = 0 ; i < jugadoresConectados.length; i++){
        var div0 = document.createElement("DIV");
        div0.setAttribute("id", "cardI"+(i+1));
        div0.setAttribute("class", "col-sm-3");
        div0.setAttribute("style", "padding:10px");
        document.getElementById("jugadoresConectados").appendChild(div0);
        var divCard = document.createElement("DIV");
        divCard.setAttribute("id", "card"+(i+1));
        divCard.setAttribute("class", "card opacoCard text-center");
        document.getElementById("cardI"+(i+1)).appendChild(divCard);
        var divCard2 = document.createElement("DIV");
        divCard2.setAttribute("id", "cardB"+(i+1));
        divCard2.setAttribute("class", "card-body text-center");
        document.getElementById("card"+(i+1)).appendChild(divCard2);
        var img = document.createElement("IMG");
        img.setAttribute("id", "imagen"+(i+1));
        img.setAttribute("src", "static/imagenes/equipo" + (jugadoresConectados[i].iconoEquipo) + ".svg");
        img.setAttribute("class", "rounded mx-auto d-block");
        img.setAttribute("width", "50px");
        img.setAttribute("height", "50px");
        document.getElementById("card"+(i+1)).appendChild(img);
        var h5 = document.createElement("H5");
        h5.setAttribute("class", "card-title textoBlanco");
        h5.setAttribute("style", "text-transform: uppercase");
        var t = document.createTextNode(jugadoresConectados[i].nombreEquipo);
        h5.appendChild(t);
        document.getElementById("card"+(i+1)).appendChild(h5);
    }
}