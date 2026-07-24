import { motion } from "framer-motion";
import SearchCard from "../components/SearchCard";

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full pt-10">
      
      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 max-w-3xl"
      >
        <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
          ✨ Next-Gen Rail Travel
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Find the <span className="text-gradient">Smartest</span>
          <br /> Train Connections
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
          High-Performance Multi-Hop Train Planner to help you discover the fastest, cheapest, and most reliable train combinations across India.
        </p>
      </motion.div>

      {/* Search Section */}
      <div className="w-full relative z-10">
        <SearchCard />
      </div>

    </div>
  );
};

export default Landing;
