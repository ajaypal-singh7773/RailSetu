const fs = require('fs');
const expTrains = JSON.parse(fs.readFileSync('public/data/trains/EXP-TRAINS.json'));
const passTrains = JSON.parse(fs.readFileSync('public/data/trains/PASS-TRAINS.json'));
const sfTrains = JSON.parse(fs.readFileSync('public/data/trains/SF-TRAINS.json'));
const masterTrains = [...expTrains, ...passTrains, ...sfTrains];

const from = 'NGO';
const to = 'NDLS';
const dayName = 'FRI';
const searchDayIdx = 5; // FRI = 5
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MINUTES_IN_WEEK = 7 * 24 * 60;

function getMinutes(timeStr, dayStr) {
  if (!timeStr || timeStr === "Source" || timeStr === "Destination") return null;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  return (parseInt(dayStr || "1", 10) - 1) * 24 * 60 + parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

let stationToTrains = {};
masterTrains.forEach(train => {
  if (train.trainRoute && Array.isArray(train.trainRoute)) {
    train.trainRoute.forEach((s, idx) => {
      const parts = (s.stationName || "").split(" - ");
      const code = parts[parts.length - 1]?.trim();
      if (code) {
        if (!stationToTrains[code]) stationToTrains[code] = [];
        stationToTrains[code].push({ train, stopIndex: idx, stopDetails: s });
      }
    });
  }
});

const trainsFromX = stationToTrains[from] || [];
const validTrainsFromX = trainsFromX.filter(t => t.train.runningDays && t.train.runningDays[DAYS[searchDayIdx]]);

const indirectRoutes = [];

for (const t1 of validTrainsFromX) {
  const trainA = t1.train;
  const startIndexA = t1.stopIndex;
  
  for (let i = startIndexA + 1; i < trainA.trainRoute.length; i++) {
    const stopZ = trainA.trainRoute[i];
    const parts = (stopZ.stationName || "").split(" - ");
    const zCode = parts[parts.length - 1]?.trim();
    
    if (!zCode) continue;
    
    const arrA_str = stopZ.arrives === "Destination" ? stopZ.departs : stopZ.arrives;
    const arrA_mins = getMinutes(arrA_str, stopZ.day);
    if (arrA_mins === null) continue;
    
    const arrivalAbsolute = searchDayIdx * 24 * 60 + arrA_mins;
    
    const matchingTrainsB = (stationToTrains[zCode] || []).filter(t2 => {
      const trainB = t2.train;
      const zIndexB = t2.stopIndex;
      
      if (!trainB.trainRoute) return false;
      const destY = trainB.trainRoute.slice(zIndexB + 1).find((s) => s.stationName?.endsWith(`- ${to}`));
      if (!destY) return false;
      
      const depB_str = t2.stopDetails.departs === "Source" ? t2.stopDetails.arrives : t2.stopDetails.departs;
      const depB_mins = getMinutes(depB_str, t2.stopDetails.day);
      if (depB_mins === null) return false;
      
      let validLayover = false;
      for (let d = 0; d < 7; d++) {
        if (trainB.runningDays && trainB.runningDays[DAYS[d]]) {
          let departAbsolute = d * 24 * 60 + depB_mins;
          if (departAbsolute <= arrivalAbsolute) {
            departAbsolute += MINUTES_IN_WEEK;
          }
          const diff = departAbsolute - arrivalAbsolute;
          if (diff > 0 && diff <= 12 * 60) {
            validLayover = true;
            break;
          }
        }
      }
      return validLayover;
    });
    
    for (const t2 of matchingTrainsB) {
      indirectRoutes.push({ train1: trainA.trainNumber, train2: t2.train.trainNumber, z: zCode });
    }
  }
}

console.log("Indirect routes found:", indirectRoutes.length);
if (indirectRoutes.length > 0) {
    console.log(indirectRoutes.slice(0, 3));
}
