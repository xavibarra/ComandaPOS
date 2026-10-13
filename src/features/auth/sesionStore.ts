import { create } from "zustand";

type Sesion = { tipo: "camarero"; id: string; nombre: string } | { tipo: "admin" };

type SesionStore = {
  sesion: Sesion | null;
  iniciarSesionCamarero: (id: string, nombre: string) => void;
  iniciarSesionAdmin: () => void;
  cerrarSesion: () => void;
};

export const useSesionStore = create<SesionStore>((set) => ({
  sesion: null,
  iniciarSesionCamarero: (id, nombre) => set({ sesion: { tipo: "camarero", id, nombre } }),
  iniciarSesionAdmin: () => set({ sesion: { tipo: "admin" } }),
  cerrarSesion: () => set({ sesion: null }),
}));
