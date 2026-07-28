import { motion } from "framer-motion";
import { Clock, ArrowRight, TrainFront } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReliabilityMeter from "./ReliabilityMeter";
import { cn } from "../utils/cn";

const RouteCard = ({ route, index }) => {
  const navigate = useNavigate();

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get train details from legs (ignoring transfers)
  const trains = route.legs.filter((leg) => leg.type !== "transfer");
  const departureLeg = trains[0];
  const arrivalLeg = trains[trains.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() =>
        navigate(`/route/${route.id}?date=${encodeURIComponent(route.date)}`, {
          state: { route },
        })
      }
      className="glass p-6 rounded-2xl cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all group"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Trains Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                getRiskColor(route.riskLevel),
              )}
            >
              {route.riskLevel} Risk
            </span>
            <span className="text-sm text-foreground/60 font-medium">
              {route.transfers === 0
                ? "Direct"
                : `${route.transfers} Transfer${route.transfers > 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {departureLeg.departure}
              </div>
              <div className="text-sm font-medium text-foreground/60">
                {route.from.split(" ")[0]}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-xs font-semibold text-foreground/50 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {route.journeyTime}
              </div>
              <div className="w-full relative flex items-center justify-center">
                <div className="absolute w-full h-[2px] bg-border dark:bg-slate-700 rounded-full"></div>
                <div className="absolute w-1/2 h-[2px] bg-gradient-to-r from-primary to-accent rounded-full group-hover:w-full transition-all duration-700 ease-in-out"></div>

                <div className="z-10 flex gap-1 bg-background dark:bg-slate-900 px-2 rounded-full border border-border">
                  {trains.map((_, i) => (
                    <TrainFront key={i} className="w-4 h-4 text-primary" />
                  ))}
                </div>
              </div>
              <div className="text-xs font-medium text-foreground/50 mt-1">
                {route.totalDistance}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {arrivalLeg.arrival}
              </div>
              <div className="text-sm font-medium text-foreground/60">
                {route.to.split(" ")[0]}
              </div>
            </div>
          </div>

          {/* Train Names snippet */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-foreground/60 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {route.legs.map((leg, idx) => {
              if (leg.type === "transfer") {
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center mx-2 animate-pulse"
                  >
                    <span className="text-[10px] text-orange-500 font-bold tracking-wider uppercase">
                      Layover
                    </span>
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full mt-0.5">
                      {leg.waitTime}
                    </span>
                    <span className="text-[10px] mt-1 text-foreground/40">
                      {leg.station?.split(" ")[0]}
                    </span>
                  </div>
                );
              }
              return (
                <div key={idx} className="flex items-center gap-1">
                  <span className="bg-primary/5 text-primary px-2 py-1 rounded border border-primary/10 font-bold shadow-sm">
                    {leg.trainNumber} {leg.trainName}
                  </span>
                  {idx < route.legs.length - 1 &&
                    route.legs[idx + 1].type !== "transfer" && (
                      <ArrowRight className="w-3 h-3 mx-1" />
                    )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Stats & Action */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6 gap-4">
          <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-2">
            <div className="flex flex-col items-center lg:items-end">
              <span className="text-xs text-foreground/50 font-medium">
                Reliability
              </span>
              <ReliabilityMeter
                score={route.reliabilityScore}
                className="scale-90 lg:scale-100"
              />
            </div>

            <div className="flex flex-col items-start lg:items-end">
              <span className="text-xs text-foreground/50 font-medium">
                Total Fare
              </span>
              <div className="text-2xl font-bold flex items-center text-accent">
                {route.totalFare}
              </div>
            </div>
          </div>

          <button className="hidden lg:flex px-6 py-2 bg-primary/10 text-primary font-bold rounded-full group-hover:bg-primary group-hover:text-white transition-colors items-center gap-2">
            Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RouteCard;
