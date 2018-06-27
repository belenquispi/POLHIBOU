var vectorTextoUnir = [];
var preguntaRandomica;
var resCorrecta;
var downloadURL = null;
var downloadURLRes1 = null;
var downloadURLRes2 = null;
var downloadURLRes3 = null;
var downloadURLRes4 = null;
var file = null;
var file1 = null;
var file2 = null;
var file3 = null;
var file4 = null;
var imagenes = [];
var imagenesUnirVoltear = [];
var contadorURL = 0;

var admin = require('firebase-admin');
var serviceAccount = require('./bpmnplaydb-firebase-adminsdk-kgx4h-9094a1d02d.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://BPMNPlayDB.firebaseio.com',
    storageBucket: 'bpmnplaydb.appspot.com'
});
var bucket = admin.storage().bucket()
var db = admin.firestore();

module.exports =
    {
        insertarNuevoProfesor: function (usuarioN, contraseñaN, nombreN) {
            console.log("creandoUsuario");
            var nuevoProfesor = db.collection('profesores').doc(usuarioN).set({
                usuario: usuarioN,
                contraseña: contraseñaN,
                nombre: nombreN
            }).then(ref => {
                console.log("Se ha creado exitosamente el profesor")
            })
                .catch(error => {
                    console.log("error al crear el profesor")
                });

        },

        insertarMaterias: function (usuarioProfesor, idMateriaN, nombreMateriaN) {
            console.log("creandoMateria")
            var nuevaMateria = db.collection('profesores').doc(usuarioProfesor).collection('materias').doc(idMateriaN).set({
                idMateria: idMateriaN,
                nombreMateria: nombreMateriaN
            }).then(ref => {
                console.log("Se ha creado exitosamente la materia")
            })
                .catch(error => {
                    console.log("error al crear la materia")
                });
        },

        insertarPreguntasOpcionMultiple: function (imagenes, fileN, file1N, file2N, file3N, file4N, preguntaOpcionMultiple) {
            file = fileN;
            file1 = file1N;
            file2 = file2N;
            file3 = file3N;
            file4 = file4N;
            console.log("creandoPregunta")
            for (var i = 0; i < imagenes.length; i++) {
                subirImagenOpcionMultiple(imagenes[i], function () {

                    if (contadorURL == imagenes.length) {
                        db.collection('profesores').doc(preguntaOpcionMultiple.usuario).collection('materias').doc(preguntaOpcionMultiple.idMateria).collection('preguntasOpcionMultiple').add({
                            enunciado: preguntaOpcionMultiple.enunciado,
                            urlEnunciado: downloadURL,
                            res1: preguntaOpcionMultiple.res1,
                            urlRes1: downloadURLRes1,
                            res2: preguntaOpcionMultiple.res2,
                            urlRes2: downloadURLRes2,
                            res3: preguntaOpcionMultiple.res3,
                            urlRes3: downloadURLRes3,
                            res4: preguntaOpcionMultiple.res4,
                            urlRes4: downloadURLRes4,
                            resCorrecta: preguntaOpcionMultiple.resCorrecta,
                        }).then(ref => {
                            console.log("Se ha creado exitosamente la pregunta opcion multiple")
                        })
                            .catch(error => {
                                console.log("error al crear la pregunta opcion multiple")
                            });
                    }
                });
            }

        },

        insertarPreguntasUnirVoltear: function (usuarioProfesor, idMateriaN) {
            console.log("creandoMateria")
            var nuevaMateria = db.collection('profesores').doc(usuarioProfesor).collection('materias').doc(idMateriaN).collection('preguntasUnirVoltear').add({
                idMateria: idMateriaN,
                nombreMateria: nombreMateriaN
            }).then(ref => {
                console.log("Se ha creado exitosamente la pregunta unir voltear")
            })
                .catch(error => {
                    console.log("error al crear la pregunta unir voltear")
                });
        },

        obtenerPreguntasOpcionMultiple: function (idMateria) {
            console.log("preguntassssss")
            var preguntasOpcionMultiple = [];

            var referenciaProfesores = db.collection('profesores').doc('msantorum').collection('materias').doc('bpmn').collection('preguntasUnirVoltear');
            var documen = referenciaProfesores.get().then(collections => {
                collections.forEach(doc => {
                    // preguntasOpcionMultiple.push(doc.data());
                    //preguntasOpcionMultiple[preguntasOpcionMultiple.length - 1].usada = "falsa";
                    console.log(doc.id);
                });


            })


            var preguntasRef = db.collection('preguntas').where('idMateria', '==', idMateria);
            var todasLasPreguntas = preguntasRef.get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        preguntasOpcionMultiple.push(doc.data());
                        preguntasOpcionMultiple[preguntasOpcionMultiple.length - 1].usada = "falsa";
                        // console.log(doc.id, '=>', doc.data());
                    });


                })
                .catch(error => {
                    console.log("Error en obtener preguntas opcion multiple: " + error);
                });
            return preguntasOpcionMultiple;
        },

        obtenerPreguntasUnir: function () {

            var datosUnirVoltear = {
                preguntasUnirVoltear: [],
                memory_array: []
            }
            var preguntasUnirVoltearRef = db.collection('preguntasUnirVoltear');
            var todasLasPreguntasUnir = preguntasUnirVoltearRef.get().then(snapshot => {
                snapshot.forEach(doc => {
                    datosUnirVoltear.preguntasUnirVoltear.push(doc.data());
                    datosUnirVoltear.memory_array.push(doc.data().urlImagenUnirVoltear);
                    datosUnirVoltear.memory_array.push(doc.data().urlImagenUnirVoltear);
                    //  console.log(memory_array.length);
                    datosUnirVoltear.preguntasUnirVoltear[datosUnirVoltear.preguntasUnirVoltear.length - 1].usada = "falsa";
                });

            })
                .catch(error => {
                    console.log("Error en obtener preguntas unir voltear " + error);
                });
            return datosUnirVoltear;
        }

        /*// Initialize Firebase
        var config = {
            apiKey: "AIzaSyARHMJb3ta8XMRb0lFRjUSgSP6RCZiayVo",
            authDomain: "bpmnplaydb.firebaseapp.com",
            databaseURL: "https://bpmnplaydb.firebaseio.com",
            projectId: "bpmnplaydb",
            storageBucket: "bpmnplaydb.appspot.com",
            messagingSenderId: "559035240947", timestampsInSnapshots: true};
        firebase.initializeApp(config);

        var db = firebase.firestore();
        var settings = { timestampsInSnapshots: true};
        db.settings(settings);

        function mostrarUnir() {
            vectorTextoUnir = [];
            for (var j = 0; j < 4; j++) {
                cargarUnirVoltear();
            }
            desordenarTextoUnir();
            for (var a = 0; a < vectorTextoUnir.length; a++) {
                document.getElementById("botonImagenAUnir"+(a+1)).setAttribute("nombre",respuestaCorrectaUnir[a*2]);
                document.getElementById("imagenAUnir"+(a+1)).src = respuestaCorrectaUnir[a*2];
                document.getElementById("textoAUnir"+(a+1)).innerHTML = vectorTextoUnir[a];

            }
        }


        function cargarUnirVoltear() {
            var contadorVerdaderas = 0;
            for (var t = 0; t < preguntasUnirVoltear.length; t++) {
                if (preguntasUnirVoltear[t].usada == "verdadera") {
                    contadorVerdaderas++;
                }
            }
            if (contadorVerdaderas == preguntasUnirVoltear.length) {

                for (var t = 0; t < preguntasUnirVoltear.length; t++) {
                    preguntasUnirVoltear[t].usada = "falsa";
                }
            }
            indiceRandomico(preguntasUnirVoltear);
            if (preguntasUnirVoltear[preguntaRandomica].usada == "falsa") {
                    respuestaCorrectaUnir.push(preguntasUnirVoltear[preguntaRandomica].urlImagenUnirVoltear);
                    respuestaCorrectaUnir.push(preguntasUnirVoltear[preguntaRandomica].textoUnirVoltear);
                    preguntasUnirVoltear[preguntaRandomica].usada = "verdadera";
                    vectorTextoUnir.push(preguntasUnirVoltear[preguntaRandomica].textoUnirVoltear);
            }
            else {
                cargarUnirVoltear();
            }
        }

        function desordenarTextoUnir() {
            var j, x, i;
            for (i = vectorTextoUnir.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = vectorTextoUnir[i];
                vectorTextoUnir[i] = vectorTextoUnir[j];
                vectorTextoUnir[j] = x;
            }
        }

        function guardarPreguntaOpcionMultiple() {
            for (var i = 0; i < imagenes.length; i++) {
                subirImagenOpcionMultiple(imagenes[i], function () {

                    if(contadorURL == imagenes.length)
                    {
                        var enunciado = document.getElementById('enunciado').value
                        var res1 = document.getElementById('res1').value
                        var res2 = document.getElementById('res2').value
                        var res3 = document.getElementById('res3').value
                        var res4 = document.getElementById('res4').value
                        var resCorrecta = document.getElementById('resCorrecta').value
                        var idMateria = "BPMN"

                            db.collection("preguntas").doc().set({
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
                                });
                    }
                });
            }
        }

        function guardarPreguntaUnirVoltear() {

                for (var i = 0; i < imagenesUnirVoltear.length; i++) {

                    subirImagenUnir(imagenesUnirVoltear[i], function (a) {
                        var textoUnir = document.getElementById('textoUnir'+(a+1)).value;
                        var idMateria = "BPMN";
                        db.collection("preguntasUnirVoltear").doc().set({
                            urlImagenUnirVoltear: downloadURL,
                            textoUnirVoltear: textoUnir,
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
                    }, i);
                }
        }

        function indiceRandomico(listaPreguntas) {
            preguntaRandomica = Math.floor(Math.random() * listaPreguntas.length)
        }

        function cargarPreguntasOpcionMultiple() {
            var contadorVerdaderas = 0;
            for (var t = 0; t < preguntasOpcionMultiple.length; t++) {
                if (preguntasOpcionMultiple[t].usada == "verdadera") {
                    contadorVerdaderas++
                }
                ;
            }
            if (contadorVerdaderas == preguntasOpcionMultiple.length) {

                for (var t = 0; t < preguntasOpcionMultiple.length; t++) {
                    preguntasOpcionMultiple[t].usada = "falsa";
                }
            }

            indiceRandomico(preguntasOpcionMultiple);
            if (preguntasOpcionMultiple[preguntaRandomica].usada == "falsa") {
                document.getElementById("enunciado").innerHTML = preguntasOpcionMultiple[preguntaRandomica].enunciado;
                if (preguntasOpcionMultiple[preguntaRandomica].urlEnunciado != null) {
                    document.getElementById("imagenEnunciado").src = preguntasOpcionMultiple[preguntaRandomica].urlEnunciado;
                } else
                {
                   document.getElementById("imagenEnunciado").src = "vacio.png";

                }
                if (preguntasOpcionMultiple[preguntaRandomica].urlRes1 != null) {
                    document.getElementById("divRespuestasImagenes").removeAttribute("hidden")
                    document.getElementById("divRespuestasTexto").setAttribute("hidden", "")
                    document.getElementById("imagenRes1").src = preguntasOpcionMultiple[preguntaRandomica].urlRes1;
                    document.getElementById("imagenRes2").src = preguntasOpcionMultiple[preguntaRandomica].urlRes2;
                    document.getElementById("imagenRes3").src = preguntasOpcionMultiple[preguntaRandomica].urlRes3;
                    document.getElementById("imagenRes4").src = preguntasOpcionMultiple[preguntaRandomica].urlRes4;
                }
                else {
                    document.getElementById("divRespuestasTexto").removeAttribute("hidden")
                    document.getElementById("divRespuestasImagenes").setAttribute("hidden", "")
                    document.getElementById("res1").innerHTML = preguntasOpcionMultiple[preguntaRandomica].res1;
                    document.getElementById("res2").innerHTML = preguntasOpcionMultiple[preguntaRandomica].res2;
                    document.getElementById("res3").innerHTML = preguntasOpcionMultiple[preguntaRandomica].res3;
                    document.getElementById("res4").innerHTML = preguntasOpcionMultiple[preguntaRandomica].res4;
                }
                resCorrecta = preguntasOpcionMultiple[preguntaRandomica].resCorrecta;
                preguntasOpcionMultiple[preguntaRandomica].usada = "verdadera";
            }
            else {
                cargarPreguntasOpcionMultiple();
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

            var storageRef = firebase.storage().ref('imagenes/' + files.name+generarNombre()+generarNombre())

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
                            downloadURL = task.snapshot.downloadURL;
                            contadorURL++;
                            callback();
                            break;
                        case "file1":
                            downloadURLRes1 = task.snapshot.downloadURL;
                            contadorURL++;
                            callback();
                            break;
                        case "file2":
                            downloadURLRes2 = task.snapshot.downloadURL;
                            contadorURL++;
                            callback();
                            break;
                        case "file3":
                            downloadURLRes3 = task.snapshot.downloadURL;
                            contadorURL++;
                            callback();
                            break;
                        case "file4":
                            downloadURLRes4 = task.snapshot.downloadURL;
                            contadorURL++;
                            callback();
                            break;
                    }
                }
            );
        }

        function subirImagenUnir(file, callback, a) {
            var storageRef = firebase.storage().ref('imagenes/' + file.name+generarNombre()+generarNombre())
            var task = storageRef.put(file);
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
                    callback(a);
                }
            );
        }

        function generarNombre() {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);}

        };
        */
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

    var storageRef = admin.storage().ref('imagenes/' + files.name + generarNombre() + generarNombre())

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
                    downloadURL = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;
                case "file1":
                    downloadURLRes1 = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;
                case "file2":
                    downloadURLRes2 = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;
                case "file3":
                    downloadURLRes3 = task.snapshot.downloadURL;
                    contadorURL++;
                    callback();
                    break;
                case "file4":
                    downloadURLRes4 = task.snapshot.downloadURL;
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