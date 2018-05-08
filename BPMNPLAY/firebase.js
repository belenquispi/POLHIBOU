
var preguntas = [];
var preguntaRandomica ;
var resCorrecta;
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
    timestampsInSnapshots: true};

db.settings(settings);


function obtenerPreguntas()
{
    console.log("preguntassssss")
   // var docRef = db.collection("preguntas");
    db.collection("preguntas").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            preguntas.push(doc.data());
            preguntas[preguntas.length-1].usada="falsa";
        });

    });
}

function guardarPregunta() {
    var enunciado = document.getElementById('enunciado').value
    var res1 = document.getElementById('res1').value
    var res2 = document.getElementById('res2').value
    var res3 = document.getElementById('res3').value
    var res4 = document.getElementById('res4').value
    var resCorrecta = document.getElementById('resCorrecta').value
    var idMateria = "BPMN"

    console.log(enunciado + res1 + res2 + res3 + res4 + resCorrecta + idMateria)

    db.collection("preguntas").doc().set({
        enunciado: enunciado,
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
        });
}

 function indiceRandomico()
{
    preguntaRandomica = Math.floor(Math.random()* preguntas.length);
}


function cargarPreguntas()
{
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
    if(preguntas[preguntaRandomica].usada == "falsa")
    {
        console.log("11111 " + preguntaRandomica);
        document.getElementById("enunciado").innerHTML = preguntas[preguntaRandomica].enunciado;
        document.getElementById("res1").innerHTML = preguntas[preguntaRandomica].res1;
        document.getElementById("res2").innerHTML = preguntas[preguntaRandomica].res2;
        document.getElementById("res3").innerHTML = preguntas[preguntaRandomica].res3;
        document.getElementById("res4").innerHTML = preguntas[preguntaRandomica].res4;
        resCorrecta = preguntas[preguntaRandomica].resCorrecta;

        preguntas[preguntaRandomica].usada = "verdadera";
        console.log(preguntas[preguntaRandomica].usada);
    }
    else
    {
        cargarPreguntas();
    }



}


