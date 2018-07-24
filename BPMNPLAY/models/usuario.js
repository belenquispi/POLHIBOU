var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Conexion al servidor
mongoose.connect('mongodb://localhost:27017/polibou', { useNewUrlParser: true });

// Creacion del esquema
var usuarioSchema = new Schema({
    usuario: String,
    nombre: String,
    contrasenia: String,
    rol : String
})

//Creacion del modelo

var Usuario = mongoose.model("Usuario", usuarioSchema);

module.exports.Usuario = Usuario;