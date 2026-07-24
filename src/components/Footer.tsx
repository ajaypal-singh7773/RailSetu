import { Train, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-border glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5 text-primary" />
            <span className="font-bold text-xl tracking-tight">RailSetu</span>
          </div>
          
          <div className="flex gap-6 text-sm text-foreground/70">
            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
          
          <div className="text-sm text-foreground/70 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1 fill-current animate-pulse" /> for India
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
