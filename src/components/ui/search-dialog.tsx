import * as React from "react";
import { Search, FileText, Users, FolderOpen, DollarSign, Home, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const searchItems = [
  { path: "/", label: "Home", icon: Home, description: "Torna alla pagina principale" },
  { path: "/chi-siamo", label: "Chi Siamo", icon: Users, description: "Scopri la nostra missione e il nostro team" },
  { path: "/le-nostre-attivita", label: "Le Nostre Attività", icon: FolderOpen, description: "Esplora i progetti e le iniziative" },
  { path: "/presenta-progetto", label: "In evidenza", icon: DollarSign, description: "Scopri le iniziative in evidenza e presenta il tuo progetto" },
  { path: "/blog", label: "Blog", icon: FileText, description: "Leggi le ultime notizie e articoli" },
  { path: "/archivio-documenti", label: "Archivio Documenti", icon: Archive, description: "Consulta e scarica i documenti ufficiali" },
];

export const SearchDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();

  const filteredItems = searchItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0">
        <VisuallyHidden>
          <DialogTitle>Ricerca nel sito</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Cerca pagine, progetti, informazioni..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="overflow-hidden p-1">
              {filteredItems.map((item) => (
                <div
                  key={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  )}
                  onClick={() => handleSelect(item.path)}
                >
                  <item.icon className="h-4 w-4 opacity-70" />
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nessun risultato trovato per "{query}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
