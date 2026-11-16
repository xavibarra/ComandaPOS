import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { useRestaurantSettings } from "../../../lib/useRestaurantSettings";
import { useChangeAdminPin } from "./useChangeAdminPin";
import { useUpdateRecoveryEmail } from "./useUpdateRecoveryEmail";

function SecurityAdminPage() {
  const { data: settings } = useRestaurantSettings();
  const updateEmail = useUpdateRecoveryEmail();
  const changePin = useChangeAdminPin();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => {
    if (settings) setEmail(settings.admin_recovery_email ?? "");
  }, [settings]);

  const [newPin, setNewPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);

  return (
    <div>
      <Header title="Seguretat" onBack={() => navigate("/admin")} />
      <div className="p-4 max-w-md mx-auto flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="font-bold">Correu de recuperació</h2>
          <p className="text-sm text-stone-500">Per si algun dia es perd el PIN d'administració.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!settings) return;
              updateEmail.mutate(
                { settingsId: settings.id, email },
                { onSuccess: () => setEmailSaved(true) },
              );
            }}
            className="flex flex-col gap-3"
          >
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              type="email"
              placeholder="correu@exemple.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailSaved(false);
              }}
            />
            <button
              type="submit"
              className="bg-accent text-white rounded-xl py-2 font-medium cursor-pointer"
            >
              Guardar correu
            </button>
            {emailSaved && <p className="text-sm text-green-600">Correu actualitzat.</p>}
          </form>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold">Canviar PIN d'administració</h2>
          <p className="text-sm text-stone-500">6 xifres.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              changePin.mutate(
                { pin: newPin },
                {
                  onSuccess: () => {
                    setPinSaved(true);
                    setNewPin("");
                  },
                },
              );
            }}
            className="flex flex-col gap-3"
          >
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              placeholder="Nou PIN (6 xifres)"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              value={newPin}
              onChange={(e) => {
                setNewPin(e.target.value.replace(/\D/g, ""));
                setPinSaved(false);
              }}
              required
            />
            <button
              type="submit"
              className="bg-accent text-white rounded-xl py-2 font-medium cursor-pointer"
            >
              Guardar PIN
            </button>
            {pinSaved && <p className="text-sm text-green-600">PIN actualitzat.</p>}
          </form>
        </section>
      </div>
    </div>
  );
}

export default SecurityAdminPage;
