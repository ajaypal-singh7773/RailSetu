import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

const ReliabilityMeter = ({ score, className }) => {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const duration = 1500; // ms
    const steps = 60;
    const stepTime = Math.abs(Math.floor(duration / steps));
    let current = 0;
    const timer = setInterval(() => {
      current += score / steps;
      if (current >= score) {
        setCurrentScore(score);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Determine color based on score
  let colorClass = "text-green-500";
  let strokeClass = "stroke-green-500";
  if (score < 60) {
    colorClass = "text-red-500";
    strokeClass = "stroke-red-500";
  } else if (score < 80) {
    colorClass = "text-yellow-500";
    strokeClass = "stroke-yellow-500";
  }

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-16 h-16",
        className,
      )}
    >
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-border dark:text-slate-800"
        />

        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={strokeClass}
          strokeLinecap="round"
        />
      </svg>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center font-bold text-sm",
          colorClass,
        )}
      >
        {currentScore}%
      </div>
    </div>
  );
};

export default ReliabilityMeter;
