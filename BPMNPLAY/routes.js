exports.get_inicio = function(req, res){
    res.render('paginas/index');
};
exports.get_inicio_sesion = function(req, res){
    res.render('paginas/inicioSesion');
};
exports.post_inicio_sesion = function(req, res){
    console.log(req)
    req.session.username = req.body.username;
    console.log(req.session.username)
    if(true){
        res.redirect('/ingresoProfesor');
    } else {
        res.redirect('/ingresoEstudiante');

    }
};
exports.get_ingreso_profesor = function(req, res){
    if(req.session.username) {
        res.render('paginas/inicioProfesor', {username: req.session.username});
    }
    else{
        res.redirect('/inicioSesion');
    }
};
exports.get_ingreso_estudiante = function(req, res){
    if(req.session.username) {
        res.render('paginas/inicioEstudiante', {username: req.session.username});
    }
    else{
        res.redirect('/inicioSesion');
    }
};
exports.salir = function(req, res){
    req.session.username = null;
    res.redirect('/');
};