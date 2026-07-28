import { motion } from "framer-motion";
import { Filter, ChevronDown } from "lucide-react";
import { useState } from "react";

const FilterSidebar = ({ 
  selectedDepartureTimes = [], 
  toggleDepartureTime,
  selectedTransfers = [],
  toggleTransfers
}) => {
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
        {[
          { id: "0", label: "0 (Direct)" },
          { id: "1", label: "1 Transfer" },
          { id: "2", label: "2 Transfers" },
          { id: "3+", label: "3+ Transfers" }
        ].map(
          (item, i) => (
            <label
              key={i}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedTransfers.includes(item.id)}
                onChange={() => toggleTransfers && toggleTransfers(item.id)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 accent-primary"
              />
              <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </label>
          ),
        )}
      </AccordionSection>



      <AccordionSection title="Departure Time" section="time">
        {[
          { id: "Morning", label: "Morning (6 AM - 12 PM)" },
          { id: "Afternoon", label: "Afternoon (12 PM - 6 PM)" },
          { id: "Evening", label: "Evening (6 PM - 12 AM)" },
          { id: "Night", label: "Night (12 AM - 6 AM)" },
        ].map((item, i) => (
          <label
            key={i}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedDepartureTimes.includes(item.id)}
              onChange={() => toggleDepartureTime && toggleDepartureTime(item.id)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 accent-primary"
            />
            <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
              {item.label}
            </span>
          </label>
        ))}
      </AccordionSection>

    </div>
  );
};

export default FilterSidebar;
