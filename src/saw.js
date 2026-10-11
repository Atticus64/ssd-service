// rutas/saw.js
import express from "express";
import alternativas from "./alternativas.js"; // Consumimos el archivo central de datos

const routerSaw = express.Router();

routerSaw.post("/evaluar", (req, res) => {
  const { pesos, tipos } = req.body;

  if (!pesos || pesos.length !== 6 || !tipos || tipos.length !== 6) {
    return res
      .status(400)
      .json({ error: "Se requieren exactamente 6 pesos y 6 tipos (max/min)." });
  }

  const pesosDecimales = pesos.map((p) => p / 100);
  const maximos = [];
  const minimos = [];

  for (let c = 0; c < 6; c++) {
    const valoresColumna = alternativas.map((alt) => alt.valores[c]);
    maximos.push(Math.max(...valoresColumna));
    minimos.push(Math.min(...valoresColumna));
  }

  const tablaNormalizada = alternativas.map((alt) => {
    let puntajeTotal = 0;
    const valoresNorm = [];

    for (let c = 0; c < 6; c++) {
      let valorNormalizado = 0;

      if (tipos[c] === "max") {
        valorNormalizado = alt.valores[c] / maximos[c];
      } else if (tipos[c] === "min") {
        valorNormalizado = minimos[c] / alt.valores[c];
      } else {
        return res
          .status(400)
          .json({ error: `Valor inválido en tipos[${c}]. Usa 'max' o 'min'.` });
      }

      valoresNorm.push(parseFloat(valorNormalizado.toFixed(3)));
      puntajeTotal += valorNormalizado * pesosDecimales[c];
    }

    return {
      nombre: alt.nombre,
      valoresNormalizados: valoresNorm,
      puntaje: parseFloat(puntajeTotal.toFixed(3)),
    };
  });

  const rankingCompleto = [...tablaNormalizada].sort(
    (a, b) => b.puntaje - a.puntaje
  );

  res.json({
    mensaje: "Análisis SAW completado",
    tablaNormalizada: tablaNormalizada,
    ranking: rankingCompleto,
  });
});

// Exportamos el router para que server.js pueda usarlo
export default routerSaw;
