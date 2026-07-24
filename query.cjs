const fs = require('fs');
const expTrains = JSON.parse(fs.readFileSync('public/data/trains/EXP-TRAINS.json'));
const passTrains = JSON.parse(fs.readFileSync('public/data/trains/PASS-TRAINS.json'));
const sfTrains = JSON.parse(fs.readFileSync('public/data/trains/SF-TRAINS.json'));
const masterTrains = [...expTrains, ...passTrains, ...sfTrains];

const from = 'NGO';
const toStations = ['DLI', 'NDLS', 'DEE', 'NZM'];

const allRoutes = masterTrains.filter(train => {
  let fromIndex = -1;
  let toIndex = -1;
  if (train.trainRoute && Array.isArray(train.trainRoute)) {
    for (let i = 0; i < train.trainRoute.length; i++) {
      const s = train.trainRoute[i];
      if (s.stationName.endsWith(`- ${from}`)) {
        fromIndex = i;
      }
      for (const to of toStations) {
          if (s.stationName.endsWith(`- ${to}`)) {
            toIndex = i;
            break;
          }
      }
    }
  }
  return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
});

console.log("Trains Found any day:", allRoutes.length);
allRoutes.forEach(t => {
    console.log(`- ${t.trainNumber} ${t.trainName} (Days: ${Object.keys(t.runningDays).filter(d => t.runningDays[d]).join(',')})`);
});
