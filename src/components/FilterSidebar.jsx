import { motion } from "framer-motion";
import { Filter, ChevronDown } from "lucide-react";
import { useState } from "react";

const FilterSidebar = () => {
  const [openSections, setOpenSections] = useState({
    transfers: true,
    budget: true,
    time: false,
    type: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const AccordionSection = ({ title, section, children }) => (
    <div className="border-b border-border py-4 last:border-0">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full font-semibold text-sm text-foreground/80 hover:text-primary transition-colors"
      >
        {title}
        <motion.div
          animate={{ rotate: openSections[section] ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: openSections[section] ? "auto" : 0,
          opacity: openSections[section] ? 1 : 0,
        }}
        className="overflow-hidden"
      >
        <div className="pt-4 pb-2 space-y-3">{children}</div>
      </motion.div>
    </div>
  );

  return (
    <div className="glass-card p-5 w-full hidden md:block">
      <div className="flex items-center gap-2 font-bold text-lg mb-4 text-foreground">
        <Filter className="w-5 h-5 text-primary" />
        Filters
      </div>

      <AccordionSection title="Maximum Transfers" section="transfers">
        {["0 (Direct)", "1 Transfer", "2 Transfers", "3+ Transfers"].map(
          (label, i) => (
            <label
              key={i}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 accent-primary"
              />
              <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                {label}
              </span>
            </label>
          ),
        )}
      </AccordionSection>

      <AccordionSection title="Travel Class" section="budget">
        {[
          "General (UR)",
          "Sleeper (SL)",
          "AC 3-Tier (3A)",
          "AC 2-Tier (2A)",
          "AC 1st Class (1A)",
        ].map((label, i) => (
          <label
            key={i}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 accent-primary"
            />
            <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
              {label}
            </span>
          </label>
        ))}
      </AccordionSection>

      <AccordionSection title="Departure Time" section="time">
        {[
          "Morning (06:00 - 12:00)",
          "Afternoon (12:00 - 18:00)",
          "Evening (18:00 - 00:00)",
          "Night (00:00 - 06:00)",
        ].map((label, i) => (
          <label
            key={i}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 accent-primary"
            />
            <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
              {label}
            </span>
          </label>
        ))}
      </AccordionSection>

      <AccordionSection title="Train Options" section="type">
        {[
          "Only Available Seats",
          "Only Tatkal",
          "AC First Class (1A)",
          "Sleeper (SL)",
        ].map((label, i) => (
          <label
            key={i}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 accent-primary"
            />
            <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
              {label}
            </span>
          </label>
        ))}
      </AccordionSection>
    </div>
  );
};

export default FilterSidebar;
