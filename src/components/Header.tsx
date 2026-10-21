import { ChevronLeft } from "lucide-react";
export function Header({
  title,
  subtitle,
  onBack,
  rightContent,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}) {
  return (
    <header className="bg-accent p-4 flex items-center justify-between">
      <div className="flex items-center">
        {onBack && (
          <button
            className="bg-white text-accent px-2 py-2 rounded-lg hover:bg-white/90"
            onClick={onBack}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="flex flex-col ml-4">
          <h1 className="font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/70">{subtitle}</p>}
        </div>
      </div>
      <div>{rightContent && <div>{rightContent}</div>}</div>
    </header>
  );
}

export default Header;
