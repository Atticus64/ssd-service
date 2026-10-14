import express from "express";
import { z } from "zod";

const routerMetricas = express.Router();

const metricasSchema = z
  .object({
    y: z
      .array(z.number({ error: "Cada valor de y debe ser numerico" }), {
        error: "y es obligatorio y debe ser un arreglo de numeros",
      })
      .min(1, { error: "y debe contener al menos un elemento" }),

    prediccion: z
      .array(z.number({ error: "Cada prediccion debe ser numerica" }), {
        error: "prediccion es obligatoria y debe ser un arreglo de numeros",
      })
      .min(1, { error: "prediccion debe contener al menos un elemento" }),

    n: z
      .number({ error: "n es obligatorio y debe ser numerico" })
      .int({ error: "n debe ser un numero entero" })
      .positive({ error: "n debe ser mayor que cero" }),
  })
  .refine((datos) => datos.y.length === datos.prediccion.length, {
    error: "Los arreglos y y prediccion deben tener la misma longitud",
    path: ["prediccion"],
  })
  .refine((datos) => datos.y.length === datos.n, {
    error: "n debe coincidir con la cantidad de datos",
    path: ["n"],
  })
  .refine((datos) => datos.y.every((yi) => yi !== 0), {
    error: "Los valores reales no pueden ser cero para calcular MAPE",
    path: ["y"],
  });

const formatIssues = (error) =>
  error.issues.map((issue) => ({
    campo: issue.path.length
      ? issue.path
          .reduce(
            (acc, seg) =>
              typeof seg === "number" ? `${acc}[${seg}]` : `${acc}.${seg}`,
            "",
          )
          .slice(1)
      : "body",
    mensaje: issue.message,
  }));

const getMetricas = (y, prediccion, n) => {
  const errores = y.map((yi, indx) => yi - prediccion[indx]);

  const errores_abs = errores.map((ei) => Math.abs(ei));

  const errores_sq = errores.map((ei) => ei * ei);

  const errores_pct = y.map(
    (yi, indx) => (errores_abs[indx] / Math.abs(yi)) * 100,
  );

  const sum_abs = errores_abs.reduce((x1, x2) => x1 + x2, 0);

  const sum_sq = errores_sq.reduce((x1, x2) => x1 + x2, 0);

  const sum_pct = errores_pct.reduce((x1, x2) => x1 + x2, 0);

  const mae = sum_abs / n;

  const rmse = Math.sqrt(sum_sq / n);

  const mape = sum_pct / n;

  return {
    mae,
    rmse,
    mape,
    errores,
    errores_abs,
    errores_sq,
    errores_pct,
    sumas: { sum_abs, sum_sq, sum_pct },
  };
};

routerMetricas.post("/evaluar", (req, res) => {
  const result = metricasSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Los parametros de entrada no son validos",
      detalles: formatIssues(result.error),
    });
  }

  const { y, prediccion, n } = result.data;

  const {
    mae,
    rmse,
    mape,
    errores,
    errores_abs,
    errores_sq,
    errores_pct,
    sumas,
  } = getMetricas(y, prediccion, n);

  res.json({
    mensaje: "Analisis de metricas completado",
    metricas: {
      mae: parseFloat(mae.toFixed(4)),
      rmse: parseFloat(rmse.toFixed(4)),
      mape: parseFloat(mape.toFixed(4)),
    },
    sumas,
    errores,
    errores_abs,
    errores_sq,
    errores_pct,
  });
});

export default routerMetricas;
