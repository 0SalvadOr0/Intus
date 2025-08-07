import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IntusHeartLogo } from "./ui/intus-heart-logo";
import { cn } from "@/lib/utils";
import { Home, Users, FileText, Settings, FolderOpen, Menu, X, DollarSign, Bell, Search, MapPin, Archive } from "lucide-react";
import { Button } from "./ui/button";
import { SearchDialog } from "./ui/search-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  const allNavItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/chi-siamo", label: "Chi Siamo", icon: Users },
    { path: "/le-nostre-attivita", label: "Le Nostre Attività", icon: FolderOpen },
    { path: "/presenta-progetto", label: "In evidenza", icon: DollarSign, highlight: true },
    { path: "/blog", label: "Blog", icon: FileText },
    { path: "/archivio-documenti", label: "Archivio Documenti", icon: Archive },
    { path: "/dashboard", label: "Dashboard", icon: Settings },
  ];

  // Filtra gli elementi di navigazione - mostra Dashboard solo agli admin
  const navItems = allNavItems.filter(item =>
    item.path !== "/dashboard" || isAdmin
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-b border-border/50 shadow-elegant">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex flex-col">
              <img
                src="../files/logos/cuore_rosso.png"
                alt="Intus Corleone APS Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Enhanced Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map(({ path, label, icon: Icon, highlight }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 group",
                  "hover:bg-muted/50 hover:shadow-md hover:scale-105",
                  highlight && "ring-1 ring-primary/20",
                  location.pathname === path
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105"
                    : "text-foreground hover:text-primary"
                )}
              >
                {highlight && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-sm"></div>
                )}
                <Icon className={cn(
                  "w-4 h-4 transition-transform group-hover:scale-110",
                  location.pathname === path ? "text-white" : "text-muted-foreground group-hover:text-primary"
                )} />
                <span className={cn(
                  "font-medium text-sm transition-colors",
                  location.pathname === path ? "text-white" : ""
                )}>{label}</span>
                {highlight && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <SearchDialog 
              trigger={
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
                  <Search className="w-5 h-5" />
                </Button>
              }
            />

            <ThemeToggle />
          </div>

          {/* Enhanced Mobile menu button + ThemeToggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative hover:bg-muted/50 hover:scale-105 transition-transform"
            >
              <div className={cn(
                "w-6 h-6 transition-transform duration-300",
                isMobileMenuOpen && "rotate-180"
              )}>
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </div>
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile menu */}
        <div className={cn(
          "lg:hidden transition-all duration-500 ease-out overflow-hidden",
          isMobileMenuOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
        )}>
          <div className="mt-4 space-y-2 bg-gradient-to-r from-card/95 to-muted/95 backdrop-blur-lg rounded-2xl p-4 border border-border/50 shadow-xl">
            {navItems.map(({ path, label, icon: Icon, highlight }, index) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 animate-fade-in",
                  "hover:bg-muted/70 hover:shadow-md hover:scale-[1.02]",
                  highlight && "ring-1 ring-primary/20",
                  location.pathname === path
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "text-foreground hover:text-primary"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform",
                  location.pathname === path ? "text-white" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium",
                  location.pathname === path ? "text-white" : ""
                )}>{label}</span>
                {highlight && location.pathname !== path && (
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
            {/* RIMOSSO ThemeToggle dal menu mobile */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
