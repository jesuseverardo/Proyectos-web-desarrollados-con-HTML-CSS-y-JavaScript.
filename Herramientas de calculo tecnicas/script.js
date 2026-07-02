/*
 * script.js
 *
 * Este archivo contiene la lógica para cada una de las calculadoras disponibles
 * en la página web: resistencias, VLSM, Bode y LGR. También se maneja un
 * historial de operaciones guardado en localStorage.
 */

// ==== SECCIÓN: Calculadora de Resistencias ====

// Mapas de colores a valores numéricos para las bandas de resistores
const DIGIT_COLORS = [
  "Negro", "Marrón", "Rojo", "Naranja", "Amarillo",
  "Verde", "Azul", "Violeta", "Gris", "Blanco"
];
const DIGIT_MAP = {
  "Negro": 0,
  "Marrón": 1,
  "Rojo": 2,
  "Naranja": 3,
  "Amarillo": 4,
  "Verde": 5,
  "Azul": 6,
  "Violeta": 7,
  "Gris": 8,
  "Blanco": 9
};
const MULTIPLIER_MAP = {
  "Negro": 1,
  "Marrón": 10,
  "Rojo": 100,
  "Naranja": 1_000,
  "Amarillo": 10_000,
  "Verde": 100_000,
  "Azul": 1_000_000,
  "Violeta": 10_000_000,
  "Gris": 100_000_000,
  "Blanco": 1_000_000_000,
  "Dorado": 0.1,
  "Plateado": 0.01
};
const MULTIPLIER_COLORS = Object.keys(MULTIPLIER_MAP);
const TOLERANCE_MAP = {
  "Marrón": 0.01,
  "Rojo": 0.02,
  "Verde": 0.005,
  "Azul": 0.0025,
  "Violeta": 0.001,
  "Gris": 0.0005,
  "Dorado": 0.05,
  "Plateado": 0.10
};
const TOLERANCE_COLORS = Object.keys(TOLERANCE_MAP);
const PPM_MAP = {
  "Marrón": 100,
  "Rojo": 50,
  "Naranja": 15,
  "Amarillo": 25,
  "Verde": 20,
  "Azul": 10,
  "Violeta": 5,
  "Gris": 1
};
const PPM_COLORS = Object.keys(PPM_MAP);

// Construye el selector de bandas según el número de bandas seleccionado
function buildBandInputs() {
  const container = document.getElementById("bandsContainer");
  container.innerHTML = "";
  const nbands = parseInt(document.getElementById("numBands").value, 10);
  const numDigits = nbands === 4 ? 2 : 3;

  for (let i = 0; i < numDigits; i++) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-group");

    const label = document.createElement("label");
    label.textContent = `${i + 1}.ª banda de color:`;

    const select = document.createElement("select");
    select.classList.add("band-select");

    DIGIT_COLORS.forEach(color => {
      const opt = document.createElement("option");
      opt.value = color;
      opt.textContent = color;
      select.appendChild(opt);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    container.appendChild(wrapper);
  }

  const multiplierWrapper = document.createElement("div");
  multiplierWrapper.classList.add("form-group");
  const multiplierLabel = document.createElement("label");
  multiplierLabel.textContent = "Multiplicador:";
  const multiplierSelect = document.createElement("select");
  multiplierSelect.id = "multiplierSelect";

  MULTIPLIER_COLORS.forEach(color => {
    const opt = document.createElement("option");
    opt.value = color;
    opt.textContent = color;
    multiplierSelect.appendChild(opt);
  });

  multiplierWrapper.appendChild(multiplierLabel);
  multiplierWrapper.appendChild(multiplierSelect);
  container.appendChild(multiplierWrapper);

  const toleranceWrapper = document.createElement("div");
  toleranceWrapper.classList.add("form-group");
  const toleranceLabel = document.createElement("label");
  toleranceLabel.textContent = "Tolerancia:";
  const toleranceSelect = document.createElement("select");
  toleranceSelect.id = "toleranceSelect";

  TOLERANCE_COLORS.forEach(color => {
    const opt = document.createElement("option");
    opt.value = color;
    opt.textContent = color;
    toleranceSelect.appendChild(opt);
  });

  toleranceWrapper.appendChild(toleranceLabel);
  toleranceWrapper.appendChild(toleranceSelect);
  container.appendChild(toleranceWrapper);

  if (nbands === 6) {
    const ppmWrapper = document.createElement("div");
    ppmWrapper.classList.add("form-group");
    const ppmLabel = document.createElement("label");
    ppmLabel.textContent = "ppm:";
    const ppmSelect = document.createElement("select");
    ppmSelect.id = "ppmSelect";

    PPM_COLORS.forEach(color => {
      const opt = document.createElement("option");
      opt.value = color;
      opt.textContent = color;
      ppmSelect.appendChild(opt);
    });

    ppmWrapper.appendChild(ppmLabel);
    ppmWrapper.appendChild(ppmSelect);
    container.appendChild(ppmWrapper);
  }

  document.getElementById("resResult").textContent = "";
}

// Formatea el valor de resistencia usando prefijos
function formatResistorValue(value) {
  const unidades = [
    { sufijo: "GΩ", factor: 1e9 },
    { sufijo: "MΩ", factor: 1e6 },
    { sufijo: "kΩ", factor: 1e3 },
    { sufijo: "Ω", factor: 1 },
    { sufijo: "mΩ", factor: 1e-3 },
    { sufijo: "µΩ", factor: 1e-6 },
    { sufijo: "nΩ", factor: 1e-9 },
    { sufijo: "pΩ", factor: 1e-12 }
  ];

  const absVal = Math.abs(value);

  for (const u of unidades) {
    if (absVal >= u.factor) {
      return `${(value / u.factor).toFixed(4)} ${u.sufijo}`;
    }
  }

  return `${value.toFixed(4)} Ω`;
}

// Calcula el valor de resistencia
function calculateResistor() {
  const bandSelects = document.querySelectorAll("#bandsContainer .band-select");
  const digits = [];

  bandSelects.forEach(select => {
    digits.push(DIGIT_MAP[select.value]);
  });

  let nominalNumber = 0;
  digits.forEach(digit => {
    nominalNumber = nominalNumber * 10 + digit;
  });

  const multiplierColor = document.getElementById("multiplierSelect").value;
  const multiplier = MULTIPLIER_MAP[multiplierColor];
  const toleranceColor = document.getElementById("toleranceSelect").value;
  const tolerance = TOLERANCE_MAP[toleranceColor];

  let ppmValue = null;
  const ppmSelect = document.getElementById("ppmSelect");

  if (ppmSelect) {
    ppmValue = PPM_MAP[ppmSelect.value];
  }

  const resistanceValue = nominalNumber * multiplier;
  const formatted = formatResistorValue(resistanceValue);

  let resultStr = `Valor nominal: ${formatted}`;
  resultStr += `\nTolerancia: ±${(tolerance * 100).toFixed(2)}%`;

  if (ppmValue !== null) {
    resultStr += `\nppm: ${ppmValue} ppm`;
  }

  document.getElementById("resResult").textContent = resultStr;

  addToHistory({
    tipo: "Resistencias",
    entrada: {
      bandas: Array.from(bandSelects).map(s => s.value),
      multiplicador: multiplierColor,
      tolerancia: toleranceColor,
      ppm: ppmSelect ? ppmSelect.value : undefined
    },
    resultado: resultStr
  });
}

function clearResistor() {
  buildBandInputs();
}

// ==== SECCIÓN: VLSM ====

function ipToInt(ipStr) {
  const parts = ipStr.trim().split(".");

  if (parts.length !== 4) {
    return null;
  }

  let num = 0;

  for (const part of parts) {
    const val = parseInt(part, 10);

    if (isNaN(val) || val < 0 || val > 255) {
      return null;
    }

    num = (num << 8) | val;
  }

  return num >>> 0;
}

function intToIp(num) {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff
  ].join(".");
}

function calculateVLSM() {
  const baseIpStr = document.getElementById("baseIp").value;
  const basePrefix = parseInt(document.getElementById("basePrefix").value, 10);
  const hostsInput = document.getElementById("hostsList").value;
  const baseIpInt = ipToInt(baseIpStr);

  if (baseIpInt === null || isNaN(basePrefix) || basePrefix < 0 || basePrefix > 30) {
    document.getElementById("vlsmResult").textContent = "Datos de IP base o prefijo inválidos.";
    return;
  }

  const hostsList = hostsInput
    .split(/[,;]+/)
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0);

  if (hostsList.length === 0) {
    document.getElementById("vlsmResult").textContent = "Especifica al menos un número de hosts.";
    return;
  }

  hostsList.sort((a, b) => b - a);

  const networkSize = Math.pow(2, 32 - basePrefix);
  let currentIp = baseIpInt;
  const endIp = baseIpInt + networkSize;
  const results = [];

  for (let i = 0; i < hostsList.length; i++) {
    const hosts = hostsList[i];
    const bitsNeeded = Math.ceil(Math.log2(hosts + 2));
    const prefix = 32 - bitsNeeded;
    const subnetSize = Math.pow(2, 32 - prefix);
    const subnetStart = currentIp;
    const subnetEnd = currentIp + subnetSize;

    if (subnetEnd > endIp) {
      document.getElementById("vlsmResult").textContent = "Rango insuficiente para todas las subredes.";
      return;
    }

    const networkIp = intToIp(subnetStart);
    const mask = intToIp((0xffffffff << (32 - prefix)) >>> 0);
    const firstHost = subnetStart + 1;
    const lastHost = subnetStart + subnetSize - 2;
    const broadcast = subnetStart + subnetSize - 1;

    results.push({
      index: i + 1,
      network: networkIp,
      prefix: `/${prefix}`,
      mask: mask,
      firstHost: intToIp(firstHost),
      lastHost: intToIp(lastHost),
      broadcast: intToIp(broadcast),
      hosts: hosts
    });

    currentIp = subnetEnd;
  }

  const table = document.createElement("table");
  table.classList.add("result-table");

  const header = document.createElement("tr");
  [
    "Subred",
    "IP de red",
    "Prefijo",
    "Máscara",
    "Primer Host",
    "Último Host",
    "Broadcast",
    "Nº de Hosts"
  ].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    header.appendChild(th);
  });

  table.appendChild(header);

  results.forEach(res => {
    const row = document.createElement("tr");

    [
      res.index,
      res.network,
      res.prefix,
      res.mask,
      res.firstHost,
      res.lastHost,
      res.broadcast,
      res.hosts
    ].forEach(val => {
      const td = document.createElement("td");
      td.textContent = val;
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  const resultDiv = document.getElementById("vlsmResult");
  resultDiv.innerHTML = "";
  resultDiv.appendChild(table);

  addToHistory({
    tipo: "VLSM",
    entrada: {
      baseIp: baseIpStr,
      basePrefix: basePrefix,
      hostsList: hostsList
    },
    resultado: results
  });
}

// ==== SECCIÓN: Bode ====

let bodeMagChart = null;
let bodePhaseChart = null;

function calculateBode() {
  const exprStr = document.getElementById("bodeExpr").value.trim();
  const fMin = parseFloat(document.getElementById("freqMin").value);
  const fMax = parseFloat(document.getElementById("freqMax").value);
  const nPoints = parseInt(document.getElementById("numPoints").value, 10);
  const magCanvas = document.getElementById("bodeMagChart");
  const phaseCanvas = document.getElementById("bodePhaseChart");

  if (!exprStr) {
    alert("Por favor ingresa una función H(s).");
    return;
  }

  if (!(fMin > 0 && fMax > fMin && nPoints > 1)) {
    alert("Rango de frecuencias o número de puntos inválido.");
    return;
  }

  const freqs = [];
  const logMin = Math.log10(fMin);
  const logMax = Math.log10(fMax);

  for (let i = 0; i < nPoints; i++) {
    const f = Math.pow(10, logMin + (logMax - logMin) * (i / (nPoints - 1)));
    freqs.push(f);
  }

  let compiled;

  try {
    compiled = math.compile(exprStr);
  } catch (err) {
    alert("Error al analizar la expresión. Asegúrate de escribirla correctamente.");
    return;
  }

  const mags = [];
  const phases = [];

  try {
    freqs.forEach(f => {
      const s = math.complex(0, 2 * Math.PI * f);
      const value = compiled.evaluate({ s });
      const absVal = math.abs(value);
      const db = 20 * Math.log10(absVal);
      const phase = math.arg(value) * 180 / Math.PI;

      mags.push(db);
      phases.push(phase);
    });
  } catch (e) {
    alert("Error al evaluar la función en el rango especificado. Revisa tu expresión.");
    return;
  }

  if (bodeMagChart) {
    bodeMagChart.destroy();
  }

  if (bodePhaseChart) {
    bodePhaseChart.destroy();
  }

  bodeMagChart = new Chart(magCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels: freqs,
      datasets: [{
        label: "|H(jω)| (dB)",
        data: mags,
        borderColor: "#e76f51",
        backgroundColor: "rgba(231, 111, 81, 0.3)",
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "logarithmic",
          title: {
            display: true,
            text: "Frecuencia (Hz)"
          }
        },
        y: {
          title: {
            display: true,
            text: "Magnitud (dB)"
          }
        }
      },
      plugins: {
        legend: { position: "top" }
      }
    }
  });

  bodePhaseChart = new Chart(phaseCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels: freqs,
      datasets: [{
        label: "Fase (°)",
        data: phases,
        borderColor: "#2a9d8f",
        backgroundColor: "rgba(42, 157, 143, 0.3)",
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "logarithmic",
          title: {
            display: true,
            text: "Frecuencia (Hz)"
          }
        },
        y: {
          title: {
            display: true,
            text: "Fase (°)"
          }
        }
      },
      plugins: {
        legend: { position: "top" }
      }
    }
  });

  addToHistory({
    tipo: "Bode",
    entrada: {
      expresion: exprStr,
      fMin: fMin,
      fMax: fMax,
      nPoints: nPoints
    },
    resultado: {
      mags: mags,
      phases: phases
    }
  });
}

// ==== SECCIÓN: LGR ====

let lgrChart = null;

function removeOuterParentheses(str) {
  if (str.startsWith("(") && str.endsWith(")")) {
    let count = 0;

    for (let i = 0; i < str.length; i++) {
      if (str[i] === "(") count++;
      else if (str[i] === ")") count--;

      if (count === 0 && i < str.length - 1) {
        return str;
      }
    }

    return str.substring(1, str.length - 1);
  }

  return str;
}

function parsePolynomial(polyStr) {
  let s = polyStr.replace(/\s+/g, "");
  s = removeOuterParentheses(s);
  s = s.replace(/-/g, "+-");

  const terms = s.split("+").filter(term => term.length > 0);
  const coeffMap = {};

  terms.forEach(term => {
    let coef;
    let exp;

    if (term.includes("s")) {
      const parts = term.split("s");
      const coefStr = parts[0];
      let expStr = "";

      if (parts[1].startsWith("^")) {
        expStr = parts[1].substring(1);
      }

      exp = expStr ? parseInt(expStr, 10) : 1;

      if (coefStr === "" || coefStr === "+") {
        coef = 1;
      } else if (coefStr === "-") {
        coef = -1;
      } else {
        coef = parseFloat(coefStr);
      }
    } else {
      coef = parseFloat(term);
      exp = 0;
    }

    if (!isNaN(exp) && !isNaN(coef)) {
      coeffMap[exp] = (coeffMap[exp] || 0) + coef;
    }
  });

  const exponents = Object.keys(coeffMap).map(e => parseInt(e, 10));
  const maxExp = Math.max(...exponents);
  const coeffs = [];

  for (let k = maxExp; k >= 0; k--) {
    coeffs.push(coeffMap[k] || 0);
  }

  return coeffs;
}

function parseRational(expr) {
  let s = expr.replace(/\s+/g, "");
  const slashIndex = s.indexOf("/");
  let numStr;
  let denStr;

  if (slashIndex === -1) {
    numStr = s;
    denStr = "1";
  } else {
    numStr = s.substring(0, slashIndex);
    denStr = s.substring(slashIndex + 1);
  }

  numStr = removeOuterParentheses(numStr);
  denStr = removeOuterParentheses(denStr);

  const numCoeffs = parsePolynomial(numStr);
  const denCoeffs = parsePolynomial(denStr);

  return [numCoeffs, denCoeffs];
}

function calculateLGR() {
  const exprStr = document.getElementById("lgrExpr").value.trim();
  const kMax = parseFloat(document.getElementById("kMax").value);
  const kSteps = parseInt(document.getElementById("kSteps").value, 10);

  if (!exprStr) {
    alert("Por favor ingresa una función G(s).");
    return;
  }

  if (!(kMax > 0 && kSteps >= 1)) {
    alert("K máximo o pasos inválidos.");
    return;
  }

  let numCoeffs;
  let denCoeffs;

  try {
    [numCoeffs, denCoeffs] = parseRational(exprStr);
  } catch (e) {
    alert("Error al analizar el polinomio. Usa polinomios en s expandidos.");
    return;
  }

  const lenD = denCoeffs.length;
  const lenN = numCoeffs.length;
  let alignedNum = [];
  let alignedDen = [];

  if (lenN < lenD) {
    alignedNum = new Array(lenD).fill(0);

    for (let i = 0; i < lenN; i++) {
      alignedNum[alignedNum.length - lenN + i] = numCoeffs[i];
    }

    alignedDen = denCoeffs.slice();
  } else if (lenD < lenN) {
    alignedDen = new Array(lenN).fill(0);

    for (let i = 0; i < lenD; i++) {
      alignedDen[alignedDen.length - lenD + i] = denCoeffs[i];
    }

    alignedNum = numCoeffs.slice();
  } else {
    alignedNum = numCoeffs.slice();
    alignedDen = denCoeffs.slice();
  }

  const rootData = [];

  for (let r = 0; r < alignedDen.length - 1; r++) {
    rootData.push([]);
  }

  for (let i = 0; i <= kSteps; i++) {
    const k = (kMax * i) / kSteps;

    const charCoeffs = alignedDen.map((dCoef, idx) => {
      const nCoef = alignedNum[idx];
      return dCoef + k * nCoef;
    });

    let roots;

    try {
      roots = math.roots(charCoeffs);
    } catch (e) {
      console.error("Error computing roots", e);
      continue;
    }

    for (let r = 0; r < roots.length; r++) {
      const root = roots[r];
      const xVal = root.re !== undefined ? root.re : root["re"];
      const yVal = root.im !== undefined ? root.im : root["im"];

      if (rootData[r]) {
        rootData[r].push({ x: xVal, y: yVal });
      }
    }
  }

  if (lgrChart) {
    lgrChart.destroy();
  }

  const colors = [
    "#e76f51", "#2a9d8f", "#e9c46a", "#264653", "#f4a261",
    "#8ab17d", "#5b5f97", "#ff9f1c", "#2b9ebb", "#f72585"
  ];

  const datasets = [];

  for (let i = 0; i < rootData.length; i++) {
    datasets.push({
      label: `Raíz ${i + 1}`,
      data: rootData[i],
      showLine: true,
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length],
      pointRadius: 2
    });
  }

  const ctx = document.getElementById("lgrChart").getContext("2d");

  lgrChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Parte Real"
          },
          grid: {
            color: "#ddd"
          }
        },
        y: {
          type: "linear",
          title: {
            display: true,
            text: "Parte Imaginaria"
          },
          grid: {
            color: "#ddd"
          }
        }
      },
      plugins: {
        legend: {
          position: "top"
        }
      }
    }
  });

  addToHistory({
    tipo: "LGR",
    entrada: {
      expresion: exprStr,
      kMax: kMax,
      kSteps: kSteps
    },
    resultado: rootData
  });
}

// ==== SECCIÓN: Historial ====

let historyData = [];

function loadHistory() {
  const stored = localStorage.getItem("calcHistory");

  if (stored) {
    try {
      historyData = JSON.parse(stored);
    } catch (e) {
      historyData = [];
    }
  }

  renderHistory();
}

function addToHistory(entry) {
  entry.fecha = new Date().toLocaleString();
  historyData.push(entry);
  localStorage.setItem("calcHistory", JSON.stringify(historyData));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("historyList");
  container.innerHTML = "";

  const entries = historyData.slice().reverse();

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("history-entry");

    const title = document.createElement("strong");
    title.textContent = `${entry.tipo} (${entry.fecha}):`;
    div.appendChild(title);

    const details = document.createElement("div");
    details.style.whiteSpace = "pre-wrap";

    if (entry.tipo === "Resistencias") {
      details.textContent = entry.resultado;
    } else if (entry.tipo === "VLSM") {
      const lines = [];

      entry.resultado.forEach(res => {
        lines.push(`Subred ${res.index}: ${res.network}${res.prefix} - Hosts: ${res.hosts}`);
      });

      details.textContent = lines.join("\n");
    } else if (entry.tipo === "Bode") {
      details.textContent = `Expresión: ${entry.entrada.expresion}\nRango: ${entry.entrada.fMin} Hz a ${entry.entrada.fMax} Hz`;
    } else if (entry.tipo === "LGR") {
      details.textContent = `Expresión: ${entry.entrada.expresion}\nK hasta ${entry.entrada.kMax}`;
    }

    div.appendChild(details);
    container.appendChild(div);
  });
}

// ==== Inicialización y eventos ====

document.addEventListener("DOMContentLoaded", () => {
  buildBandInputs();
  loadHistory();

  document.getElementById("numBands").addEventListener("change", buildBandInputs);
  document.getElementById("calcRes").addEventListener("click", calculateResistor);
  document.getElementById("clearRes").addEventListener("click", clearResistor);
  document.getElementById("calcVLSM").addEventListener("click", calculateVLSM);
  document.getElementById("calcBode").addEventListener("click", calculateBode);
  document.getElementById("calcLGR").addEventListener("click", calculateLGR);
});

