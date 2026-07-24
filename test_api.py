import requests
import json

def test_single_train():
    url = "https://kyc.railway.tools/api/trains/12371"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36'
    }
    
    print("⏳ Fetching live data for Train 12371...")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("📦 Raw API Response:")
            print(json.dumps(data, indent=4))
        else:
            print(f"❌ Error Output: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_single_train()
