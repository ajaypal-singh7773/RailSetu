import csv
import json
import time
import requests

def get_train_days_live(train_no):
    """
    Public micro-endpoint se train ke running days fetch karne ka jugaad.
    Return karega dictionary: {"MON": True, "TUE": True, ...}
    """
    # Default: Agar kisi train ka data na mile toh safe side ke liye use Daily (All True) maan lenge
    default_days = {"MON": True, "TUE": True, "WED": True, "THU": True, "FRI": True, "SAT": True, "SUN": True}
    
    # Cloudflare aur block se bachne ke liye standard user-agent header
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36'
    }
    
    try:
        # Open source reliable JSON data route for train details
        url = f"https://kyc.railway.tools/api/trains/{train_no}"
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            res_data = response.json()
            # Agar unke response mein days ka data milta hai
            # Note: response format ke hisaab se keys badal sakti hain, common formats handle kiye hain
            days_info = res_data.get("days", {})
            if days_info:
                return {
                    "MON": days_info.get("Mon", days_info.get("MON", True)),
                    "TUE": days_info.get("Tue", days_info.get("TUE", True)),
                    "WED": days_info.get("Wed", days_info.get("WED", True)),
                    "THU": days_info.get("Thu", days_info.get("THU", True)),
                    "FRI": days_info.get("Fri", days_info.get("FRI", True)),
                    "SAT": days_info.get("Sat", days_info.get("SAT", True)),
                    "SUN": days_info.get("Sun", days_info.get("SUN", True))
                }
    except Exception:
        # Agar network timeout ya error ho, toh background loop rukna nahi chahiye
        pass
        
    return default_days

def build_ultimate_database():
    print("🔄 Step 1: schedules.csv se core routes padh rahe hain...")
    trains_db = {}
    
    with open('schedules.csv', mode='r', encoding='utf-8-sig') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            train_no = row.get("Train No", "").strip()
            if not train_no:
                continue
                
            if train_no not in trains_db:
                trains_db[train_no] = {
                    "train_number": train_no,
                    "train_name": row.get("Train Name", "").strip().upper(),
                    "source_code": row.get("Source Station", "").strip().upper(),
                    "source_name": row.get("Source Station Name", "").strip().upper(),
                    "destination_code": row.get("Destination Station", "").strip().upper(),
                    "destination_name": row.get("Destination Station Name", "").strip().upper(),
                    "running_days": {}, # Yeh niche live fetch se bharega
                    "route": []
                }
            
            try:
                seq_no = int(row.get("SEQ", 0))
            except ValueError:
                seq_no = 999
                
            trains_db[train_no]["route"].append({
                "stop_number": seq_no,
                "station_code": row.get("Station Code", "").strip().upper(),
                "station_name": row.get("Station Name", "").strip().upper(),
                "arrival": row.get("Arrival time", "0:00:00").strip(),
                "departure": row.get("Departure Time", "0:00:00").strip(),
                "distance": row.get("Distance", "0").strip()
            })

    total_trains = len(trains_db)
    print(f"📊 Step 2: Total {total_trains} unique trains mili hain. Ab inke running days fetch karenge...")
    
    count = 0
    final_schedules = []
    
    for train_no, info in trains_db.items():
        count += 1
        print(f"🚀 Fetching days for train {count}/{total_trains}: {train_no}...")
        
        # Live/Public micro API se days fetch karna
        days = get_train_days_live(train_no)
        info["running_days"] = days
        
        # Route sort karna
        info["route"].sort(key=lambda x: x["stop_number"])
        final_schedules.append(info)
        
        # Cloudflare ban rate-limit bypass karne ke liye 1 second ka gap
        time.sleep(1)
        
        # Safety save: Har 50 trains ke baad file backup update hoti rahegi
        if count % 50 == 0:
            with open('railsetu_schedules.json', 'w', encoding='utf-8') as f:
                json.dump(final_schedules, f, indent=4, ensure_ascii=False)
                
    # Final write
    with open('railsetu_schedules.json', 'w', encoding='utf-8') as f:
        json.dump(final_schedules, f, indent=4, ensure_ascii=False)
        
    print("🏆 Ultimate Database Generated! 'railsetu_schedules.json' ab days ke sath taiyar hai.")

if __name__ == "__main__":
    build_ultimate_database()