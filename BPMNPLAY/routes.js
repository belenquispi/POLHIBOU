exports.get_identificacion = function(req, res){
    res.render('paginas/index');
};
exports.post_identificacion = function(req, res){
    req.session.nombre = req.body.nombre;
    res.redirect('paginas/ingresoPartida');
};
exports.bienvenida = function(req, res){
    if(req.session.nombre){
        res.render('sesiones/bienvenida', {nombre: req.session.nombre});
    }else{
        res.redirect('/identificacion');
    }
};
exports.salir = function(req, res){
    req.session.nombre = null;
    res.redirect('/identificacion');
};