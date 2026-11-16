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
    <header
      className={`p-4 flex flex-wrap items-center justify-between gap-2 ${className ?? "bg-accent"}`}
    >
      <div className="flex items-center min-w-0">
        {onBack && (
          <button
            className="bg-white text-accent px-2 py-2 rounded-lg hover:bg-white/90 cursor-pointer shrink-0"
            onClick={onBack}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="flex items-center gap-2 ml-4 min-w-0">
          {icon}
          <div className="flex flex-col min-w-0">
            <h1 className="font-bold text-white truncate">{title}</h1>
            {subtitle && <p className="text-white/70 truncate">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div>{rightContent && <div>{rightContent}</div>}</div>
    </header>
  );
}

export default Header;
