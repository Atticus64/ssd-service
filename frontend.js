const URL_BACKEND = "https://washing-unlisted-shirt.ngrok-free.dev/api/sumar";

const datosDelFormulario = {
  a: 15.5,
  b: 42,
};

console.log("Enviando datos al backend...");

fetch(URL_BACKEND, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(datosDelFormulario),
})
  .then((respuesta) => {
    if (!respuesta.ok) {
      throw new Error(`Error en el servidor: ${respuesta.status}`);
    }
    return respuesta.json();
  })
  .then((datosRecibidos) => {
    console.log("Respuesta obtenida exitosamente:");
    console.log(datosRecibidos);
  })
  .catch((error) => {
    console.error("Hubo un fallo en la comunicación:", error);
  });
