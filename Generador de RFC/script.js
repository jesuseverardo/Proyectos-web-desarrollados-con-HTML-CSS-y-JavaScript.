const formulario = document.getElementById("formRFC");

const diccionarioRFC = {
    vocales: ["A", "E", "I", "O", "U"],

    nombresIgnorados: ["MARIA", "MA", "JOSE", "J"],

    palabrasIgnoradas: [
        "DA", "DAS", "DE", "DEL", "DI", "DD",
        "EL", "LA", "LOS", "LAS", "LE", "LES",
        "MAC", "MC", "VAN", "VON", "Y"
    ],

    caracteresEspeciales: ["/", ".", ",", "-", "_", "'", "’"],

    letrasEspeciales: {
        "Ñ": "X"
    }
};

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nombreOriginal = document.getElementById("nombre").value.trim();
    const apellidoPaternoOriginal = document.getElementById("apellidoPaterno").value.trim();
    const apellidoMaternoOriginal = document.getElementById("apellidoMaterno").value.trim();
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;

    if (
        nombreOriginal === "" ||
        apellidoPaternoOriginal === "" ||
        apellidoMaternoOriginal === "" ||
        fechaNacimiento === ""
    ) {
        alert("Por favor, llena todos los campos.");
    } else {
        const rfc = obtenerRFC(
            nombreOriginal,
            apellidoPaternoOriginal,
            apellidoMaternoOriginal,
            fechaNacimiento
        );

        agregarDatosTabla(
            nombreOriginal.toUpperCase(),
            apellidoPaternoOriginal.toUpperCase(),
            apellidoMaternoOriginal.toUpperCase(),
            fechaNacimiento,
            rfc
        );

        formulario.reset();
    }
});

function obtenerRFC(nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento) {
    const nombreLimpio = obtenerNombreValido(nombre);
    const paternoLimpio = obtenerApellidoValido(apellidoPaterno);
    const maternoLimpio = obtenerApellidoValido(apellidoMaterno);

    const letraPaterno = obtenerCaracterRFC(paternoLimpio, "primeraLetra");
    const vocalPaterno = obtenerCaracterRFC(paternoLimpio, "primeraVocalInterna");
    const letraMaterno = obtenerCaracterRFC(maternoLimpio, "primeraLetra");
    const letraNombre = obtenerCaracterRFC(nombreLimpio, "primeraLetra");

    const fechaRFC = obtenerFechaRFC(fechaNacimiento);

    const rfc = letraPaterno +
                vocalPaterno +
                letraMaterno +
                letraNombre +
                fechaRFC;

    return rfc;
}

function obtenerCaracterRFC(texto, tipoCaracter) {
    let caracter = "X";

    switch (tipoCaracter) {
        case "primeraLetra":
            caracter = obtenerPrimeraLetra(texto);
            break;

        case "primeraVocalInterna":
            caracter = obtenerPrimeraVocalInterna(texto);
            break;

        default:
            caracter = "X";
            break;
    }

    return caracter;
}

function obtenerApellidoValido(apellido) {
    let apellidoNormalizado = normalizarTexto(apellido);
    let palabras = apellidoNormalizado.split(" ").filter(palabra => palabra !== "");

    if (palabras.length === 0) {
        return "X";
    } else {
        while (
            palabras.length > 1 &&
            diccionarioRFC.palabrasIgnoradas.includes(palabras[0])
        ) {
            palabras.shift();
        }

        return palabras[0];
    }
}

function obtenerNombreValido(nombre) {
    let nombreNormalizado = normalizarTexto(nombre);
    let palabras = nombreNormalizado.split(" ").filter(palabra => palabra !== "");

    if (palabras.length === 0) {
        return "X";
    } else if (
        palabras.length > 1 &&
        diccionarioRFC.nombresIgnorados.includes(palabras[0])
    ) {
        palabras.shift();
        return palabras[0];
    } else {
        return palabras[0];
    }
}

function normalizarTexto(texto) {
    let textoNormalizado = texto
        .toUpperCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    for (let i = 0; i < diccionarioRFC.caracteresEspeciales.length; i++) {
        textoNormalizado = textoNormalizado.replaceAll(
            diccionarioRFC.caracteresEspeciales[i],
            " "
        );
    }

    textoNormalizado = textoNormalizado
        .replace(/[^A-ZÑ\s]/g, "")
        .replace(/\s+/g, " ");

    return textoNormalizado;
}

function obtenerPrimeraLetra(texto) {
    let primeraLetra = "X";

    if (texto === "" || texto.length === 0) {
        primeraLetra = "X";
    } else if (diccionarioRFC.letrasEspeciales[texto.charAt(0)]) {
        primeraLetra = diccionarioRFC.letrasEspeciales[texto.charAt(0)];
    } else {
        primeraLetra = texto.charAt(0);
    }

    return primeraLetra;
}

function obtenerPrimeraVocalInterna(texto) {
    let vocalEncontrada = "X";

    if (texto === "" || texto.length <= 1) {
        vocalEncontrada = "X";
    } else {
        for (let i = 1; i < texto.length; i++) {
            if (diccionarioRFC.vocales.includes(texto.charAt(i))) {
                vocalEncontrada = texto.charAt(i);
                break;
            } else {
                vocalEncontrada = "X";
            }
        }
    }

    return vocalEncontrada;
}

function obtenerFechaRFC(fechaNacimiento) {
    const partesFecha = fechaNacimiento.split("-");

    let fechaRFC = "";

    if (partesFecha.length === 3) {
        const anio = partesFecha[0].slice(2, 4);
        const mes = partesFecha[1];
        const dia = partesFecha[2];

        fechaRFC = anio + mes + dia;
    } else {
        fechaRFC = "000000";
    }

    return fechaRFC;
}

function agregarDatosTabla(nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, rfc) {
    const cuerpoTabla = document.querySelector("#tablaDatos tbody");

    const nuevaFila = cuerpoTabla.insertRow();

    const celdaNombre = nuevaFila.insertCell(0);
    const celdaApellidoPaterno = nuevaFila.insertCell(1);
    const celdaApellidoMaterno = nuevaFila.insertCell(2);
    const celdaFechaNacimiento = nuevaFila.insertCell(3);
    const celdaRFC = nuevaFila.insertCell(4);

    celdaNombre.textContent = nombre;
    celdaApellidoPaterno.textContent = apellidoPaterno;
    celdaApellidoMaterno.textContent = apellidoMaterno;
    celdaFechaNacimiento.textContent = fechaNacimiento;
    celdaRFC.textContent = rfc;
}
