import requests
import json

def get_accurate_stations():
    print("Fetching accurate stations from eRail...")
    url = "https://erail.in/data/stations.json"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            raw_data = response.json()
            cleaned_stations = [{"code": st[0], "name": st[1]} for st in raw_data if len(st) >= 2]
            with open("railsetu_stations.json", "w", encoding="utf-8") as f:
                json.dump(cleaned_stations, f, ensure_ascii=False, indent=4)
            print(f"Success! {len(cleaned_stations)} accurate stations saved.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_accurate_stations()
