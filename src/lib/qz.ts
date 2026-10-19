import qz from "qz-tray";

export async function connectPrinter() {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
}

export async function listPrinters() {
  await connectPrinter();
  return qz.printers.find();
}

// Comandos ESC/POS: el lenguaje de bajo nivel que entienden las impresoras
// térmicas de tique. Cada secuencia empieza por un carácter de control
// (ESC = \x1B, GS = \x1D) seguido de un código que activa un modo.
const ESC = "\x1B";
const GS = "\x1D";

export async function printKitchenTicket(
  printerName: string,
  number: number,
  tables: string[],
  lines: { nombre: string; cantidad: number }[],
) {
  await connectPrinter();
  const printer = await qz.printers.find(printerName);
  // encoding: "Cp1252" le dice a QZ Tray que mande el texto con esa codificación
  // (no UTF-8, la que usa JavaScript por defecto) — necesaria para que á, ó, etc.
  // no salgan mal. Tiene que combinarse con el comando ESC t de abajo, que le
  // dice a la propia impresora que interprete lo que reciba con esa misma tabla.
  const config = qz.configs.create(printer, { encoding: "Cp1252" });

  const time = new Date().toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });

  const data: string[] = [
    ESC + "@", // inicializar la impresora (limpia cualquier modo anterior)
    ESC + "t" + "\x10", // seleccionar tabla de códigos CP1252, para los acentos
    ESC + "a" + "\x01", // centrar texto
    GS + "!" + "\x11", // texto a doble ancho y doble alto
    ESC + "E" + "\x01", // negrita on
    `Comanda #${number}\n`, // bien grande y destacado, para ordenar los tiques a simple vista
    "\n",
    tables.join(" + ") + "\n",
    ESC + "E" + "\x00", // negrita off
    GS + "!" + "\x00", // tamaño normal
    "\n",
    time + "\n",
    ESC + "a" + "\x00", // alinear a la izquierda
    "--------------------------------\n",
    ESC + "E" + "\x01", // negrita on, para que los platos destaquen
    GS + "!" + "\x01", // doble alto (ancho normal) — punto intermedio frente al tamaño del encabezado
    ...lines.map((line) => `${line.cantidad}x ${line.nombre}\n`),
    GS + "!" + "\x00", // tamaño normal
    ESC + "E" + "\x00", // negrita off
    "--------------------------------\n",
    "\n\n\n\n\n\n", // margen de papel en blanco antes de cortar
    GS + "V" + "\x00", // cortar el papel
  ];

  await qz.print(config, data);
}

// Tique de cuenta para el cliente — distinto al de cocina: lleva TODOS los
// platos (no solo los pendientes de enviar), con precio y total, no se
// filtra por imprime_a_cocina.
export async function printBillTicket(
  printerName: string,
  number: number,
  tables: string[],
  lines: { nombre: string; cantidad: number; precio: number }[],
  total: number,
) {
  await connectPrinter();
  const printer = await qz.printers.find(printerName);
  const config = qz.configs.create(printer, { encoding: "Cp1252" });

  const time = new Date().toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });

  const data: string[] = [
    ESC + "@",
    ESC + "t" + "\x10",
    ESC + "a" + "\x01",
    GS + "!" + "\x11",
    ESC + "E" + "\x01",
    `Comanda #${number}\n`,
    "\n",
    tables.join(" + ") + "\n",
    ESC + "E" + "\x00",
    GS + "!" + "\x00",
    "\n",
    time + "\n",
    ESC + "a" + "\x00",
    "--------------------------------\n",
    ...lines.map(
      (line) => `${line.cantidad}x ${line.nombre}  ${(line.cantidad * line.precio).toFixed(2)}€\n`,
    ),
    "--------------------------------\n",
    ESC + "E" + "\x01",
    GS + "!" + "\x01",
    `TOTAL: ${total.toFixed(2)}€\n`,
    GS + "!" + "\x00",
    ESC + "E" + "\x00",
    "\n\n\n\n\n\n",
    GS + "V" + "\x00",
  ];

  await qz.print(config, data);
}
