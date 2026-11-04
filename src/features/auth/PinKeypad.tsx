import { Delete } from "lucide-react";
import { useEffect, useState } from "react";

function PinKeypad({
  length,
  onComplete,
}: {
  length: number;
  onComplete: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (pin.length === length) {
      onComplete(pin);
      setPin("");
    }
  }, [pin, length, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        setPin((current) => (current.length < length ? current + e.key : current));
      } else if (e.key === "Backspace") {
        setPin((current) => current.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [length]);

  const addDigit = (digit: string) => {
    setPin((current) => (current.length < length ? current + digit : current));
  };

  const removeDigit = () => {
    setPin((current) => current.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-3">
        {Array.from({ length }).map((_, index) => (
          <div
            key={index}
            className={`w-3.5 h-3.5 rounded-full transition-colors ${
              index < pin.length ? "bg-accent" : "bg-stone-200"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <KeypadButton key={digit} onClick={() => addDigit(digit)}>
            {digit}
          </KeypadButton>
        ))}
        <div className="w-20 h-20" />
        <KeypadButton onClick={() => addDigit("0")}>0</KeypadButton>
        <KeypadButton onClick={removeDigit} muted>
          <Delete size={22} />
        </KeypadButton>
      </div>
    </div>
  );
}

function KeypadButton({
  children,
  onClick,
  muted,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-20 h-20 rounded-full text-2xl font-medium flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
        muted
          ? "text-stone-400 hover:bg-stone-100 active:bg-stone-200"
          : "bg-white border border-stone-200 shadow-sm hover:border-accent active:bg-stone-50"
      }`}
    >
      {children}
    </button>
  );
}

export default PinKeypad;
