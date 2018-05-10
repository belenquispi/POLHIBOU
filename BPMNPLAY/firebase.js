var preguntas = [];
var preguntaRandomica;
var resCorrecta;
var downloadURL = null;
var downloadURLRes1 = null;
var downloadURLRes2 = null;
var downloadURLRes3 = null;
var downloadURLRes4 = null;
var imagenes = [];
var file = null;
var file1 = null;
var file2 = null;
var file3 = null;
var file4 = null;

// Initialize Firebase

var config = {
    apiKey: "AIzaSyARHMJb3ta8XMRb0lFRjUSgSP6RCZiayVo",
    authDomain: "bpmnplaydb.firebaseapp.com",
    databaseURL: "https://bpmnplaydb.firebaseio.com",
    projectId: "bpmnplaydb",
    storageBucket: "bpmnplaydb.appspot.com",
    messagingSenderId: "559035240947", timestampsInSnapshots: true
};

firebase.initializeApp(config);

var db = firebase.firestore();


var settings = {
    timestampsInSnapshots: true
};

db.settings(settings);



function obtenerPreguntas() {
    console.log("preguntassssss")
    // var docRef = db.collection("preguntas");
    db.collection("preguntas").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            preguntas.push(doc.data());
            preguntas[preguntas.length - 1].usada = "falsa";
        });

    });
}

function guardarPregunta() {
   for(var i=0; i<imagenes.length;i++)
   {
        cargarImagen(imagenes[i]);
   }
    var enunciado = document.getElementById('enunciado').value
    var res1 = document.getElementById('res1').value
    var res2 = document.getElementById('res2').value
    var res3 = document.getElementById('res3').value
    var res4 = document.getElementById('res4').value
    var resCorrecta = document.getElementById('resCorrecta').value
    var idMateria = "BPMN"


    console.log(enunciado + res1 + res2 + res3 + res4 + resCorrecta + idMateria)

    setTimeout(function(){  db.collection("preguntas").doc().set({
        enunciado: enunciado,
        urlEnunciado: downloadURL,
        res1: res1,
        urlRes1: downloadURLRes1,
        res2: res2,
        urlRes2: downloadURLRes2,
        res3: res3,
        urlRes3: downloadURLRes3,
        res4: res4,
        urlRes4: downloadURLRes4,
        resCorrecta: resCorrecta,
        idMateria: idMateria
    })
        .then(function () {
            alert("guardado")
            console.log("Document successfully written!");
        })
        .catch(function (error) {
            alert("No guardado")
            console.error("Error writing document: ", error);
        }); }, 3000);


}

function indiceRandomico() {
    preguntaRandomica = Math.floor(Math.random() * preguntas.length)
}


function cargarPreguntas() {
    var contadorVerdaderas = 0;
    for(var t=0; t < preguntas.length; t++)
    {
        if(preguntas[t].usada == "verdadera") {contadorVerdaderas++};
       }
    if(contadorVerdaderas == preguntas.length)
           {

                for(var t=0; t < preguntas.length; t++)
                {
                    console.log("llenase" + contadorVerdaderas);
                preguntas[t].usada = "falsa";
           }
       }

    indiceRandomico();
    console.log("correcto")
    console.log(preguntaRandomica);
    if (preguntas[preguntaRandomica].usada == "falsa") {
        console.log("11111 " + preguntaRandomica);
        document.getElementById("enunciado").innerHTML = preguntas[preguntaRandomica].enunciado;
        if(preguntas[preguntaRandomica].urlEnunciado != null)
        {
            console.log("sin datos")
            document.getElementById("imagenEnunciado").src = preguntas[preguntaRandomica].urlEnunciado;
        }
        if(preguntas[preguntaRandomica].urlRes1 != null)
        {
            document.getElementById("divRespuestasImagenes").removeAttribute("hidden")
            document.getElementById("divRespuestasTexto").setAttribute("hidden","")
            document.getElementById("imagenRes1").src = preguntas[preguntaRandomica].urlRes1;
            document.getElementById("imagenRes2").src = preguntas[preguntaRandomica].urlRes2;
            document.getElementById("imagenRes3").src = preguntas[preguntaRandomica].urlRes3;
            document.getElementById("imagenRes4").src = preguntas[preguntaRandomica].urlRes4;
        }
        else {
            document.getElementById("divRespuestasTexto").removeAttribute("hidden")
            document.getElementById("divRespuestasImagenes").setAttribute("hidden","")
            document.getElementById("res1").innerHTML = preguntas[preguntaRandomica].res1;
            document.getElementById("res2").innerHTML = preguntas[preguntaRandomica].res2;
            document.getElementById("res3").innerHTML = preguntas[preguntaRandomica].res3;
            document.getElementById("res4").innerHTML = preguntas[preguntaRandomica].res4;
        }
        resCorrecta = preguntas[preguntaRandomica].resCorrecta;
        preguntas[preguntaRandomica].usada = "verdadera";
        console.log(preguntas[preguntaRandomica].usada);
    }
    else {
        cargarPreguntas();
    }
}

function cargarImagen(nombreFile) {
    console.log("hola1")
    console.log(nombreFile);
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

        var storageRef = firebase.storage().ref('imagenes/' + files.name)

        var task = storageRef.put(files);
        console.log("hola2")
        task.on('state_changed',
            function progress(snapshot) {
                var porcentaje = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                console.log(porcentaje);
            },
            function error(err) {
                console.log(err);
            },

            function () {
                switch (nombreFile) {
                    case "file":
                        downloadURL = task.snapshot.downloadURL;
                        console.log("url" + downloadURL);
                        break;
                    case "file1":
                        downloadURLRes1 = task.snapshot.downloadURL;
                        console.log("url1 " + downloadURLRes1);
                        break;
                    case "file2":
                        downloadURLRes2 = task.snapshot.downloadURL;
                        console.log("url2 " + downloadURLRes2);
                        break;
                    case "file3":
                        downloadURLRes3 = task.snapshot.downloadURL;
                        console.log("url3 " + downloadURLRes3);
                        break;
                    case "file4":
                        downloadURLRes4 = task.snapshot.downloadURL;
                        console.log("url 4" + downloadURLRes4);
                        break;

                }

            }
        );
}


