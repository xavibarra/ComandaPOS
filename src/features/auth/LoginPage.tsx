import { Delete } from "lucide-react";
import { usePinLogin } from "./usePinLogin";

function LoginPage() {
  const { pin, setPin, añadirDigito, borrarDigito } = usePinLogin();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <input
        className="absolute opacity-0 overflow-hidden w-px h-px"
        type="password"
        autoFocus
        inputMode="numeric"
        placeholder="PIN"
        maxLength={6}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
      />
      <div className="flex justify-between">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`w-20 h-25 border rounded-lg flex items-center justify-center ${
              index < pin.length ? "border-accent" : "border-gray-300"
            }`}
          >
            {index < pin.length && "·"}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-2 text-2xl">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digito) => (
          <BotonTeclado key={digito} onClick={() => añadirDigito(digito)}>
            {digito}
          </BotonTeclado>
        ))}
        <div className="bg-white w-20 h-20 border border-gray-300 rounded-lg"> </div>
        <BotonTeclado onClick={() => añadirDigito("0")}>0</BotonTeclado>
        <BotonTeclado onClick={borrarDigito}>
          <Delete size={24} />
        </BotonTeclado>
      </div>
    </div>
  );
}

function BotonTeclado({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-20 h-20 bg-white border border-gray-300 rounded-lg cursor-pointer flex justify-center items-center"
    >
      {children}
    </button>
  );
}

export default LoginPage;
