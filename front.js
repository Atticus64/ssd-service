const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

const URL_BACKEND =
  "https://washing-unlisted-shirt.ngrok-free.dev/api/evaluar-editores";

const criterios = [
  "Tiempo de Inicio (C1)",
  "Consumo de RAM (C2)",
  "Curva de Aprendizaje (C3)",
  "Extensiones (C4)",
  "Integración con Terminal (C5)",
  "Autocompletado (C6)",
];

async function recopilarDatos() {
  const rl = readline.createInterface({ input, output });
  const pesos = [];
  const tipos = [];

  console.log("=== Configuración de Criterios (TDMC) ===");

  for (let i = 0; i < criterios.length; i++) {
    console.log(`\n--- Evaluando: ${criterios[i]} ---`);

    // Solicita el porcentaje en formato entero
    const pesoStr = await rl.question(
      "Ingresa el peso en porcentaje (ej. 20 para 20%): ",
    );
    pesos.push(parseFloat(pesoStr));

    // Muestra menú de opciones para el tipo
    console.log("¿Qué tipo de criterio es?");
    console.log("1. Maximizar");
    console.log("2. Minimizar");
    const tipoElegido = await rl.question("Opción (1 o 2): ");

    // Traduce la opción numérica a los textos 'max' o 'min' para el backend
    tipos.push(tipoElegido === "1" ? "max" : "min");
  }

  rl.close();

  const datosDelFormulario = { pesos, tipos };

  console.log("\nEnviando datos procesados al backend...");

  try {
    const respuesta = await fetch(URL_BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosDelFormulario),
    });

    if (!respuesta.ok) {
      throw new Error(`Error en la API: ${respuesta.status}`);
    }
    const datosRecibidos = await respuesta.json();

    console.log("\nRanking generado con éxito:");
    console.table(datosRecibidos.top3);
  } catch (error) {
    console.error("Hubo un problema de conexión:", error);
  }
}

// Ejecutar el flujo interactivo
recopilarDatos();
