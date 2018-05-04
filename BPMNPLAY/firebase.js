
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
    messagingSenderId: "559035240947",
    timestampsInSnapshots: true
}


firebase.initializeApp(config);

var db = firebase.firestore();

var settings = {
    timestampsInSnapshots: true};
db.settings(settings);


function obtenerPreguntas()
{
    console.log("preguntassssss")
    var docRef = db.collection("preguntas");


    db.collection("preguntas").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            preguntas.push(doc.data());
            preguntas[preguntas.length-1].usada="falsa";
        });

    });


}

db.collection("preguntas").doc("2").set({
    enunciado: "Enunciado 2",
    res1: "Respuesta A2",
    res2: "Respuesta B2",
    res3: "Respuesta C2",
    res4: "Respuesta D2",
    resCorrecta : "res1",
    idMateria : "BPMN"
})
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });

 function indiceRandomico()
{
    preguntaRandomica = Math.floor(Math.random()* preguntas.length)
   /* if(preguntas[preguntaRandomica].usada == "falsa")
    {
        console.log("11111 " + preguntaRandomica);
        return preguntaRandomica;
    }
    else
    {
        indiceRandomico();
    }*/


}


function cargarPreguntas()
{
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


