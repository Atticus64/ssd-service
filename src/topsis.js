// rutas/topsis.js
const express = require("express");
const routerTopsis = express.Router();
const alternativas = require("./alternativas.js");

routerTopsis.post("/evaluar", (req, res) => {
  const { pesos, tipos } = req.body;

  if (!pesos || pesos.length !== 6 || !tipos || tipos.length !== 6) {
    return res
      .status(400)
      .json({ error: "Se requieren exactamente 6 pesos y 6 tipos (max/min)." });
  }

  const pesosDecimales = pesos.map((p) => p / 100);

  // 1. Normalización Vectorial
  const denominadores = [];
  for (let c = 0; c < 6; c++) {
    let sumaCuadrados = 0;
    for (let a = 0; a < alternativas.length; a++) {
      sumaCuadrados += Math.pow(alternativas[a].valores[c], 2);
    }
    denominadores.push(Math.sqrt(sumaCuadrados));
  }

  const matrizNormalizada = [];
  const matrizPonderada = [];

  alternativas.forEach((alt) => {
    const valoresNorm = [];
    const valoresPond = [];

    for (let c = 0; c < 6; c++) {
      const norm = alt.valores[c] / denominadores[c];
      const pond = norm * pesosDecimales[c];
      
      valoresNorm.push(parseFloat(norm.toFixed(4)));
      valoresPond.push(parseFloat(pond.toFixed(4)));
    }

    matrizNormalizada.push({ nombre: alt.nombre, valores: valoresNorm });
    matrizPonderada.push({ nombre: alt.nombre, valores: valoresPond });
  });

  // 2. Soluciones Ideales
  const idealPositiva = [];
  const idealNegativa = [];

  for (let c = 0; c < 6; c++) {
    const columnaPonderada = matrizPonderada.map((alt) => alt.valores[c]);
    const max = Math.max(...columnaPonderada);
    const min = Math.min(...columnaPonderada);

    if (tipos[c] === "max") {
      idealPositiva.push(max);
      idealNegativa.push(min);
    } else if (tipos[c] === "min") {
      idealPositiva.push(min);
      idealNegativa.push(max);
    }
  }

  // 3. Distancias Euclidianas y Coeficiente Ci
  const distanciasYResultados = matrizPonderada.map((alt, index) => {
    let sumaDistPositiva = 0;
    let sumaDistNegativa = 0;

    for (let c = 0; c < 6; c++) {
      sumaDistPositiva += Math.pow(alt.valores[c] - idealPositiva[c], 2);
      sumaDistNegativa += Math.pow(alt.valores[c] - idealNegativa[c], 2);
    }

    const sPositiva = Math.sqrt(sumaDistPositiva);
    const sNegativa = Math.sqrt(sumaDistNegativa);
    const ci = sNegativa / (sPositiva + sNegativa);

    return {
      nombre: alt.nombre,
      distanciaPositiva: parseFloat(sPositiva.toFixed(4)),
      distanciaNegativa: parseFloat(sNegativa.toFixed(4)),
      puntajeFinal: parseFloat(ci.toFixed(4)),
    };
  });

  // 4. Ranking
  const ranking = [...distanciasYResultados].sort((a, b) => b.puntajeFinal - a.puntajeFinal);

  // 5. Respuesta Desglosada
  res.json({
    mensaje: "Análisis TOPSIS completado paso a paso",
    datos: {
      matrizNormalizada,
      matrizPonderada,
      solucionesIdeales: {
        idealPositiva,
        idealNegativa
      },
      detallesYResultados: distanciasYResultados,
      rankingFinal: ranking
    }
  });
});

module.exports = routerTopsis;
