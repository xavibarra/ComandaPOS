import { ChevronLeft } from "lucide-react";
export function Header({
  title,
  subtitle,
  onBack,
  rightContent,
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={`p-4 flex items-center justify-between ${className ?? "bg-accent"}`}>
      <div className="flex items-center">
        {onBack && (
          <button
            className="bg-white text-accent px-2 py-2 rounded-lg hover:bg-white/90 cursor-pointer"
            onClick={onBack}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="flex items-center gap-2 ml-4">
          {icon}
          <div className="flex flex-col">
            <h1 className="font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/70">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div>{rightContent && <div>{rightContent}</div>}</div>
    </header>
  );
}

export default Header;
