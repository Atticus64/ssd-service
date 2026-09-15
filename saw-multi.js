const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const alternativas = [
  { id: "A1", nombre: "Neovim", valores: [30, 15, 9, 10, 10, 9] },
  {
    id: "A2",
    nombre: "Visual Studio Code",
    valores: [1200, 400, 3, 10, 8, 10],
  },
  { id: "A3", nombre: "IntelliJ IDEA", valores: [4000, 800, 5, 9, 7, 10] },
  { id: "A4", nombre: "Sublime Text", valores: [100, 50, 4, 7, 5, 6] },
  { id: "A5", nombre: "Zed", valores: [50, 100, 3, 4, 6, 8] },
  { id: "A6", nombre: "Emacs", valores: [800, 80, 10, 10, 9, 8] },
  { id: "A7", nombre: "VS Codium", valores: [1100, 380, 3, 8, 8, 9] },
  { id: "A8", nombre: "JetBrains Fleet", valores: [2000, 500, 4, 5, 7, 8] },
];

// Endpoint 1: Enviar la matriz de decisión original
app.get("/api/matriz-decision", (req, res) => {
  res.json(alternativas);
});

// Endpoint 2: Evaluar criterios enviados por el usuario
app.post("/api/evaluar-editores", (req, res) => {
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

  // AQUI: Declaramos correctamente tablaNormalizada
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

  // Hacemos la copia y ordenamos del 1 al 8
  const rankingCompleto = [...tablaNormalizada].sort(
    (a, b) => b.puntaje - a.puntaje,
  );

  // Enviamos la respuesta al frontend
  res.json({
    mensaje: "Análisis TDMC completado",
    tablaNormalizada: tablaNormalizada,
    ranking: rankingCompleto,
  });
});

const PUERTO = 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor TDMC corriendo en el puerto ${PUERTO}`);
});
