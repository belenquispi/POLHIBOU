var socket = io();
var config;
var imagenesUnirVoltear = [];
var urlFile = null;

socket.emit('solicitarConfiguracion');
socket.on('configuracion',function (configN){
    config = configN;
});

var botonImagenUnir1 = document.getElementById("botonImagenUnir1");
botonImagenUnir1.addEventListener('change', function (e) {
        imagenesUnirVoltear.push(e.target.files[0]);
    }
);

var botonImagenUnir2 = document.getElementById("botonImagenUnir2");
botonImagenUnir2.addEventListener('change', function (e) {
        imagenesUnirVoltear.push(e.target.files[0]);
    }
);

var botonImagenUnir3 = document.getElementById("botonImagenUnir3");
botonImagenUnir3.addEventListener('change', function (e) {
        imagenesUnirVoltear.push(e.target.files[0]);
    }
);

var botonImagenUnir4 = document.getElementById("botonImagenUnir4");
botonImagenUnir4.addEventListener('change', function (e) {
        imagenesUnirVoltear.push(e.target.files[0]);
    }
);

var loadFile = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};

function guardarPreguntaUnirVoltear() {
    firebase.initializeApp(config);
    for (var i = 0; i < imagenesUnirVoltear.length; i++) {
        subirImagenUnir(imagenesUnirVoltear[i], function (a) {
            var preguntaUnirVoltear = {
                usuario : "bquispi",
                idMateria : "bpmn",
                urlImagenUnirVoltear: urlFile,
                textoUnirVoltear: document.getElementById('textoUnir'+(a+1)).value,
            };
            socket.emit('guardarPreguntaUnirVoltear', preguntaUnirVoltear);
        }, i);

    }

}

function subirImagenUnir(file, callback, a) {
    var storageRef = firebase.storage().ref('imagenes/' + file.name+generarNombre()+generarNombre());
    var task = storageRef.put(file);
    task.on('state_changed',
        function progress(snapshot) {
            var porcentaje = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(porcentaje);
        },
        function error(err) {
            console.log(err);
        },
        function () {
            urlFile = task.snapshot.downloadURL;
            callback(a);
        }
    );
}

function generarNombre() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}