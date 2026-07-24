const express = require('express');
const cors = require('cors');
const { getDb } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

let db;
getDb().then(database => {
    db = database;
    console.log("Connected to SQLite Database");
}).catch(console.error);

app.get('/api/routes', async (req, res) => {
    const { from, to, date } = req.query;
    
    if (!from || !to) {
        return res.status(400).json({ error: "Missing 'from' or 'to' query parameters." });
    }
    
    let dayOfWeek = "";
    if (date) {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
            dayOfWeek = d.getDay().toString();
        }
    }
    if (dayOfWeek === "") {
        dayOfWeek = new Date().getDay().toString();
    }
    const dayFilter = `%${dayOfWeek}%`;
    
    try {
        // Find direct trains
        const directTrains = await db.all(`
            SELECT 
                s1.train_number, t.train_name, 
                s1.station_code AS from_station, s1.departure_time, 
                s2.station_code AS to_station, s2.arrival_time,
                s2.distance - s1.distance AS distance
            FROM stops s1
            JOIN stops s2 ON s1.train_number = s2.train_number
            JOIN trains t ON s1.train_number = t.train_number
            WHERE s1.station_code = ? AND s2.station_code = ? 
              AND s1.id < s2.id
              AND t.days_running LIKE ?
            ORDER BY s1.departure_time ASC
        `, [from, to, dayFilter]);
        
        if (directTrains.length > 0) {
            return res.json({
                type: 'direct',
                message: `Found ${directTrains.length} direct trains.`,
                routes: directTrains
            });
        }
        
        // If no direct trains, find 1-stop transfers
        // Limiting to 50 results to prevent overloading
        const indirectTrains = await db.all(`
            SELECT 
                t1.train_number AS train1, t1.train_name AS train1_name, 
                s1_start.station_code AS from_station, s1_start.departure_time AS train1_dep,
                s1_end.station_code AS transfer_station, s1_end.arrival_time AS train1_arr,
                
                t2.train_number AS train2, t2.train_name AS train2_name,
                s2_start.departure_time AS train2_dep,
                s2_end.station_code AS to_station, s2_end.arrival_time AS train2_arr,
                
                -- Calculate wait time in minutes using modulo arithmetic
                (
                  (strftime('%H', s2_start.departure_time) * 60 + strftime('%M', s2_start.departure_time)) 
                  - 
                  (strftime('%H', s1_end.arrival_time) * 60 + strftime('%M', s1_end.arrival_time)) 
                  + 1440
                ) % 1440 AS wait_time_mins

            FROM stops s1_start
            JOIN stops s1_end ON s1_start.train_number = s1_end.train_number
            JOIN trains t1 ON s1_start.train_number = t1.train_number
            
            JOIN stops s2_start ON s1_end.station_code = s2_start.station_code
            JOIN stops s2_end ON s2_start.train_number = s2_end.train_number
            JOIN trains t2 ON s2_start.train_number = t2.train_number
            
            WHERE s1_start.station_code = ?
              AND s2_end.station_code = ?
              AND s1_start.id < s1_end.id
              AND s2_start.id < s2_end.id
              AND t1.train_number != t2.train_number
              AND t1.days_running LIKE ?
              
              -- Only allow connections with 1 to 12 hours of wait time
              AND wait_time_mins >= 60 
              AND wait_time_mins <= 720
              
            ORDER BY wait_time_mins ASC
            LIMIT 20
        `, [from, to, dayFilter]);
        
        return res.json({
            type: 'indirect',
            message: `No direct trains found. Found ${indirectTrains.length} indirect routes.`,
            routes: indirectTrains
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while searching routes." });
    }
});

app.get('/api/stations', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    try {
        const stations = await db.all(`
            SELECT DISTINCT station_code, station_name 
            FROM stops 
            WHERE station_code LIKE ? OR station_name LIKE ?
            LIMIT 10
        `, [`${q}%`, `${q}%`]);
        res.json(stations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
});
