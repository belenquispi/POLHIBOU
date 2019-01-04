function cambiarIcono()
{
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

function eliminarMateria(materia)
{
   let r = confirm("Si elimina la materia, se borrarán todas las preguntas y estadísticas. ¿Está seguro?");
    if (r == true) {
        document.getElementById("botonEliminar"+materia).click();
    }
}

function verificarMateria() {
    let numeroMaterias = document.getElementById("numeroMaterias").value;
    for(let i = 0; i < numeroMaterias; i++)
    {
        let idTematica = "materia"+i;
        console.log("El nombre de temáticas es: "+(document.getElementById("nombreNuevaMateria").value).trim().toUpperCase());

        if(((document.getElementById(idTematica).value).trim()).toUpperCase() == (document.getElementById("nombreNuevaMateria").value).trim().toUpperCase())
        {
            alert("El nombre de la temática ingresado ya existe");
            document.getElementById("nombreNuevaMateria").value = "";
        }
    }
}

