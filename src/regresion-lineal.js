// rutas/regresion-lineal.js
import express from "express";
import { z } from "zod";

const routerRegresion = express.Router();

const regresionSchema = z
  .object({
    x: z.array(
      z.number({ error: "Cada valor de x debe ser numérico" }),
      { error: "x es obligatorio y debe ser un arreglo de números" }
    ).min(1, { error: "x debe contener al menos un elemento" }),
    y: z.array(
      z.number({ error: "Cada valor de y debe ser numérico" }),
      { error: "y es obligatorio y debe ser un arreglo de números" }
    ).min(1, { error: "y debe contener al menos un elemento" }),
    n: z
      .number({ error: "n es obligatorio y debe ser numérico" })
      .int({ error: "n debe ser un número entero" })
      .positive({ error: "n debe ser mayor que cero" }),
  })
  .refine((datos) => datos.x.length === datos.y.length, {
    error: "Los arreglos x e y deben tener la misma longitud",
    path: ["y"],
  })
  .refine((datos) => datos.x.length >= datos.n, {
    error: "Los datos proporcionados no son suficientes para el valor de n",
    path: ["n"],
  });

/**
 * formatIssues
 * @param {import("zod").ZodError} error
 * @returns {{ campo: string, mensaje: string }[]}
 */
const formatIssues = (error) =>
  error.issues.map((issue) => ({
    campo: issue.path.length
      ? issue.path.reduce(
          (acc, seg) =>
            typeof seg === "number" ? `${acc}[${seg}]` : `${acc}.${seg}`,
          ""
        ).slice(1)
      : "body",
    mensaje: issue.message,
  }));

/**
 * getModel
 * @param {number[]} x
 * @param {number[]} y
 * @param {number} n
 */
const getModel = (x, y, n) => {
  const sum_x = x.reduce((x1, x2) => x1 + x2, 0);
  const sum_y = y.reduce((x1, x2) => x1 + x2, 0);
  const sum_sq = x.map((xi) => xi * xi).reduce((x1, x2) => x1 + x2, 0);
  const sum_xy = x
    .map((x1, indx) => x1 * y[indx])
    .reduce((x1, x2) => x1 + x2, 0);

  const numerator = n * sum_xy - sum_x * sum_y;
  const denominator = n * sum_sq - sum_x * sum_x;

  const b = numerator / denominator;
  const a = (sum_y - b * sum_x) / n;

  const model = (xi) => a + b * xi;
  const prediccion = x.map((xi) => model(xi));

  return { a, b, prediccion, sumas: { sum_x, sum_y, sum_sq, sum_xy } };
};

routerRegresion.post("/evaluar", (req, res) => {
  const result = regresionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Los parámetros de entrada no son válidos",
      detalles: formatIssues(result.error),
    });
  }

  const { x, y, n } = result.data;
  const { a, b, prediccion, sumas } = getModel(x, y, n);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return res.status(400).json({
      error: "No se pudo ajustar el modelo",
      detalles: [
        {
          campo: "x",
          mensaje: "La varianza de x es cero, no es posible calcular la pendiente",
        },
      ],
    });
  }

  res.json({
    mensaje: "Análisis de regresión lineal completado",
    coeficientes: {
      a: parseFloat(a.toFixed(4)),
      b: parseFloat(b.toFixed(4)),
    },
    sumas,
    prediccion,
  });
});

export default routerRegresion;
