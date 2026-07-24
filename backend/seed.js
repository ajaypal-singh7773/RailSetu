const axios = require('axios');
const { getDb } = require('./db');

// Datameet schedules JSON URL (using trains.json as fallback if schedules is not available in that repo, but schedules.json is standard for stops)
// If the actual repo uses a different structure, this script parses an array of schedules.
const SCHEDULES_URL = 'https://raw.githubusercontent.com/datameet/railways/master/schedules.json';

async function seed() {
  try {
    const db = await getDb();

    console.log('Fetching schedule data from datameet/railways...');
    let schedulesData = [];
    try {
      const response = await axios.get(SCHEDULES_URL);
      schedulesData = response.data;
      if (!Array.isArray(schedulesData)) {
          // If it's a FeatureCollection or object containing the array
          schedulesData = schedulesData.features || schedulesData.data || schedulesData;
      }
    } catch (e) {
      console.warn('Failed to fetch from datameet. Using fallback mock data for MVP...', e.message);
      // Fallback data matching the user's requested schema for Nagaur -> Bhubaneswar
      schedulesData = [
        {
          train_number: "14813",
          train_name: "BME DEE EXP",
          station_code: "NGO",
          station_name: "NAGAUR",
          arrival: "05:55:00",
          departure: "06:00:00",
          day: 1,
          distance: 0,
          stop_number: 1
        },
        {
          train_number: "14813",
          train_name: "BME DEE EXP",
          station_code: "NDLS",
          station_name: "NEW DELHI",
          arrival: "14:00:00",
          departure: "14:15:00",
          day: 1,
          distance: 450,
          stop_number: 2
        },
        {
          train_number: "12802",
          train_name: "PURUSHOTTAM EXP",
          station_code: "NDLS",
          station_name: "NEW DELHI",
          arrival: "16:45:00",
          departure: "17:00:00",
          day: 1,
          distance: 0,
          stop_number: 1
        },
        {
          train_number: "12802",
          train_name: "PURUSHOTTAM EXP",
          station_code: "BBS",
          station_name: "BHUBANESWAR",
          arrival: "16:15:00",
          departure: "16:15:00",
          day: 2,
          distance: 1400,
          stop_number: 20
        },
        {
          train_number: "12345",
          train_name: "DIRECT EXP",
          station_code: "NGO",
          station_name: "NAGAUR",
          arrival: "10:00:00",
          departure: "10:05:00",
          day: 1,
          distance: 0,
          stop_number: 1
        },
        {
          train_number: "12345",
          train_name: "DIRECT EXP",
          station_code: "BBS",
          station_name: "BHUBANESWAR",
          arrival: "22:00:00",
          departure: "22:00:00",
          day: 2,
          distance: 1800,
          stop_number: 30
        }
      ];
    }

    console.log('Clearing existing data...');
    await db.exec('DELETE FROM stops; DELETE FROM trains;');

    console.log('Inserting trains and stops...');
    
    // Extract unique trains
    const trainsMap = new Map();
    for (const stop of schedulesData) {
       if (!trainsMap.has(stop.train_number)) {
           trainsMap.set(stop.train_number, {
               train_number: stop.train_number,
               train_name: stop.train_name || "UNKNOWN",
               days_running: "All Days" // placeholder as datameet might not have specific days in this file
           });
       }
    }

    // Insert Trains
    const insertTrain = await db.prepare('INSERT INTO trains (train_number, train_name, days_running) VALUES (?, ?, ?)');
    for (const train of trainsMap.values()) {
        await insertTrain.run(train.train_number, train.train_name, train.days_running);
    }
    await insertTrain.finalize();

    // Insert Stops
    const insertStop = await db.prepare(`
      INSERT INTO stops (train_number, station_code, station_name, arrival_time, departure_time, day, stop_number, distance) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const stop of schedulesData) {
        // datameet JSON properties are sometimes nested in 'properties'
        const props = stop.properties || stop; 
        
        await insertStop.run(
            props.train_number || props.train_No,
            props.station_code || props.station_Code,
            props.station_name || props.station_Name,
            props.arrival || props.Arrival_time,
            props.departure || props.Departure_Time,
            props.day || 1,
            props.stop_number || props.islno || 1,
            props.distance || props.Distance || 0
        );
    }
    await insertStop.finalize();

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

seed();
