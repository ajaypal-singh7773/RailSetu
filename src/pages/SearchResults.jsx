import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import RouteCard from "../components/RouteCard";
import FilterSidebar from "../components/FilterSidebar";
import { cn } from "../utils/cn";

// Utility to format minutes into "Xh Ym"
const formatMins = (mins) => {
  if (mins < 0) mins += 7 * 24 * 60; // handle wrap around week
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const CANONICAL_CODES = {
  "MGS": "DDU",
};
const getCanonicalCode = (code) => CANONICAL_CODES[code] || code;
const extractCode = (stationName) => {
  const parts = (stationName || "").split(" - ");
  return getCanonicalCode(parts[parts.length - 1]?.trim());
};

const getMinutes = (timeStr, dayStr) => {
  if (!timeStr || timeStr === "Source" || timeStr === "Destination") return 0;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return 0;
  return (
    (parseInt(dayStr || "1", 10) - 1) * 24 * 60 +
    parseInt(parts[0], 10) * 60 +
    parseInt(parts[1], 10)
  );
};

const getFormattedDate = (baseDate, timeStr, addedMins = 0) => {
  const d = new Date(baseDate);
  if (timeStr && timeStr !== "Source" && timeStr !== "Destination") {
    const [h, m] = timeStr.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  d.setMinutes(d.getMinutes() + addedMins);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
};

const SearchResults = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [sortBy, setSortBy] = useState("Fastest");
  const [selectedDepartureTimes, setSelectedDepartureTimes] = useState([]);
  const [selectedTransfers, setSelectedTransfers] = useState([]);

  const toggleDepartureTime = (timeId) => {
    setSelectedDepartureTimes((prev) => 
      prev.includes(timeId) ? prev.filter(id => id !== timeId) : [...prev, timeId]
    );
  };

  const toggleTransfers = (transferId) => {
    setSelectedTransfers((prev) => 
      prev.includes(transferId) ? prev.filter(id => id !== transferId) : [...prev, transferId]
    );
  };

  const urlParams = new URLSearchParams(window.location.search);
  const fromCode = urlParams.get("from") || "NGO";
  const toCode = urlParams.get("to") || "BBS";
  const fromName = urlParams.get("fromName") || fromCode;
  const toName = urlParams.get("toName") || toCode;
  const dateStr = urlParams.get("date");
  const dateObj = dateStr ? new Date(dateStr) : new Date();
  const displayDate = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    const searchResults = location.state?.searchResults;
    if (!searchResults) {
      setLoading(false);
      return;
    }
    // Transform raw search results into RouteCard format
    const formattedRoutes = searchResults.map((res, idx) => {
      if (res.type === "direct") {
        const train = res.train;
        const fromStop = train.trainRoute.find((s) =>
          extractCode(s.stationName) === getCanonicalCode(fromCode),
        );
        const toStop = train.trainRoute.find((s) =>
          extractCode(s.stationName) === getCanonicalCode(toCode),
        );
        const depStr = fromStop.departs === "Source" ? fromStop.arrives : fromStop.departs;
        const arrStr = toStop.arrives === "Destination" ? toStop.departs : toStop.arrives;
        const durationMins = getMinutes(arrStr, toStop.day) - getMinutes(depStr, fromStop.day);

        return {
          id: `route-dir-${idx}`,
          type: "direct",
          riskLevel: "Low",
          transfers: 0,
          from: fromStop.stationName,
          to: toStop.stationName,
          journeyTime: formatMins(durationMins),
          durationMins: durationMins,
          totalDistance: `${Math.abs(parseInt(toStop.distance || "0") - parseInt(fromStop.distance || "0"))} km`,
          rawDistance: Math.abs(parseInt(toStop.distance || "0") - parseInt(fromStop.distance || "0")),
          totalFare: `₹${Math.round(Math.abs(parseInt(toStop.distance || "0") - parseInt(fromStop.distance || "0")) * 1.5)}`,
          rawFare: Math.round(Math.abs(parseInt(toStop.distance || "0") - parseInt(fromStop.distance || "0")) * 1.5),
          reliabilityScore: 90 + (idx % 10), // mock
          date: displayDate,
          departureDate: getFormattedDate(dateObj, depStr, 0),
          arrivalDate: getFormattedDate(dateObj, depStr, durationMins),
          legs: [
            {
              trainNumber: train.trainNumber,
              trainName: train.trainName,
              from: fromStop.stationName,
              to: toStop.stationName,
              departure:
                fromStop.departs === "Source"
                  ? fromStop.arrives
                  : fromStop.departs,
              arrival:
                toStop.arrives === "Destination"
                  ? toStop.departs
                  : toStop.arrives,
              duration: formatMins(
                getMinutes(
                  toStop.arrives === "Destination"
                    ? toStop.departs
                    : toStop.arrives,
                  toStop.day,
                ) -
                  getMinutes(
                    fromStop.departs === "Source"
                      ? fromStop.arrives
                      : fromStop.departs,
                    fromStop.day,
                  ),
              ),
              distance: `${Math.abs(parseInt(toStop.distance || "0") - parseInt(fromStop.distance || "0"))} km`,
              departureDate: getFormattedDate(dateObj, depStr, 0),
              arrivalDate: getFormattedDate(dateObj, depStr, durationMins),
            },
          ],
        };
      } else {
        // Indirect Multi-Hop
        const t1 = res.train1;
        const t2 = res.train2;
        const fromStop = t1.trainRoute.find((s) =>
          extractCode(s.stationName) === getCanonicalCode(fromCode),
        );
        const zStop1 = t1.trainRoute.find((s) =>
          extractCode(s.stationName) === getCanonicalCode(res.transferStationCode),
        );
        const zStop2 = t2.trainRoute.find((s) =>
          extractCode(s.stationName) === getCanonicalCode(res.transferStationCode),
        );
        const toStop = res.destY;
        const dist1 = Math.abs(
          parseInt(zStop1.distance || "0") - parseInt(fromStop.distance || "0"),
        );
        const dist2 = Math.abs(
          parseInt(toStop.distance || "0") - parseInt(zStop2.distance || "0"),
        );
        
        const dep1Str = fromStop.departs === "Source" ? fromStop.arrives : fromStop.departs;
        const arr2Str = toStop.arrives === "Destination" ? toStop.departs : toStop.arrives;
        
        const durationMins1 = getMinutes(zStop1.arrives === "Destination" ? zStop1.departs : zStop1.arrives, zStop1.day) - getMinutes(dep1Str, fromStop.day);
        const durationMins2 = getMinutes(arr2Str, toStop.day) - getMinutes(zStop2.departs === "Source" ? zStop2.arrives : zStop2.departs, zStop2.day);
        const totalDurationMins = durationMins1 + res.waitTime + durationMins2;

        return {
          id: `route-ind-${idx}`,
          type: "indirect",
          riskLevel:
            res.waitTime > 240 ? "Low" : res.waitTime > 120 ? "Medium" : "High",
          transfers: 1,
          from: fromStop.stationName,
          to: toStop.stationName,
          journeyTime: formatMins(totalDurationMins),
          durationMins: totalDurationMins,
          totalDistance: `${dist1 + dist2} km`,
          rawDistance: dist1 + dist2,
          totalFare: `₹${Math.round((dist1 + dist2) * 1.5)}`,
          rawFare: Math.round((dist1 + dist2) * 1.5),
          reliabilityScore: 85 - (idx % 10), // mock
          date: displayDate,
          departureDate: getFormattedDate(dateObj, dep1Str, 0),
          arrivalDate: getFormattedDate(dateObj, dep1Str, totalDurationMins),
          transferStationName: res.transferStationName,
          waitTimeMins: res.waitTime,
          formattedWaitTime: formatMins(res.waitTime),
          legs: [
            {
              trainNumber: t1.trainNumber,
              trainName: t1.trainName,
              from: fromStop.stationName,
              to: zStop1.stationName,
              departure:
                fromStop.departs === "Source"
                  ? fromStop.arrives
                  : fromStop.departs,
              arrival:
                zStop1.arrives === "Destination"
                  ? zStop1.departs
                  : zStop1.arrives,
              duration: formatMins(
                getMinutes(
                  zStop1.arrives === "Destination"
                    ? zStop1.departs
                    : zStop1.arrives,
                  zStop1.day,
                ) -
                  getMinutes(
                    fromStop.departs === "Source"
                      ? fromStop.arrives
                      : fromStop.departs,
                    fromStop.day,
                  ),
              ),
              distance: `${dist1} km`,
              departureDate: getFormattedDate(dateObj, dep1Str, 0),
              arrivalDate: getFormattedDate(dateObj, dep1Str, durationMins1),
            },
            {
              type: "transfer",
              station: res.transferStationName,
              waitTime: formatMins(res.waitTime),
            },
            {
              trainNumber: t2.trainNumber,
              trainName: t2.trainName,
              from: zStop2.stationName,
              to: toStop.stationName,
              departure:
                zStop2.departs === "Source" ? zStop2.arrives : zStop2.departs,
              arrival:
                toStop.arrives === "Destination"
                  ? toStop.departs
                  : toStop.arrives,
              duration: formatMins(
                getMinutes(
                  toStop.arrives === "Destination"
                    ? toStop.departs
                    : toStop.arrives,
                  toStop.day,
                ) -
                  getMinutes(
                    zStop2.departs === "Source"
                      ? zStop2.arrives
                      : zStop2.departs,
                    zStop2.day,
                  ),
              ),
              distance: `${dist2} km`,
              departureDate: getFormattedDate(dateObj, dep1Str, durationMins1 + res.waitTime),
              arrivalDate: getFormattedDate(dateObj, dep1Str, totalDurationMins),
            },
          ],
        };
      }
    }).filter(route => route.durationMins <= 52 * 60);

    setRoutes(formattedRoutes);
    setLoading(false);
  }, [location.state, fromCode, toCode, displayDate]);

  const sorts = [
    "Fastest",
    "Least Transfers"
  ];

  const filteredRoutes = routes.filter(route => {
    // 1. Departure Time Filter
    if (selectedDepartureTimes.length > 0) {
      const depTimeStr = route.legs?.[0]?.departure;
      if (!depTimeStr) return false;
      
      const [h, m] = depTimeStr.split(":").map(Number);
      const totalMins = h * 60 + m;
      
      let isMatch = false;
      if (selectedDepartureTimes.includes("Morning") && totalMins >= 6 * 60 && totalMins < 12 * 60) isMatch = true;
      if (selectedDepartureTimes.includes("Afternoon") && totalMins >= 12 * 60 && totalMins < 18 * 60) isMatch = true;
      if (selectedDepartureTimes.includes("Evening") && totalMins >= 18 * 60 && totalMins < 24 * 60) isMatch = true;
      if (selectedDepartureTimes.includes("Night") && totalMins >= 0 && totalMins < 6 * 60) isMatch = true;
      
      if (!isMatch) return false;
    }

    // 2. Maximum Transfers Filter
    if (selectedTransfers.length > 0) {
      const numTransfers = route.transfers || 0;
      let maxAllowed = -1;
      
      if (selectedTransfers.includes("3+")) maxAllowed = 999;
      else if (selectedTransfers.includes("2")) maxAllowed = 2;
      else if (selectedTransfers.includes("1")) maxAllowed = 1;
      else if (selectedTransfers.includes("0")) maxAllowed = 0;
      
      if (numTransfers > maxAllowed) return false;
    }
    
    return true;
  });

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    if (sortBy === "Fastest") return a.durationMins - b.durationMins;
    if (sortBy === "Cheapest") return a.rawFare - b.rawFare;
    if (sortBy === "Least Transfers") return a.transfers - b.transfers;
    if (sortBy === "Highest Reliability") return b.reliabilityScore - a.reliabilityScore;
    return 0;
  });

  return (
    <div className="w-full animate-fade-in">
      {/* Search Summary Header */}
      <div className="glass-card p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 font-bold text-lg md:text-xl">
            <span className="text-primary">{fromName}</span>
            <ArrowRightLeft className="w-5 h-5 text-foreground/40" />
            <span className="text-primary">{toName}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {displayDate}
          </div>
        </div>

        <button className="px-5 py-2 rounded-full border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all text-sm">
          Modify Search
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 lg:w-1/5 shrink-0">
          <FilterSidebar 
            selectedDepartureTimes={selectedDepartureTimes}
            toggleDepartureTime={toggleDepartureTime}
            selectedTransfers={selectedTransfers}
            toggleTransfers={toggleTransfers}
          />
        </div>

        {/* Results Area */}
        <div className="w-full md:flex-1">
          {/* Sorting */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2">
            {sorts.map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  sortBy === sort
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white/50 dark:bg-slate-800/50 text-foreground/70 hover:bg-white dark:hover:bg-slate-700",
                )}
              >
                {sort}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-6">
            {!loading && routes.length > 0 && routes[0].type === "indirect" && (
              <div className="glass p-6 bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-2xl mb-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/20 rounded-full">
                    <ArrowRightLeft className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    No Direct Trains Found. Showing Best Connecting Routes
                  </h2>
                </div>
                <p className="text-foreground/70 ml-11">
                  We found smart multi-hop connections for you. Please check the
                  layover times at the intermediate stations carefully.
                </p>
              </div>
            )}

            {loading
              ? // Skeleton Loader
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass p-6 rounded-2xl w-full h-40 animate-shimmer bg-gradient-to-r from-white/20 via-white/40 to-white/20 dark:from-slate-800/20 dark:via-slate-700/40 dark:to-slate-800/20 bg-[length:400%_100%] border border-white/20 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 skeleton-shimmer"></div>
                  </div>
                ))
              : sortedRoutes.map((route, i) => (
                  <RouteCard key={route.id} route={route} index={i} />
                ))}

            {!loading && sortedRoutes.length === 0 && (
              <div className="text-center py-20">
                <img
                  src="/empty.svg"
                  alt="No routes"
                  className="w-48 h-48 mx-auto mb-6 opacity-80"
                />
                <h3 className="text-2xl font-bold mb-2">
                  No suitable connections found
                </h3>
                <p className="text-foreground/60 mb-6">
                  Try adjusting your filters or date to see more options.
                </p>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-full bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Try Different Route
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
