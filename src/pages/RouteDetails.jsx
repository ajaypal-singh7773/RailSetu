import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Map,
  ShieldCheck,
  Info,
  Train,
  MapPin,
  RefreshCcw,
} from "lucide-react";
import { DUMMY_ROUTES } from "../data/routes";
import ReliabilityMeter from "../components/ReliabilityMeter";

const RouteDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const route =
    location.state?.route ||
    DUMMY_ROUTES.find((r) => r.id === id) ||
    DUMMY_ROUTES[0];
  const urlParams = new URLSearchParams(window.location.search);
  const dateStr = urlParams.get("date");
  let displayDate =
    dateStr ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "comfortable":
        return "bg-green-500 text-white shadow-green-500/50";
      case "risky":
        return "bg-yellow-500 text-white shadow-yellow-500/50";
      case "very risky":
        return "bg-red-500 text-white shadow-red-500/50";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="w-full animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 mb-8 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {route.from.split(" ")[0]} to {route.to.split(" ")[0]}
          </h1>
          <div className="text-foreground/60 font-medium mt-1 flex items-center gap-4">
            <span>{displayDate}</span>
            <span className="w-1 h-1 rounded-full bg-foreground/30"></span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {route.journeyTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-foreground/50 font-medium mb-1">
              Reliability
            </span>
            <ReliabilityMeter score={route.reliabilityScore} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-foreground/50 font-medium mb-1">
              Total Fare
            </span>
            <span className="text-3xl font-bold text-accent">
              {route.totalFare}
            </span>
            <button className="mt-2 px-6 py-2 rounded-full bg-primary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all">
              Book Now
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Animated Timeline Section */}
        <div className="flex-1 glass-card p-6 md:p-10 relative overflow-hidden">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" /> Journey Timeline
          </h3>

          <div className="relative pl-6 md:pl-10 pb-8 mt-4">
            {/* Continuous Vertical Line */}
            <div className="absolute left-[11px] md:left-[19px] top-4 bottom-4 w-[3px] bg-slate-200 dark:bg-slate-700/50 rounded-full z-0 overflow-hidden">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="w-full bg-gradient-to-b from-primary via-accent to-primary"
              />
            </div>

            <div className="relative z-10 flex flex-col">
              {route.legs.map((leg, idx) => {
                if (leg.type === "transfer") {
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      className="my-4 relative flex items-center group"
                    >
                      {/* Transfer Node indicator on the line */}
                      <div className="absolute -left-[30px] md:-left-[38px] w-8 h-8 rounded-full bg-background border-[3px] border-orange-500 shadow-md shadow-orange-500/20 flex items-center justify-center z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
                      </div>

                      {/* Highlighted horizontal divider block */}
                      <div className="flex-1 ml-4 md:ml-6 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-2 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full shrink-0">
                          <RefreshCcw className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            🔄 Change trains at {leg.station?.split(" ")[0]}
                          </div>
                          <div className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                            Wait time: {leg.waitTime}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                // Train Leg
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: idx * 0.2 }}
                    className="flex flex-col"
                  >
                    {/* Departure Node */}
                    <div className="relative flex items-center gap-4 md:gap-6 mt-2 mb-2">
                      <div className="absolute -left-[27px] md:-left-[35px] w-7 h-7 rounded-full bg-background border-[3px] border-primary flex items-center justify-center z-20 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <div className="ml-6 md:ml-8 flex flex-col">
                        <span className="text-xl font-bold text-foreground">
                          {leg.from?.split(" ")[0]}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          Departs {leg.departure}
                        </span>
                      </div>
                    </div>

                    {/* The Transit path */}
                    <div className="relative ml-8 md:ml-10 my-4 py-2">
                      <div className="glass p-4 rounded-2xl inline-flex flex-col gap-3 border border-border/50 hover:border-primary/30 transition-colors shadow-sm bg-white/40 dark:bg-slate-800/40">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Train className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground">
                              {leg.trainName}
                            </div>
                            <div className="text-xs font-semibold text-foreground/50">
                              Train {leg.trainNumber}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-medium text-foreground/60 bg-background/50 p-2 rounded-lg">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {leg.duration}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-border"></div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {leg.distance}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrival Node */}
                    <div className="relative flex items-center gap-4 md:gap-6 mb-2 mt-2">
                      <div className="absolute -left-[27px] md:-left-[35px] w-7 h-7 rounded-full bg-background border-[3px] border-accent flex items-center justify-center z-20 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                      </div>
                      <div className="ml-6 md:ml-8 flex flex-col">
                        <span className="text-xl font-bold text-foreground">
                          {leg.to?.split(" ")[0]}
                        </span>
                        <span className="text-sm font-bold text-accent">
                          Arrives {leg.arrival}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="glass-card p-6">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Transfer Analysis
            </h4>
            <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
              Based on historical data, this route has a{" "}
              {route.reliabilityScore}% success rate for catching all
              connections.
            </p>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${route.reliabilityScore}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Journey Tips
            </h4>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"></span>
                Book tickets early as {route.legs[0]?.trainName} has high
                waitlist probability.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"></span>
                The transfer at New Delhi might require moving between platforms
                1 and 12.
              </li>
            </ul>
          </div>

          {/* Map Placeholder */}
          <div className="glass-card p-6 bg-slate-100 dark:bg-slate-800/30 flex items-center justify-center min-h-[200px] border border-dashed border-border/60">
            <div className="text-center text-foreground/50">
              <Map className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Interactive Map view</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
