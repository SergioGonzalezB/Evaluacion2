// Declaracion de variables y exportacion de los metodos que utiliza routerx`
var express = require("express");
var router = express.Router();
var generaCurp = require("./curp");
//Exportacion de metodos utilizados en routes.js para guardar gets y posts
module.exports = router;

var pdf = require("html-pdf");
var fs = require("fs");
var ejs = require("ejs");

//Ruta para home
router.get("/", (req, res) => {
  res.render("pages/home", { title: "Practica CURP" });
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

  //Recibir el RFC calculado
  console.log("CURP calculado:" + calculado);
  //Para verificar que se concateno la fecha bien para la funcion
  console.log(fecha_nacimiento);

  var compiled = ejs.compile(
    fs.readFileSync(__dirname + "\\Plantilla\\PlantillaCurp.html", "utf8")
  );

  var html = compiled({
    title: "Tu CURP",
    calculado,
    nombre,
    apellido_paterno,
    apellido_materno,
    estado,
    fecha_nacimiento,
  });

  pdf.create(html).toFile("./public/curp.pdf", () => {
    console.log("pdf done");
  });

  res.render("pages/thanks", { title: "Gracias", calculado });
});
