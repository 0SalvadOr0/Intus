import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Logo and Organization Name */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-primary">
              INTUS
            </div>
            <div className="text-sm text-muted-foreground">
              CORLEONE APS
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex space-x-6">
            <Link 
              to="/privacy-policy" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/contatti" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contatti
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} INTUS Corleone APS. Tutti i diritti riservati.
            <p className="mt-1">
              Sviluppato da <a href="mailto:giovanni.g.contatti@gmail.com" className="text-primary hover:underline">
                Giovanni Grizzaffi
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
