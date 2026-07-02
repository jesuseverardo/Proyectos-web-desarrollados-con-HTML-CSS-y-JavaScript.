const boton = document.getElementById("btnSimular");

boton.addEventListener("click", function () {
    simularTiradas();
});

function simularTiradas() {
    const cantidadEntrada = document.getElementById("cantidad").value;
    const cantidad = Number(cantidadEntrada);

    if (isNaN(cantidad) || cantidad <= 0 || !Number.isInteger(cantidad)) {
        alert("La cantidad de tiradas debe ser un valor numérico entero mayor que cero.");
        return;
    }

    const tiradas = [];

    for (let i = 0; i < cantidad; i++) {
        let dado = Math.floor(Math.random() * 6) + 1;
        tiradas.push(dado);
    }

    const frecIf = calcularFrecIf(tiradas);
    const frecSwitch = calcularFrecSwitch(tiradas);
    const frecFor = calcularFrecFor(tiradas);

    console.clear();
    console.log("Cantidad de tiradas:", cantidad);
    console.log("Arreglo tiradas:", tiradas);
    console.log("Frecuencias utilizando if anidados y ciclo for:", frecIf);
    console.log("Frecuencias utilizando switch y ciclo for:", frecSwitch);
    console.log("Frecuencias utilizando sólo ciclo for:", frecFor);

    mostrarResultado(cantidad, frecIf, frecSwitch, frecFor);
}

function calcularFrecIf(tiradas) {
    let frec = [0, 0, 0, 0, 0, 0];

    for (let i = 0; i < tiradas.length; i++) {
        if (tiradas[i] === 1) {
            frec[0]++;
        } else {
            if (tiradas[i] === 2) {
                frec[1]++;
            } else {
                if (tiradas[i] === 3) {
                    frec[2]++;
                } else {
                    if (tiradas[i] === 4) {
                        frec[3]++;
                    } else {
                        if (tiradas[i] === 5) {
                            frec[4]++;
                        } else {
                            if (tiradas[i] === 6) {
                                frec[5]++;
                            }
                        }
                    }
                }
            }
        }
    }

    return frec;
}

function calcularFrecSwitch(tiradas) {
    let frec = [0, 0, 0, 0, 0, 0];

    for (let i = 0; i < tiradas.length; i++) {
        switch (tiradas[i]) {
            case 1:
                frec[0]++;
                break;

            case 2:
                frec[1]++;
                break;

            case 3:
                frec[2]++;
                break;

            case 4:
                frec[3]++;
                break;

            case 5:
                frec[4]++;
                break;

            case 6:
                frec[5]++;
                break;
        }
    }

    return frec;
}

function calcularFrecFor(tiradas) {
    let frec = [0, 0, 0, 0, 0, 0];

    for (let i = 0; i < tiradas.length; i++) {
        frec[tiradas[i] - 1]++;
    }

    return frec;
}

function mostrarResultado(cantidad, frecIf, frecSwitch, frecFor) {
    const resultado = document.getElementById("resultado");

    resultado.innerHTML =
        "<strong>Cantidad de tiradas realizadas:</strong> " + cantidad + "<br><br>" +

        "<strong>Frecuencias utilizando if anidados y ciclo for:</strong><br>" +
        formatoFrec(frecIf) + "<br>" +

        "<strong>Frecuencias utilizando switch y ciclo for:</strong><br>" +
        formatoFrec(frecSwitch) + "<br>" +

        "<strong>Frecuencias utilizando sólo ciclo for:</strong><br>" +
        formatoFrec(frecFor) + "<br>" +

        "<em>Los arreglos completos se muestran en console.log.</em>";
}

function formatoFrec(frec) {
    let texto = "";

    for (let i = 0; i < frec.length; i++) {
        texto += "Cara " + (i + 1) + ": " + frec[i] + " veces<br>";
    }

    return texto;
}
