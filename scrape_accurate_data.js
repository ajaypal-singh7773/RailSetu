import fs from 'fs';

async function getAccurateStations() {
    console.log("Fetching accurate stations from eRail...");
    const url = "https://erail.in/data/stations.json";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    try {
        const response = await fetch(url, { headers });
        if (response.ok) {
            const rawData = await response.json();
            const cleanedStations = rawData
                .filter(st => st.length >= 2)
                .map(st => ({
                    code: st[0],
                    name: st[1]
                }));
            
            fs.writeFileSync("railsetu_stations.json", JSON.stringify(cleanedStations, null, 4), "utf-8");
            console.log(`Success! ${cleanedStations.length} accurate stations saved.`);
        } else {
            console.error(`Error: HTTP ${response.status}`);
        }
    } catch (e) {
        console.error(`Error: ${e}`);
    }
}

getAccurateStations();
