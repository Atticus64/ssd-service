# Server SSD

API REST para análisis multicriterio (SAW, TOPSIS) y regresión lineal. Usa **Node.js + Express 5**, **Zod** para validación y serve de datos.

Servidor en el puerto `3000`.

## Requisitos

- Node.js >= 18
- npm, pnpm o yarn

## Instalación

```bash
npm install
```

Alternativa con pnpm:

```bash
pnpm install
```

## Levantar el servidor

```bash
npm run dev
```

Se iniciará el servidor:

```
Servidor TDMC running en el puerto 3000
```

## Endpoints

| Método | Ruta                          | Descripción                                   |
| ------ | ----------------------------- | --------------------------------------------- |
| GET    | `/api/health`                 | Verificación de salud del servidor            |
| GET    | `/api/matriz-decision`        | Matriz de decisión (alternativas)             |
| POST   | `/api/saw/evaluar`            | Análisis SAW                                  |
| POST   | `/api/topsis/evaluar`         | Análisis TOPSIS                               |
| POST   | `/api/regresion-lineal/evaluar` | Regresión lineal a partir de pares `(x, y)` |

## Diagrama de rutas

```
app (src/main.js)
│
├── GET /api/health
├── GET /api/matriz-decision  ──▶ src/alternativas.js (datos)
│
├── /api/saw
│   └── POST /evaluar         ──▶ src/saw.js
│
├── /api/topsis
│   └── POST /evaluar         ──▶ src/topsis.js
│
└── /api/regresion-lineal
    └── POST /evaluar         ──▶ src/regresion-lineal.js
```

## Regresión lineal

Calcula los coeficientes de la recta `y = a + b·x` por mínimos cuadrados y devuelve las predicciones.

### Body de la petición

```json
{
  "x": [2, 4, 6, 8, 10],
  "y": [4, 7, 9, 12, 13],
  "n": 5
}
```

| Campo | Tipo             | Descripción                                  |
| ----- | ---------------- | -------------------------------------------- |
| `x`   | `number[]`       | Valores de la variable independiente         |
| `y`   | `number[]`       | Valores de la variable dependiente           |
| `n`   | `number` (entero positivo) | Cantidad de datos a usar en el ajuste |

### Ejemplo con curl

```bash
curl -X POST http://localhost:3000/api/regresion-lineal/evaluar \
  -H "Content-Type: application/json" \
  -d '{"x":[2,4,6,8,10],"y":[4,7,9,12,13],"n":5}'
```

Respuesta:

```json
{
  "mensaje": "Análisis de regresión lineal completado",
  "coeficientes": {
    "a": 2.1,
    "b": 1.15
  },
  "sumas": {
    "sum_x": 30,
    "sum_y": 45,
    "sum_sq": 220,
    "sum_xy": 316
  },
  "prediccion": [4.4, 6.7, 9, 11.3, 13.6]
}
```

### Errores (validación con Zod)

Datos inválidos devuelven `400` con el detalle del campo:

```bash
curl -X POST http://localhost:3000/api/regresion-lineal/evaluar \
  -H "Content-Type: application/json" \
  -d '{"x":[2,"a"],"y":[4,7],"n":2}'
```

```json
{
  "error": "Los parámetros de entrada no son válidos",
  "detalles": [
    { "campo": "x[1]", "mensaje": "Cada valor de x debe ser numérico" }
  ]
}
```

## Otros ejemplos con curl

### Health check

```bash
curl http://localhost:3000/api/health
```

### Matriz de decisión

```bash
curl http://localhost:3000/api/matriz-decision
```

### SAW

```bash
curl -X POST http://localhost:3000/api/saw/evaluar \
  -H "Content-Type: application/json" \
  -d '{
    "pesos": [10, 10, 10, 10, 10, 10],
    "tipos": ["max", "max", "max", "max", "max", "max"]
  }'
```

### TOPSIS

```bash
curl -X POST http://localhost:3000/api/topsis/evaluar \
  -H "Content-Type: application/json" \
  -d '{
    "pesos": [10, 10, 10, 10, 10, 10],
    "tipos": ["max", "max", "max", "max", "max", "max"]
  }'
```