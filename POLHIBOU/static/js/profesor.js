function cambiarIcono() {
    if(document.getElementById("tipo").value == "privada")
    {
        document.getElementById("iconoTipo").classList.remove("fa-unlock");
        document.getElementById("iconoTipo").classList.add("fa-lock")
    }
    else
    {
        document.getElementById("iconoTipo").classList.remove("fa-lock");
        document.getElementById("iconoTipo").classList.add("fa-unlock");

    }
}

function eliminarMateria(materia) {
   let r = confirm("Si elimina la temática, se borrarán todas las preguntas, imágenes y estadísticas. ¿Está seguro?");
    if (r == true) {
        document.getElementById("botonEliminar"+materia).click();
    }
}

function verificarMateria() {
    let numeroMaterias = document.getElementById("numeroMaterias").value;
    for(let i = 0; i < numeroMaterias; i++)
    {
        let idTematica = "materia"+i;
        if(((document.getElementById(idTematica).value).trim()).toUpperCase() == (document.getElementById("nombreNuevaMateria").value).trim().toUpperCase())
        {
            alert("El nombre de la temática ingresado ya existe");
            document.getElementById("nombreNuevaMateria").value = "";
        }
    }
}

function verificarIngreso(valor) {
    if (document.getElementById(valor.id).value.trim().length < 1) {
        alert("El nombre de la temática está en blanco");
        document.getElementById(valor.id).value = "";
    }
}

function verificarTamanio(valor) {
    if (document.getElementById(valor.id).value.trim().length < 3) {
        alert("El nombre de la temática debe tener al menos 3 caracteres");
        document.getElementById(valor.id).value = "";
    }
}


