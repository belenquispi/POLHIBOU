var botonImagenUnir1 = document.getElementById("botonImagenUnir1")
botonImagenUnir1.addEventListener('change', function (e) {
       // file = e.target.files[0];
       // imagenes.push("file");
    imagenesUnirVoltear.push(e.target.files[0]);
    }
)
var botonImagenUnir2 = document.getElementById("botonImagenUnir2")
botonImagenUnir2.addEventListener('change', function (e) {
//        file = e.target.files[0];
  //      imagenes.push("file");
        imagenesUnirVoltear.push(e.target.files[0]);

    }
)
var botonImagenUnir3 = document.getElementById("botonImagenUnir3")
botonImagenUnir3.addEventListener('change', function (e) {
    //    file = e.target.files[0];
      //  imagenes.push("file");
        imagenesUnirVoltear.push(e.target.files[0]);

    }
)
var botonImagenUnir4 = document.getElementById("botonImagenUnir4")
botonImagenUnir4.addEventListener('change', function (e) {
//        file = e.target.files[0];
   //     imagenes.push("file");
        imagenesUnirVoltear.push(e.target.files[0]);

    }
)

var loadFile = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};


