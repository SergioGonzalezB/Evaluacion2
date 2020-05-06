// Declaracion de variables y exportacion de los metodos que utiliza routerx`
var express = require("express");
var router = express.Router();
var generaCurp = require("./curp");

var pdf = require("html-pdf");
var fs = require("fs");

//Leer el archivo HTML con su charset
var html = fs.readFileSync("./public/pdf/PlantillaCurp.html", "utf8");
//path para obtener la direccion absoluta de la carpeta Plantillas donde esta nuestro CSS y HTML
var path = require("path");
//Opciones para el documento PDF que se creara
var options = {
  //Format determina el tamaño de pagina para el PDF
  format: "Tabloid",
  //path.resolve se concatena al prefijo file:// que necesita llevar la propiedad base (donde residen los archivos css, imagenes y js)
  base: "file://" + path.resolve("./pdf"),
};

//Exportacion de metodos utilizados en routes.js para guardar gets y posts
module.exports = router;

//Se llama al archivo rfc.js para poder utilizar las funciones que calculen el rfc
var tools = require("./curp");

//Ruta para home
router.get("/", (req, res) => {
  res.render("pages/home", { title: "Practica RFC" });
});

//Ruta para contactanos
router.get("/contactanos", (req, res) => {
  res.render("pages/contactanos", { title: "Contactanos" });
});

//Ruta para conoce tu curp
router.get("/conoce", (req, res) => {
  res.render("pages/conoce", { title: "Conoce tu CURP" });
});

//Ruta de thanks (no es parte de la pagina normal y solo se llama al terminar un registro)
router.get("/thanks", (req, res) => {
  res.render("pages/thanks", { title: "Gracias" });
});

//Ruta para registro donde esta la forma para calcular rfc
router.get("/registro", (req, res) => {
  res.render("pages/registro", { title: "Registro" });
});

//Metodo utilizado por la forma que sera llamado al activar el boton submit, capturando los datos de los input
router.post("/registro", (req, res) => {
  //Guarda la fecha de nacimiento para usarla como arreglo
  var fecha = req.body.dateBrt;

  //Los 2 ultimos digitos del año
  var year = fecha[0].concat(fecha[1]) + fecha[2].concat(fecha[3]);
  //Dos digitos del mes
  var month = fecha[5].concat(fecha[6]);
  //Dos digitos del dia
  var day = fecha[8].concat(fecha[9]);

  //Se obtienen los datos de la forma usando el atributo name de cada input
  var apellido_paterno = req.body.lname1;
  var apellido_materno = req.body.lname2;
  var nombre = req.body.name;
  var fecha_nacimiento = [day, month, year];
  var sexo = req.body.sexo;
  var estado = req.body.estado;

  //Se utiliza la funcion calcula() del archivo rfc.js
  var calculado = generaCurp({
    nombre,
    apellido_paterno,
    apellido_materno,
    sexo,
    estado,
    fecha_nacimiento,
  });

  const content =
    `<!DOCTYPE html>
      <html>
      <head>
      <meta charset="utf-8" />
      <title>Resultado de plantilla PDF</title>
      <style>
        h1 {
          color: green;
        }
      </style>
      </head>
      <body>
      <div
        id="pageHeader"
        style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">
        <p>- Ejemplo de cabecera en HTML PDF</p>
      </div>
      <div id="pageFooter" style="border-top: 1px solid #ddd; padding-top: 5px;">
        Footer de Ejemplo ` +
    calculado +
    `
      </div>
      <h1>Título en el PDF creado con el paquete html-pdf</h1>
      <p>Generando un PDF con un HTML sencillo</p>
      </body>
      </html>`;
  //Recibir el RFC calculado
  console.log("CURP calculado:" + calculado);
  //Para verificar que se concateno la fecha bien para la funcion
  console.log(fecha_nacimiento);

  //Crea el archivo utilizando la variable que contiene nuestro contenido HTML
  //./nombreDeArchivo.pdf para determinar el nombre del archivo creado en ./ (raiz del proyecto)
  pdf.create(content).toFile("./public/pdf/CURP.pdf", function (err, res) {
    if (err) {
      //si existe un error lo tomamos y lo mandamos a consola
      console.log(err);
    } else {
      //si no hay error mandamos el RESPONSE a consola
      console.log(res);
    }
  });
  res.render("pages/thanks", { title: "Gracias", calculado });
});
