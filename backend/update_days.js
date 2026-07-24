const { getDb } = require('./db');

async function updateDays() {
    const db = await getDb();
    console.log("Updating running days for all trains...");
    
    const trains = await db.all('SELECT train_number FROM trains');
    
    for (let t of trains) {
        // Real BME DEE EXP 14813 runs Mon, Sat.
        // We'll map: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        let days = "0,1,2,3,4,5,6"; 
        
        if (t.train_number === "14813" || t.train_number === "14814") {
            days = "1,6"; // Mon, Sat
        } else {
            const num = parseInt(t.train_number, 10);
            if (!isNaN(num)) {
                if (num % 3 === 0) days = "1,3,5";       // Mon, Wed, Fri
                else if (num % 3 === 1) days = "0,2,4,6"; // Sun, Tue, Thu, Sat
                else days = "0,1,2,3,4,5,6";              // Daily
            }
        }
        await db.run('UPDATE trains SET days_running = ? WHERE train_number = ?', [days, t.train_number]);
    }
    
    console.log("Finished updating days!");
}

updateDays();
