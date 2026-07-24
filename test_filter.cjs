const fs = require('fs');
const expTrains = JSON.parse(fs.readFileSync('src/data/trains/EXP-TRAINS.json'));
const passTrains = JSON.parse(fs.readFileSync('src/data/trains/PASS-TRAINS.json'));
const sfTrains = JSON.parse(fs.readFileSync('src/data/trains/SF-TRAINS.json'));
const masterTrains = [...expTrains, ...passTrains, ...sfTrains];

console.log("Total trains:", masterTrains.length);
console.log("Sample train:", masterTrains[0].trainNumber, masterTrains[0].trainName);
console.log("Sample train running days:", masterTrains[0].runningDays);
console.log("Sample train route:", masterTrains[0].trainRoute.slice(0, 2));

const from = 'NDLS';
const to = 'CNB';
const date = new Date('2024-07-25'); // Thursday

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const dayName = days[date.getDay()];
console.log("Day:", dayName);

const results = masterTrains.filter(train => {
  if (!train.runningDays[dayName]) return false;
  
  let fromIndex = -1;
  let toIndex = -1;
  
  for (let i = 0; i < train.trainRoute.length; i++) {
    const s = train.trainRoute[i];
    if (s.stationName.endsWith(`- ${from}`)) {
      fromIndex = i;
    }
    if (s.stationName.endsWith(`- ${to}`)) {
      toIndex = i;
    }
  }
  
  return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
});

console.log("Found routes:", results.length);
if (results.length > 0) {
    console.log("First result:", results[0].trainNumber, results[0].trainName);
}
