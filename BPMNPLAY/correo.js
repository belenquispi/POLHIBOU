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
    mailOptions.subject = 'Verificación de cuenta';
    mailOptions.html = '<h1>Estimado usuario</h1><p>Su código de verificación es: </p><strong>'+codigo+'</strong>';
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


