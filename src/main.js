import express from "express";
import cors from "cors";
import routerSaw  from "./saw.js";
import routerTopsis  from "./topsis.js";
import routerRegresion  from "./regresion-lineal.js";
import alternativas  from "./alternativas.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/matriz-decision", (req, res) => {
  res.json(alternativas);
});

app.use("/api/saw", routerSaw);
app.use("/api/topsis", routerTopsis);
app.use("/api/regresion-lineal", routerRegresion);

app.get("/api/health", (_, res) => {

	return res.json({
		tea: true,
		msg: 'do you wanna a cup of tea? 🫖 '
	});
});

const PUERTO = 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor TDMC running en el puerto ${PUERTO}`);
});

