import qz from "qz-tray";

export async function conectarImpresora() {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
}

export async function listarImpresoras() {
  await conectarImpresora();
  return qz.printers.find();
}
