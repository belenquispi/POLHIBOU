var respuestaUnir = [];
var respuestaUnirId = [];
var imagenUnirId = ['botonImagenAUnir1','botonImagenAUnir2','botonImagenAUnir3','botonImagenAUnir4','botonImagenAUnir5'];
var textoUnirId = ['textoAUnir1','textoAUnir2','textoAUnir3','textoAUnir4','textoAUnir5'];
var imagenUnir = [];
var textoUnir = [];
for(var i=1; i<6;i++)
{
    imagenUnir.push(document.getElementById("botonImagenAUnir"+i).value);
    textoUnir.push(document.getElementById("textoAUnir"+i).value);
}
function obtenerId(e) {
    var id = e.id;
    console.log("El id seleccionado es: "+id );
    switch (true){

        case respuestaUnirId.length < 2:
            document.getElementById(id).style.border = "thick solid green";
            break;
        case respuestaUnirId.length < 4:
            document.getElementById(id).style.border = "thick solid red";
            break;
        case respuestaUnirId.length < 6:
            document.getElementById(id).style.border = "thick solid black";
            break;
        case respuestaUnirId.length < 8:
            document.getElementById(id).style.border = "thick solid yellow";
            break;
        case respuestaUnirId.length < 10:
            document.getElementById(id).style.border = "thick solid blue";
            break;
    }
    respuestaUnir.push(document.getElementById(id).value);
    respuestaUnirId.push(id);

    if(imagenUnirId.indexOf(id) >= 0) {
        console.log("El indice mayor es "+imagenUnirId.indexOf(id) );
        for(let k = 0; k<imagenUnirId.length; k++){
            document.getElementById(imagenUnirId[k]).setAttribute("disabled","");
            console.log("Insertando disables en la imagen "+imagenUnirId[k]);
        }
        for(let j = 0 ; j < textoUnirId.length; j++){
            for(let a = 0; a < respuestaUnir.length; a++){
                if(respuestaUnir[a]==textoUnirId[j]){
                    document.getElementById(textoUnirId[j]).setAttribute("disabled","");
                    console.log("Insertando disables en el texto "+textoUnirId[j]);
                }else {
                    document.getElementById(textoUnirId[j]).removeAttribute("disabled");
                    console.log("Removiendo disables en el texto"+textoUnirId[j]);
                }
            }
            /* if(respuestaUnir.indexOf(textoUnirId[j])>=0)
             {
                 document.getElementById(textoUnirId[j]).setAttribute("disabled","");
                 console.log("Insertando disables en el texto "+textoUnirId[j]);
             }else {
                 document.getElementById(textoUnirId[j]).removeAttribute("disabled");
                 console.log("Removiendo disables en el texto"+textoUnirId[j]);

             }*/
        }
    } else if (textoUnirId.indexOf(id) >=0){
        console.log("El indice texto mayor es "+textoUnirId.indexOf(id) );
        for(let l = 0; l<textoUnirId.length; l++) {
            document.getElementById(textoUnirId[l]).setAttribute("disabled", "");
            console.log("Insertando disables en el texto "+textoUnirId[l]);
        }
        for(let m = 0 ; m < imagenUnirId.length; m++){
            console.log("El indice "+respuestaUnirId.indexOf(imagenUnir[m]));
            console.log(respuestaUnirId);
            for(let b = 0; b < respuestaUnir.length; b++){
                if(respuestaUnir[b]==textoUnirId[m]){
                    document.getElementById(imagenUnirId[m]).setAttribute("disabled","");
                    console.log("Insertando disables en la imagen "+imagenUnirId[m]);
                }else {
                    document.getElementById(imagenUnirId[m]).removeAttribute("disabled");
                    console.log("Eliminando disables en la imagen "+imagenUnirId[m]);
                }
            }
            /*  if(respuestaUnirId.indexOf(imagenUnir[m])>=0){
                  document.getElementById(imagenUnirId[m]).setAttribute("disabled","");
                  console.log("Insertando disables en la imagen "+imagenUnirId[m]);
              }else {
                  document.getElementById(imagenUnirId[m]).removeAttribute("disabled");
                  console.log("Eliminando disables en la imagen "+imagenUnirId[m]);

              }*/
        }
    }
}

function verificarCompletoUnir() {
    if(respuestaUnir.length != 10) {
        document.getElementById("enviarUnir").setAttribute("disabled","");
    }
    else {
        document.getElementById("enviarUnir").removeAttribute("disabled");
        document.getElementById("respuestas").value = respuestaUnir;
    }
}

function reiniciarUnir() {
    for (let n =0; n < respuestaUnirId.length; n++){
        document.getElementById(respuestaUnirId[n]).style.border = "";
        if(imagenUnirId.indexOf(respuestaUnirId[n])>=0) {
            document.getElementById(respuestaUnirId[n]).removeAttribute("disabled");
        }
    }

    for(let o = respuestaUnirId.length; o > 0 ; o--) {
        respuestaUnir.pop();
        respuestaUnirId.pop();
    }
}