import { create } from "zustand";

type Session = { type: "waiter"; id: string; name: string } | { type: "admin" };

type SessionStore = {
  session: Session | null;
  startWaiterSession: (id: string, name: string) => void;
  startAdminSession: () => void;
  endSession: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  startWaiterSession: (id, name) => set({ session: { type: "waiter", id, name } }),
  startAdminSession: () => set({ session: { type: "admin" } }),
  endSession: () => set({ session: null }),
}));
