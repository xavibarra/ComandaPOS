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

async function getPrinterConfig(printerName: string) {
  await connectPrinter();
  const printer = await qz.printers.find(printerName);
  const printerId = Array.isArray(printer) ? printer[0] : printer;
  // encoding: "Cp1252" le dice a QZ Tray que mande el texto con esa codificación
  // (no UTF-8, la que usa JavaScript por defecto) — necesaria para que á, ó, etc.
  // no salgan mal. Tiene que combinarse con el comando ESC t de abajo, que le
  // dice a la propia impresora que interprete lo que reciba con esa misma tabla.
  return qz.configs.create(printerId, { encoding: "Cp1252" });
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
  lines: { nombre: string; cantidad: number; modificadores?: string[] }[],
) {
  const config = await getPrinterConfig(printerName);

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
    ...lines.flatMap((line) => [
      `${line.cantidad}x ${line.nombre}\n`,
      ...(line.modificadores ?? []).map((nombre) => `   + ${nombre}\n`),
    ]),
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
// filtra por imprime_a_cocina. Pensado con todo lo que suele llevar un tique
// real: nombre del restaurante, fecha y hora, mesa(s), camarero, comensales,
// líneas con su desglose y total.
export async function printBillTicket({
  printerName,
  restaurantName,
  number,
  tables,
  waiterName,
  guests,
  lines,
  total,
}: {
  printerName: string;
  restaurantName?: string;
  number: number;
  tables: string[];
  waiterName?: string;
  guests?: number;
  lines: { nombre: string; cantidad: number; precio: number; modificadores?: string[] }[];
  total: number;
}) {
  const config = await getPrinterConfig(printerName);

  const now = new Date();
  const date = now.toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = now.toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });

  const data: string[] = [
    ESC + "@",
    ESC + "a" + "\x01", // centrar
    ...(restaurantName
      ? [
          GS + "!" + "\x11", // doble ancho y alto, para el nombre del restaurante
          ESC + "E" + "\x01",
          restaurantName + "\n",
          ESC + "E" + "\x00",
          GS + "!" + "\x00",
          "\n",
        ]
      : []),
    `${date}  ${time}\n`,
    `Comanda #${number}\n`,
    tables.join(" + ") + "\n",
    ...(waiterName ? [`Cambrer: ${waiterName}\n`] : []),
    ...(guests ? [`${guests} ${guests === 1 ? "comensal" : "comensals"}\n`] : []),
    "\n",
    ESC + "a" + "\x00", // alinear a la izquierda
    "--------------------------------\n",
    ...lines.flatMap((line) => [
      `${line.cantidad}x ${line.nombre}  ${(line.cantidad * line.precio).toFixed(2)}€\n`,
      ...(line.modificadores ?? []).map((nombre) => `   + ${nombre}\n`),
    ]),
    "--------------------------------\n",
    ESC + "E" + "\x01",
    GS + "!" + "\x01",
    `TOTAL: ${total.toFixed(2)}€\n`,
    GS + "!" + "\x00",
    ESC + "E" + "\x00",
    "\n",
    ESC + "a" + "\x01",
    "Gracies per la vostra visita!\n",
    "\n\n\n\n\n",
    GS + "V" + "\x00",
  ];

  await qz.print(config, data);
}
