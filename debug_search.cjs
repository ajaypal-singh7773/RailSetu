const fs = require('fs');
const expTrains = JSON.parse(fs.readFileSync('public/data/trains/EXP-TRAINS.json'));
const passTrains = JSON.parse(fs.readFileSync('public/data/trains/PASS-TRAINS.json'));
const sfTrains = JSON.parse(fs.readFileSync('public/data/trains/SF-TRAINS.json'));
const masterTrains = [...expTrains, ...passTrains, ...sfTrains];

const from = 'NGO';
const to = 'DEE';
const dayName = 'FRI';

let results = masterTrains.filter((train) => {
  if (!train.runningDays || !train.runningDays[dayName]) return false;
  
  let fromIndex = -1;
  let toIndex = -1;
  
  if (train.trainRoute && Array.isArray(train.trainRoute)) {
    for (let i = 0; i < train.trainRoute.length; i++) {
      const s = train.trainRoute[i];
      if (s.stationName && s.stationName.endsWith(`- ${from}`)) {
        fromIndex = i;
      }
      if (s.stationName && s.stationName.endsWith(`- ${to}`)) {
        toIndex = i;
      }
    }
  }
  
  return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
}).map(t => ({ type: 'direct', train: t }));

console.log("Direct Results for", from, "to", to, "on", dayName, ":", results.length);
if (results.length > 0) {
   console.log(results[0].train.trainNumber, results[0].train.trainName);
}
