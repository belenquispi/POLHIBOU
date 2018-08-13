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

function cambiarTipo(materia)
{
    if(document.getElementById("tipo"+materia).classList.contains("un"))
    {
        document.getElementById("tipo"+materia).classList.remove("fa-unlock");
        document.getElementById("tipo"+materia).classList.add("fa-lock");
    }
    else
    {
        document.getElementById("tipo"+materia).classList.remove("fa-lock");
        document.getElementById("tipo"+materia).classList.add("fa-unlock");
    }
}



