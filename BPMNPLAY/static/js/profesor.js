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

