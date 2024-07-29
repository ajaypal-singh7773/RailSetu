import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRightLeft, Search, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "../utils/cn";
import stationData from "../data/railsetu_stations.json";

let masterTrains = [];
let isDataLoaded = false;
let stationToTrains = {};

const CANONICAL_CODES = {
  "MGS": "DDU",
};
const getCanonicalCode = (code) => CANONICAL_CODES[code] || code;
const extractCode = (stationName) => {
  const parts = (stationName || "").split(" - ");
  return getCanonicalCode(parts[parts.length - 1]?.trim());
};

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MINUTES_IN_WEEK = 7 * 24 * 60;

function getMinutes(timeStr, dayStr) {
  if (!timeStr || timeStr === "Source" || timeStr === "Destination")
    return null;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  return (
    (parseInt(dayStr || "1", 10) - 1) * 24 * 60 +
    parseInt(parts[0], 10) * 60 +
    parseInt(parts[1], 10)
  );
}
// Load the huge datasets asynchronously from the public folder to avoid Vite bundler OOM crashes
if (typeof window !== "undefined") {
  Promise.all([
    fetch("/data/trains/EXP-TRAINS.json").then((res) => res.json()),
    fetch("/data/trains/PASS-TRAINS.json").then((res) => res.json()),
    fetch("/data/trains/SF-TRAINS.json").then((res) => res.json()),
  ])
    .then(([exp, pass, sf]) => {
      masterTrains = [...exp, ...pass, ...sf];
      isDataLoaded = true;
      // Build optimized adjacency graph for Multi-Hop Routing O(1) lookups
      masterTrains.forEach((train) => {
        if (train.trainRoute && Array.isArray(train.trainRoute)) {
          train.trainRoute.forEach((s, idx) => {
            const code = extractCode(s.stationName);
            if (code) {
              if (!stationToTrains[code]) stationToTrains[code] = [];
              stationToTrains[code].push({
                train,
                stopIndex: idx,
                stopDetails: s,
              });
            }
          });
        }
      });

      console.log(
        "Master trains dataset completely loaded & indexed:",
        masterTrains.length,
      );
    })
    .catch((err) => {
      console.error("Failed to load train dataset:", err);
    });
}

// Handle both the old GeoJSON format and the new flat array format
const rawData = stationData;
const ALL_STATIONS = Array.isArray(rawData)
  ? rawData.filter((p) => p.name && p.code)
  : (rawData.features || [])
      .map((f) => f.properties)
      .filter((p) => p.name && p.code);

const SearchCard = ({ className }) => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date());
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (from.length >= 2 && showFrom) {
      const q = from.toLowerCase();
      const filtered = ALL_STATIONS.filter(
        (s) =>
          (s.code && s.code.toLowerCase().includes(q)) ||
          (s.name && s.name.toLowerCase().includes(q)),
      ).slice(0, 10);
      setFromSuggestions(filtered);
    } else {
      setFromSuggestions([]);
    }
  }, [from, showFrom]);

  useEffect(() => {
    if (to.length >= 2 && showTo) {
      const q = to.toLowerCase();
      const filtered = ALL_STATIONS.filter(
        (s) =>
          (s.code && s.code.toLowerCase().includes(q)) ||
          (s.name && s.name.toLowerCase().includes(q)),
      ).slice(0, 10);
      setToSuggestions(filtered);
    } else {
      setToSuggestions([]);
    }
  }, [to, showTo]);
  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isDataLoaded) {
      alert(
        "Please wait a moment while the highly accurate offline dataset is being prepared...",
      );
      return;
    }

    let resolvedFromCode = "";
    let resolvedToCode = "";

    const fromMatch = ALL_STATIONS.find(s => s.name.toLowerCase() === from.toLowerCase() || s.code.toLowerCase() === from.toLowerCase());
    if (fromMatch) {
      resolvedFromCode = getCanonicalCode(fromMatch.code);
    } else {
      resolvedFromCode = getCanonicalCode(from.toUpperCase());
    }

    const toMatch = ALL_STATIONS.find(s => s.name.toLowerCase() === to.toLowerCase() || s.code.toLowerCase() === to.toLowerCase());
    if (toMatch) {
      resolvedToCode = getCanonicalCode(toMatch.code);
    } else {
      resolvedToCode = getCanonicalCode(to.toUpperCase());
    }

    let dateStr = "";
    let dayName = "MON";
    if (date) {
      dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      dayName = days[date.getDay()];
    }

    // 100% offline filtering engine - Direct Search First
    let results = masterTrains
      .filter((train) => {
        // Date to Day conversion check
        if (!train.runningDays || !train.runningDays[dayName]) return false;
        let fromIndex = -1;
        let toIndex = -1;
        // Route sequence validation
        if (train.trainRoute && Array.isArray(train.trainRoute)) {
          for (let i = 0; i < train.trainRoute.length; i++) {
            const s = train.trainRoute[i];
            const sCode = extractCode(s.stationName);
            if (sCode === resolvedFromCode) {
              fromIndex = i;
            }
            if (sCode === resolvedToCode) {
              toIndex = i;
            }
          }
        }
        return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
      })
      .map((t) => ({ type: "direct", train: t }));

    // If no direct routes found, trigger Multi-Hop Routing logic (Constraint 1)
    if (results.length === 0) {
      const searchDayIdx = date ? date.getDay() : 1;
      const trainsFromX = stationToTrains[resolvedFromCode] || [];
      // Filter trains leaving X on the correct day
      const validTrainsFromX = trainsFromX.filter(
        (t) => t.train.runningDays && t.train.runningDays[DAYS[searchDayIdx]],
      );
      const indirectRoutes = [];
      for (const t1 of validTrainsFromX) {
        const trainA = t1.train;
        const startIndexA = t1.stopIndex;
        // Check all intermediate stations Z after X on Train A
        for (let i = startIndexA + 1; i < trainA.trainRoute.length; i++) {
          const stopZ = trainA.trainRoute[i];
          const zCode = extractCode(stopZ.stationName);
          if (!zCode) continue;
          // Arrival time of Train A at Z
          const arrA_str =
            stopZ.arrives === "Destination" ? stopZ.departs : stopZ.arrives;
          const arrA_mins = getMinutes(arrA_str, stopZ.day);
          if (arrA_mins === null) continue;
          const arrivalAbsolute = searchDayIdx * 24 * 60 + arrA_mins;
          // Look for Train B from Z to Y
          const matchingTrainsB = (stationToTrains[zCode] || []).filter(
            (t2) => {
              const trainB = t2.train;
              const zIndexB = t2.stopIndex;
              // Train B must eventually go to Y after Z
              if (!trainB.trainRoute) return false;
              const destY = trainB.trainRoute
                .slice(zIndexB + 1)
                .find((s) => extractCode(s.stationName) === resolvedToCode);
              if (!destY) return false;
              const depB_str =
                t2.stopDetails.departs === "Source"
                  ? t2.stopDetails.arrives
                  : t2.stopDetails.departs;
              const depB_mins = getMinutes(depB_str, t2.stopDetails.day);
              if (depB_mins === null) return false;
              let validLayover = false;
              let waitTime = 0;
              let trainB_StartDay = "";
              // Constraint 2 & 3: Train B departure must be strictly AFTER Train A arrival, but diff <= 12 hours
              for (let d = 0; d < 7; d++) {
                if (trainB.runningDays && trainB.runningDays[DAYS[d]]) {
                  let departAbsolute = d * 24 * 60 + depB_mins;
                  if (departAbsolute <= arrivalAbsolute) {
                    departAbsolute += MINUTES_IN_WEEK; // allow wrapping to next week
                  }
                  const diff = departAbsolute - arrivalAbsolute;
                  if (diff > 0 && diff <= 12 * 60) {
                    validLayover = true;
                    waitTime = diff;
                    trainB_StartDay = DAYS[d];
                    break;
                  }
                }
              }
              if (validLayover) {
                t2._tempWaitTime = waitTime;
                t2._tempDestY = destY;
                t2._tempStartDay = trainB_StartDay;
                t2._tempDepMins = depB_mins;
                return true;
              }
              return false;
            },
          );
          for (const t2 of matchingTrainsB) {
            indirectRoutes.push({
              type: "indirect",
              train1: trainA,
              train2: t2.train,
              transferStationCode: zCode,
              transferStationName: stopZ.stationName,
              waitTime: t2._tempWaitTime,
              destY: t2._tempDestY,
              train1ArrivalMins: arrA_mins,
              train2DepartureMins: t2._tempDepMins,
            });
          }
        }
      }
      // Deduplicate routes with the same train1 and train2, keeping the one with the highest layover
      const uniqueRoutesMap = new Map();
      for (const route of indirectRoutes) {
        const key = `${route.train1.trainNumber}-${route.train2.trainNumber}`;
        if (!uniqueRoutesMap.has(key)) {
          uniqueRoutesMap.set(key, route);
        } else {
          const existing = uniqueRoutesMap.get(key);
          if (route.waitTime > existing.waitTime) {
            uniqueRoutesMap.set(key, route);
          }
        }
      }
      
      const uniqueIndirectRoutes = Array.from(uniqueRoutesMap.values());

      // Sort indirect routes by wait time and take top 15
      uniqueIndirectRoutes.sort((a, b) => a.waitTime - b.waitTime);
      results = uniqueIndirectRoutes.slice(0, 15);
    }

    // Save to Recent Searches
    const searchRecord = { 
      from: resolvedFromCode, 
      to: resolvedToCode, 
      fromName: fromMatch ? fromMatch.name : from,
      toName: toMatch ? toMatch.name : to,
      date: dateStr 
    };
    try {
      const prevSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      const filteredSearches = prevSearches.filter(s => !(s.from === resolvedFromCode && s.to === resolvedToCode));
      const newSearches = [searchRecord, ...filteredSearches].slice(0, 3);
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
      setRecentSearches(newSearches);
    } catch (e) {
      console.error(e);
    }

    // We can pass the filtered results to the search results page via state
    navigate(`/search?from=${resolvedFromCode}&to=${resolvedToCode}&date=${dateStr}&fromName=${encodeURIComponent(searchRecord.fromName)}&toName=${encodeURIComponent(searchRecord.toName)}`, {
      state: { searchResults: results },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "glass-card p-6 md:p-8 w-full max-w-4xl mx-auto",
        className,
      )}
    >
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row items-center gap-4"
      >
        {/* From / To Wrapper */}
        <div className="flex flex-col md:flex-row w-full md:w-[60%] items-center relative gap-4 md:gap-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <input
              type="text"
              required
              value={from}
              onFocus={() => setShowFrom(true)}
              onBlur={() => setTimeout(() => setShowFrom(false), 200)}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="From Station (e.g. NDLS)"
              className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-foreground/50 font-medium"
            />

            {showFrom && fromSuggestions.length > 0 && (
              <ul className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700">
                {fromSuggestions.map((s, i) => (
                  <li
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent onBlur from firing first
                      setFrom(s.name);
                      setShowFrom(false);
                    }}
                    className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between"
                  >
                    <span className="font-medium text-foreground">
                      {s.name}
                    </span>
                    <span className="text-primary font-bold">{s.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-primary text-white shadow-lg hover:shadow-primary/40 hover:scale-110 active:scale-95 transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <input
              type="text"
              required
              value={to}
              onFocus={() => setShowTo(true)}
              onBlur={() => setTimeout(() => setShowTo(false), 200)}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To Station (e.g. BBS)"
              className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-foreground/50 font-medium md:pl-10"
            />

            {showTo && toSuggestions.length > 0 && (
              <ul className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700">
                {toSuggestions.map((s, i) => (
                  <li
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setTo(s.name);
                      setShowTo(false);
                    }}
                    className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between"
                  >
                    <span className="font-medium text-foreground">
                      {s.name}
                    </span>
                    <span className="text-primary font-bold">{s.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Date Picker */}
        <div className="relative w-full md:w-[25%] date-picker-wrapper">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            minDate={new Date()}
            dateFormat="dd MMM yyyy"
            className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground font-medium cursor-pointer"
            wrapperClassName="w-full"
            placeholderText="Select Date"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full md:w-[15%] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-2xl py-4 px-6 font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-1 transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="md:hidden">Search</span>
        </button>
      </form>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3"
        >
          <span className="text-sm font-medium text-foreground/60 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Recent:
          </span>
          {recentSearches.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setFrom(s.fromName || s.from);
                setTo(s.toName || s.to);
                setDate(new Date(s.date));
              }}
              className="px-4 py-1.5 bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700 rounded-full border border-white/40 dark:border-slate-700 shadow-sm hover:shadow transition-all text-xs font-semibold flex items-center gap-2 group"
            >
              <span className="text-foreground">{s.fromName || s.from}</span>
              <ArrowRightLeft className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-foreground">{s.toName || s.to}</span>
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchCard;
