var mostrarVistaPreviaImagen = function (event, imagen) {
    var output = document.getElementById(imagen);
    output.src = URL.createObjectURL(event.target.files[0]);
};

function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    var id = element.id.substr(15,2)
    console.log("id: "+id);
    reader.onloadend = function () {
        console.log('RESULT', reader.result)
        document.getElementById("imagenUnir"+id).value = reader.result;
    };
    reader.readAsDataURL(file);
}

function generarDatosPregunta (numero) {
    var id = numero.id;
    var valor = document.getElementById(id).value;
    console.log(id);
    document.getElementById("numeroPreguntas").value = valor;
     document.getElementById("divPreguntas").innerHTML = ""

    for (var i = 0; i < valor; i++) {
        var divTexto = document.createElement("DIV");
        divTexto.setAttribute("class", "form-group col-md-4 mb-3");
        divTexto.setAttribute("id", "form-group" + (i + 1));
        document.getElementById("divPreguntas").appendChild(divTexto);

        var labelTexto = document.createElement("LABEL");
        labelTexto.setAttribute("for", "textoUnir" + (i + 1));
        labelTexto.setAttribute("id","labelTexto"+(i+1))
        document.getElementById("form-group" + (i + 1)).appendChild(labelTexto);
        document.getElementById('labelTexto' + (i + 1)).innerHTML = "Texto " + (i + 1);

        var inputTexto = document.createElement("INPUT");
        inputTexto.setAttribute("type", "text");
        inputTexto.setAttribute("class", "form-control");
        inputTexto.setAttribute("id", "textoUnir" + (i + 1));
        inputTexto.setAttribute("placeholder", "Ingrese el nombre de la imagen " + (i + 1));
        inputTexto.setAttribute("required", "");
        inputTexto.setAttribute("name", "textoUnir" + (i + 1));
        document.getElementById("form-group" + (i + 1)).appendChild(inputTexto);


        var  divImagen= document.createElement("DIV");
        divImagen.setAttribute("class", "form-group col-md-4 mb-3");
        divImagen.setAttribute("id", "form-group-img-" + (i + 1));
        document.getElementById("divPreguntas").appendChild(divImagen);

        var labelImagen = document.createElement("LABEL");
        labelImagen.setAttribute("for", "botonImagenUnir" + (i + 1));
        labelImagen.setAttribute("id","labelImagen"+(i+1))
        document.getElementById("form-group-img-" + (i + 1)).appendChild(labelImagen);
        document.getElementById('labelImagen' + (i + 1)).innerHTML = "Imagen " + (i + 1);

        var inputImagen = document.createElement("INPUT");
        inputImagen.setAttribute("type", "file");
        inputImagen.setAttribute("class", "form-control");
        inputImagen.setAttribute("id", "botonImagenUnir" + (i + 1));
        inputImagen.setAttribute("value", "uploadImagenUnir" + (i + 1));
        inputImagen.setAttribute("required", "");
        inputImagen.setAttribute("accept", ".png, .jpg, .jpeg");
        inputImagen.setAttribute("onchange", "mostrarVistaPreviaImagen(event, \'imagen"+ (i + 1)+"\'), encodeImageFileAsURL(this)") ;
        document.getElementById("form-group-img-" + (i + 1)).appendChild(inputImagen);

        var inputImagen2 = document.createElement("INPUT");
        inputImagen2.setAttribute("type", "text");
        inputImagen2.setAttribute("id", "imagenUnir" + (i + 1));
        inputImagen2.setAttribute("name", "imagen" + (i + 1));
        inputImagen2.setAttribute("hidden", "");
        document.getElementById("form-group-img-" + (i + 1)).appendChild(inputImagen2);

        var  divImagen2 = document.createElement("DIV");
        divImagen2.setAttribute("class", "form-group col-md-1 mb-3");
        divImagen2.setAttribute("id", "form-group-img2-" + (i + 1));
        document.getElementById("divPreguntas").appendChild(divImagen2);

        var br = document.createElement("BR");
        document.getElementById("form-group-img2-"+ (i + 1)).appendChild(br);

        var imagen = document.createElement("IMG");
        imagen.setAttribute("id", "imagen" + (i + 1));
        imagen.setAttribute("width", "50" );
        imagen.setAttribute("height", "50");
        document.getElementById("form-group-img2-"+ (i + 1)).appendChild(imagen);

        var divDificultad = document.createElement("DIV");
        divDificultad.setAttribute("class", "form-group col-md-3 mb-3");
        divDificultad.setAttribute("id", "form-group-dif-" + (i + 1));
        document.getElementById("divPreguntas").appendChild(divDificultad);

        var labelDificultad = document.createElement("LABEL");
        labelDificultad.setAttribute("for", "dificultad" + (i + 1));
        labelDificultad.setAttribute("id","labelDificultad"+(i+1));
        document.getElementById("form-group-dif-" + (i + 1)).appendChild(labelDificultad);
        document.getElementById('labelDificultad' + (i + 1)).innerHTML = "Dificultad "+ (i + 1);

        var selectDificultad = document.createElement("SELECT");
        selectDificultad.setAttribute("id", "dificultad"+ (i + 1));
        selectDificultad.setAttribute("name", "dificultad"+ (i + 1));
        selectDificultad.setAttribute("class", "form-control");
        document.getElementById("form-group-dif-" + (i + 1)).appendChild(selectDificultad);

        var facil = document.createElement("option");
        facil.setAttribute("value", "Fácil");
        var t = document.createTextNode("Fácil");
        facil.appendChild(t);
        document.getElementById("dificultad"+ (i + 1)).appendChild(facil);

        var medio = document.createElement("option");
        medio.setAttribute("value", "Medio");
        var u = document.createTextNode("Medio");
        medio.appendChild(u);
        document.getElementById("dificultad"+ (i + 1)).appendChild(medio);

        var dificil = document.createElement("option");
        dificil.setAttribute("value", "Difícil");
        var v = document.createTextNode("Difícil");
        dificil.appendChild(v);
        document.getElementById("dificultad"+ (i + 1)).appendChild(dificil);


    }
    document.getElementById("botonGuardarUnirVoltear").removeAttribute("hidden");

}

function eliminarAnteriores(num, x) {
    switch (x){
        case 1:
            document.getElementById("form-group" + (num)).parentNode.removeChild(document.getElementById("form-group" + (num)));

        case 2:
            document.getElementById("form-group-img-" + (num)).parentNode.removeChild(document.getElementById("form-group-img-" + (num)));

        case 3:
            document.getElementById("form-group-img2-" + (num)).parentNode.removeChild(document.getElementById("form-group-img2-" + (num)));

    }
}