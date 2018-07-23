var Profesor = require("./models/profesor").Profesor;
var Estudiante = require("./models/estudiante").Estudiante;


exports.get_inicio = function (req, res) {
    res.render('paginas/index');
};
exports.get_inicio_sesion = function (req, res) {
    res.render('paginas/inicioSesion');
};
exports.post_inicio_sesion = function (req, res) {

    var usuario = "";

    Profesor.find({usuario: req.body.username}, "nombre", function (error, doc) {

        usuario = doc;
        console.log(doc)


    })

    if (usuario.length > 0) {
        req.session.username = usuario.nombre;
        res.redirect('/ingresoProfesor');
        console.log("hola")
    }
    else {
        Estudiante.find({usuario: req.body.username}, "nombre", function (error, docE) {
            usuario = docE;
        })
        if (usuario.length > 0) {
            req.session.username = usuario.nombre;
            res.redirect('/ingresoEstudiante');
            console.log("hola2")
        } else {
            res.redirect('/inicioSesion');
        }
    }

};
exports.get_ingreso_profesor = function (req, res) {
    if (req.session.username) {
        res.render('paginas/inicioProfesor', {username: req.session.username});
    }
    else {
        res.redirect('/inicioSesion');
    }
};
exports.get_ingreso_estudiante = function (req, res) {

    if (req.session.username) {
        res.render('paginas/inicioEstudiante', {username: req.session.username});
    }
    else {
        res.redirect('/inicioSesion');
    }
};

exports.post_creacion_cuenta = function (req, res) {
    if (req.body.rol == "profesor") {

        var profesor = new Profesor({
            nombre: req.body.nombre,
            usuario: req.body.usuario,
            contrasenia: req.body.contrasenia
        })

        profesor.save();
    } else {
        if (req.body.rol == "estudiante") {

            var estudiante = new Estudiante({
                nombre: req.body.nombre,
                usuario: req.body.usuario,
                contrasenia: req.body.contrasenia
            })

            estudiante.save();
        }
    }
    res.redirect('/inicioSesion');
};


exports.salir = function (req, res) {
    req.session.username = null;
    res.redirect('/');
};