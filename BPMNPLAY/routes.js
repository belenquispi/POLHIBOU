var Profesor = require("./models/profesor").Profesor;
var Estudiante = require("./models/estudiante").Estudiante;
var Usuario = require("./models/usuario").Usuario;


exports.get_inicio = function (req, res) {
    res.render('paginas/index');
};
exports.get_inicio_sesion = function (req, res) {
    res.render('paginas/inicioSesion');
};
exports.post_inicio_sesion = function (req, res) {

    Usuario.findOne({usuario: req.body.usuario}, function (error, doc) {

        req.session.nombre = doc.nombre;
        req.session.usuario = doc.usuario;
        if(doc.rol == "profesor") {
            res.redirect('/ingresoProfesor');
        } else
        {
            if(doc.rol == "estudiante") {
                res.redirect('/ingresoEstudiante');
            }
        }
    })
};
exports.get_ingreso_profesor = function (req, res) {
    if (req.session.nombre) {
        Profesor.findOne({usuario : req.session.usuario}, function (error, doc) {
            var materias = [];
            for(var i = 0 ; i < doc.materias.length; i++)
            {
                materias.push(doc.materias[i].nombre);

            }
            res.render('paginas/inicioProfesor', {nombre: req.session.nombre, usuario: req.session.usuario, materias: materias});

        });

    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.get_ingreso_estudiante = function (req, res) {

    if (req.session.nombre) {
        res.render('paginas/inicioEstudiante', {nombre: req.session.nombre});
    }
    else {
        res.redirect('/inicioSesion');
    }
};

exports.post_creacion_cuenta = function (req, res) {

    var usuario = new Usuario ({
        nombre: req.body.nombre,
        usuario: req.body.usuario,
        contrasenia: req.body.contrasenia,
        rol : req.body.rol
    })

        usuario.save();

    if (req.body.rol == "profesor") {

        var profesor = new Profesor({
            usuario: req.body.usuario,
        })

        profesor.save();
    } else {
        if (req.body.rol == "estudiante") {

            var estudiante = new Estudiante({
                usuario: req.body.usuario,
            })

            estudiante.save();
        }
    }
    res.redirect('/inicioSesion');
};


exports.salir = function (req, res) {
    req.session.usuario = null;
    res.redirect('/');
};

exports.post_ingreso_materia = function (req, res) {

    console.log(req.session.usuario)

    Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
        var materia = {
            nombre: req.body.nombreMateria
        }
        doc.materias.push(materia);


        doc.save(function (err, docActualizado) {
            if (err) return console.log(err);
            res.redirect('/ingresoProfesor');

        })
    });

};

exports.get_preguntas_opcion = function (req, res) {
    var preguntas = [];
    res.render('paginas/listaPreguntaOpcionMultiple', {nombre: req.session.nombre, materia: req.params.materia, preguntas: preguntas });

}

exports.post_preguntas_opcion = function (req, res) {

    console.log(req.body)

 Profesor.findOne({usuario: req.session.usuario}, function (error, doc) {
        var materia = {
            nombre: req.body.nombreMateria
        }
        doc.materias.push(materia);


        doc.save(function (err, docActualizado) {
            if (err) return console.log(err);
            res.redirect('/ingresoProfesor');

        })
    });

};