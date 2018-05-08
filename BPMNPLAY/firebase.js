var preguntas = [];
var preguntaRandomica;
var resCorrecta;
var downloadURL = null;
var file = null;

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
    if (file != null) {
    cargarImagen();
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
        res2: res2,
        res3: res3,
        res4: res4,
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
        document.getElementById("res1").innerHTML = preguntas[preguntaRandomica].res1;
        document.getElementById("res2").innerHTML = preguntas[preguntaRandomica].res2;
        document.getElementById("res3").innerHTML = preguntas[preguntaRandomica].res3;
        document.getElementById("res4").innerHTML = preguntas[preguntaRandomica].res4;
        resCorrecta = preguntas[preguntaRandomica].resCorrecta;
        preguntas[preguntaRandomica].usada = "verdadera";
        console.log(preguntas[preguntaRandomica].usada);
    }
    else {
        cargarPreguntas();
    }
}

function cargarImagen() {
    console.log("hola1")
    console.log(file);
        var storageRef = firebase.storage().ref('imagenes/' + file.name)

        var task = storageRef.put(file);
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
                downloadURL = task.snapshot.downloadURL;
                console.log("url" + downloadURL);
            }
        );

}


