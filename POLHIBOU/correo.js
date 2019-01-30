var nodemailer = require('nodemailer');
var Usuario = require("./models/usuario").Usuario;
var administrador = {
    correo: "",
    contrasenia: ""
};

var transporter;

var mailOptions = {
    from: administrador.correo,
    to: '',
    subject: '',
    html: ''
};

function inicio() {
    console.log("Ya consulte555");
    console.log(administrador);
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: administrador.correo,
            pass: administrador.contrasenia
        }
    });
}

setTimeout(function () {
    console.log("Ya consulte");
    console.log(administrador);
    inicio();
}, 3000);
Usuario.findOne({usuario: "polhibou@gmail.com"}, function (error, doc) {
    if (error) {
        console.log("Error: " + error);
    }
    else {
        console.log("doc");
        console.log(doc);
        while (administrador.correo == '') {
            administrador.correo = doc.usuario;
            administrador.contrasenia = doc.contrasenia
        }
    }
});
exports.inicio = function () {
    console.log("llenar datos");
};
exports.enviarCorreo = function (mail, codigo) {
    mailOptions.to = mail;
    mailOptions.from = administrador.correo;
    mailOptions.subject = 'Creación de cuenta';
    mailOptions.html = '<h1>Estimado usuario</h1><p>Para continuar con el proceso de creación de cuenta, por favor ingrese el siguiente código de verificación en Polhibou </p><br><p></br>Su código de verificación es: </p><strong>'+codigo+'</strong>';
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
exports.enviarCorreoOlvideContrasenia = function (mail, codigo) {
    mailOptions.to = mail;
    mailOptions.from = administrador.correo;
    mailOptions.subject = 'Cambio de contraseña';
    mailOptions.html = '<h1>Estimado usuario</h1><p>Parece que desea cambiar su contraseña. Por favor utilice la siguiente contraseña temporal para iniciar sesión</p><br><p>Su contraseña temporal es: </p><strong>'+codigo+'</strong>';
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};



