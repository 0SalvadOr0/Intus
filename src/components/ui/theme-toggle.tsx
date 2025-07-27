import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        className={`px-2 py-1 rounded-full border border-border transition-colors duration-200 flex items-center justify-center w-9 h-9 ${theme === "light" ? "bg-yellow-200 text-yellow-700 shadow" : "hover:bg-muted/50"}`}
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        title="Tema chiaro"
      >
        <Sun className="w-5 h-5" />
      </button>
      <button
        className={`px-2 py-1 rounded-full border border-border transition-colors duration-200 flex items-center justify-center w-9 h-9 ${theme === "dark" ? "bg-gray-800 text-yellow-100 shadow" : "hover:bg-muted/50"}`}
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        title="Tema scuro"
      >
        <Moon className="w-5 h-5" />
      </button>
    </div>
  );
}
