 var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Conexion al servidor
mongoose.connect('mongodb://localhost:27017/polibou', { useNewUrlParser: true });

var rol = ["facilitador", "participante","administrador"];
var validacion_contrasenia = {
    validator: function (p) {
        return this.contrasenia_confirmada == p;
    },
    message: "Las contraseñas no son iguales"
}

// Creacion del esquema
var usuarioSchema = new Schema({
    usuario: {type : String, required : true},
    nombre: {type :String, required : true},
    contrasenia: { type :String},
    codigoVerificacion: {type : String},
    fechaUltimaConexion : {type : Date},
    rol : {type :String, enum: {values: rol, message:"Opción no válida"},required : true}
});

usuarioSchema.virtual("confirmacion_contrasenia").get(function () {
    return this.contrasenia_confirmada;
}).set(function (contrasenia) {
    this.contrasenia_confirmada = contrasenia;
})

//Creacion del modelo

var Usuario = mongoose.model("Usuario", usuarioSchema);

module.exports.Usuario = Usuario;