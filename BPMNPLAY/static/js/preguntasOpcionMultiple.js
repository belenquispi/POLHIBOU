var socket = io();
var imagenes = [];
var config;
var file = null, file1 = null, file2 = null, file3 = null, file4 = null;
var urlFile = "", urlFile1 = "", urlFile2 = "", urlFile3 = "", urlFile4 = "";
var contadorURL = 0;
var botonArchivoEnunciado = document.getElementById("botonArchivoEnunciado");
botonArchivoEnunciado.addEventListener('change', function (e) {
        file = e.target.files[0];
        if (imagenes.indexOf("file") < 0) {
            imagenes.push("file");
        }
    }
);

var botonArchivoRes1 = document.getElementById("botonArchivoRes1");
botonArchivoRes1.addEventListener('change', function (e) {
        file1 = e.target.files[0];
        if (imagenes.indexOf("file1") < 0) {
            imagenes.push("file1");
        }
    }
);

var botonArchivoRes2 = document.getElementById("botonArchivoRes2");
botonArchivoRes2.addEventListener('change', function (e) {
        file2 = e.target.files[0];
        if (imagenes.indexOf("file2") < 0) {
            imagenes.push("file2");
        }
    }
);

var botonArchivoRes3 = document.getElementById("botonArchivoRes3");
botonArchivoRes3.addEventListener('change', function (e) {
        file3 = e.target.files[0];
        if (imagenes.indexOf("file3") < 0) {
            imagenes.push("file3");
        }
    }
);

var botonArchivoRes4 = document.getElementById("botonArchivoRes4");
botonArchivoRes4.addEventListener('change', function (e) {
        file4 = e.target.files[0];
        if (imagenes.indexOf("file4") < 0) {
            imagenes.push("file4");
        }
    }
);

socket.emit('solicitarConfiguracion');
socket.on('configuracion',function (configN){
    config = configN;
});

var mostrarVistaPreviaImagen = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};

function mostrarRespuestas(valor) {
    if (valor == 1) {
        document.getElementById("divRespuestasTexto").removeAttribute("hidden");
        document.getElementById("divRespuestasImagenes").setAttribute("hidden", "");
        document.getElementById("soloImagenes").setAttribute("hidden", "")
    }
    if (valor == 2) {
        document.getElementById("divRespuestasImagenes").removeAttribute("hidden");
        document.getElementById("divRespuestasTexto").setAttribute("hidden", "");
        document.getElementById("soloTexto").setAttribute("hidden", "")
    }
    document.getElementById("divRespuestas").removeAttribute("hidden");
    document.getElementById("divBotonGuardar").removeAttribute("hidden")

}


function verificarBotonGuardar() {
    console.log("hola" + document.getElementById("enunciado").value);
    if (document.getElementById("enunciado").value != ""
        &&
        ((document.getElementById("res1").value != ""
            && document.getElementById("res2").value != ""
            && document.getElementById("res3").value != ""
            && document.getElementById("res4").value != "")
            || (document.getElementById("botonArchivoRes1").value != ""
                && document.getElementById("botonArchivoRes2").value != ""
                && document.getElementById("botonArchivoRes3").value != ""
                && document.getElementById("botonArchivoRes4").value != ""))) {
        document.getElementById("botonGuardar").removeAttribute("disabled")
    }
    else {
        document.getElementById("botonGuardar").setAttribute("disabled", "")
    }
    console.log("tamaño " + imagenes.length)

}

function guardarPreguntaOpcionMultiple() {
    console.log(config);
    firebase.initializeApp(config);
    if(imagenes.length == 0){
        var preguntaOpcionMultiple = {
            usuario : "bquispi",
            idMateria : "bpmn",
            enunciado: document.getElementById('enunciado').value,
            urlEnunciado: urlFile,
            res1: document.getElementById('res1').value,
            urlRes1: urlFile1,
            res2: document.getElementById('res2').value,
            urlRes2: urlFile2,
            res3: document.getElementById('res3').value,
            urlRes3: urlFile3,
            res4: document.getElementById('res4').value,
            urlRes4: urlFile4,
            resCorrecta : document.getElementById('resCorrecta').value
        };
        socket.emit('guardarPreguntaOpcionMultiple', preguntaOpcionMultiple);
    }
    for (var i = 0; i < imagenes.length; i++) {
        subirImagenOpcionMultiple(imagenes[i], function () {

            if(contadorURL == imagenes.length)
            {
                var preguntaOpcionMultiple = {
                    usuario : "bquispi",
                    idMateria : "bpmn",
                    enunciado: document.getElementById('enunciado').value,
                    urlEnunciado: urlFile,
                    res1: document.getElementById('res1').value,
                    urlRes1: urlFile1,
                    res2: document.getElementById('res2').value,
                    urlRes2: urlFile2,
                    res3: document.getElementById('res3').value,
                    urlRes3: urlFile3,
                    res4: document.getElementById('res4').value,
                    urlRes4: urlFile4,
                    resCorrecta : document.getElementById('resCorrecta').value
                };
                socket.emit('guardarPreguntaOpcionMultiple', preguntaOpcionMultiple);
            }
        });
    }
}

function subirImagenOpcionMultiple(nombreFile, callback) {
    var files = null;
    switch (nombreFile) {
        case "file":
            files = file;
            break;
        case "file1":
            files = file1;
            break;
        case "file2":
            files = file2;
            break;
        case "file3":
            files = file3;
            break;
        case "file4":
            files = file4;
            break;
    }

    var storageRef = firebase.storage().ref('imagenes/' + files.name+generarNombre()+generarNombre());

    var task = storageRef.put(files);
    task.on('state_changed',
        function progress(snapshot) {
            var porcentaje = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        },
        function error(err) {
            console.log(err);
        },

        function () {
            switch (nombreFile) {
                case "file":
                    urlFile = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;
                case "file1":
                    urlFile1 = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;
                case "file2":
                    urlFile2 = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;
                case "file3":
                    urlFile3 = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;
                case "file4":
                    urlFile4 = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;

            }

        }
    );
}



function generarNombre() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
