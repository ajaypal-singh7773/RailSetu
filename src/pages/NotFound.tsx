import { Link } from "react-router-dom";
import { Train } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in text-center px-4">
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8 p-6 bg-primary/10 rounded-full"
      >
        <Train className="w-20 h-20 text-primary" />
      </motion.div>
      <h1 className="text-6xl font-extrabold mb-4 text-gradient">404</h1>
      <h2 className="text-2xl font-bold mb-4">You seem to have missed your train!</h2>
      <p className="text-foreground/60 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved to another track.
      </p>
      <Link to="/" className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
        Back to Home Station
      </Link>
    </div>
  );
};

export default NotFound;
