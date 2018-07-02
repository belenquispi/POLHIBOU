var vectorTextoUnir = [];
var preguntaRandomica;
var resCorrecta;
var imagenes = [];
var imagenesUnirVoltear = [];
var contadorURL = 0;

var admin = require('firebase-admin');
var serviceAccount = require('./bpmnplaydb-firebase-adminsdk-kgx4h-9094a1d02d.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://BPMNPlayDB.firebaseio.com',
});
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
            console.log("creandoMateria");
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

        insertarPreguntasOpcionMultiple: function (preguntaOpcionMultiple) {

            console.log("creandoPregunta");

                        db.collection('profesores').doc(preguntaOpcionMultiple.usuario).collection('materias').doc(preguntaOpcionMultiple.idMateria).collection('preguntasOpcionMultiple').add({
                            enunciado: preguntaOpcionMultiple.enunciado,
                            urlEnunciado: preguntaOpcionMultiple.urlEnunciado,
                            res1: preguntaOpcionMultiple.res1,
                            urlRes1: preguntaOpcionMultiple.urlRes1,
                            res2: preguntaOpcionMultiple.res2,
                            urlRes2: preguntaOpcionMultiple.urlRes2,
                            res3: preguntaOpcionMultiple.res3,
                            urlRes3: preguntaOpcionMultiple.urlRes3,
                            res4: preguntaOpcionMultiple.res4,
                            urlRes4: preguntaOpcionMultiple.urlRes4,
                            resCorrecta: preguntaOpcionMultiple.resCorrecta,
                        }).then(ref => {
                            console.log("Se ha creado exitosamente la pregunta opcion multiple")
                        })
                            .catch(error => {
                                console.log("error al crear la pregunta opcion multiple")
                            });


        },

        insertarPreguntasUnirVoltear: function (preguntaUnirVoltear ) {
            console.log("creando unir voltear");
            db.collection('profesores').doc(preguntaUnirVoltear.usuario).collection('materias').doc(preguntaUnirVoltear.idMateria).collection('preguntasUnirVoltear').add({
                textoUnirVoltear: preguntaUnirVoltear.textoUnirVoltear,
                urlImagenUnirVoltear: preguntaUnirVoltear.urlImagenUnirVoltear
            }).then(ref => {
                console.log("Se ha creado exitosamente la pregunta unir voltear")
            })
                .catch(error => {
                    console.log("error al crear la pregunta unir voltear")
                });
        },

        obtenerPreguntasOpcionMultiple: function (usuario, idMateria) {
            console.log("preguntassssss");
            var preguntasOpcionMultiple = [];
            console.log("uuuuu" + usuario+" "+idMateria);

            var referenciaProfesores = db.collection('profesores').doc(usuario).collection('materias').doc(idMateria).collection('preguntasOpcionMultiple');
            referenciaProfesores.get().then(collections => {
                collections.forEach(doc => {
                    console.log("iiiilll: "+doc.id);

                    preguntasOpcionMultiple.push(doc.data());
                    preguntasOpcionMultiple[preguntasOpcionMultiple.length - 1].usada = false;
                });
            })
                .catch(error => {
                   console.log(error) ;
                });
            return preguntasOpcionMultiple;
        },

        obtenerPreguntasUnir: function (usuario, idMateria) {

            var preguntasUnirVoltear = [];
            var referenciaProfesores = db.collection('profesores').doc(usuario).collection('materias').doc(idMateria).collection('preguntasUnirVoltear');
            var documen = referenciaProfesores.get().then(collections => {
                collections.forEach(doc => {
                    preguntasUnirVoltear.push(doc.data());
                    preguntasUnirVoltear[preguntasUnirVoltear.length - 1].usada = false;
                    console.log("iiii "+doc.id);
                });
            });
        return preguntasUnirVoltear;
        }
    };

