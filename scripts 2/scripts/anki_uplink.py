import urllib.request
import json
import requests
import datetime

# --- CONFIGURATION ---
VERCEL_ENDPOINT = "https://vestrippn.vercel.app/api/anki/sync"
API_SECRET = "vestrippn"  # Must match your Vercel env variable
OPERATOR_EMAIL = "ativichkaiau2549@gmail.com"

def request_anki(action, **params):
    """Sends a local request to AnkiConnect"""
    requestJson = json.dumps({'action': action, 'params': params, 'version': 6}).encode('utf-8')
    response = json.load(urllib.request.urlopen(urllib.request.Request('http://localhost:8765', requestJson)))
    if len(response) != 2:
        raise Exception('Response has an unexpected number of fields')
    if 'error' not in response:
        raise Exception('Response is missing required error field')
    if 'result' not in response:
        raise Exception('Response is missing required result field')
    if response['error'] is not None:
        raise Exception(response['error'])
    return response['result']

def sync_to_cloud():
    try:
        print("[UPLINK] Gathering local Anki telemetry...")
        
        # Get deck stats (simplified for the dashboard)
        # In a real scenario, you'd aggregate the stats from 'getCollectionStatsHTML' or query specific decks
        deck_stats = request_anki('getDeckStats', decks=['Default']) 
        
        # Example queries to get specific card counts
        due_cards = len(request_anki('findCards', query="is:due"))
        new_cards = len(request_anki('findCards', query="is:new"))
        reviewed_today = len(request_anki('findCards', query="rated:1"))
        
        # Construct the payload
        payload = {
            "email": OPERATOR_EMAIL,
            "due": due_cards,
            "newCards": new_cards,
            "reviewedToday": reviewed_today,
            "streak": 12 # You can calculate streak by analyzing review history logs
        }

        print(f"[UPLINK] Transmitting to Vercel Cloud: {payload}")
        
        headers = {"Authorization": f"Bearer {API_SECRET}", "Content-Type": "application/json"}
        response = requests.post(VERCEL_ENDPOINT, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("[UPLINK] Transmission Successful.")
        else:
            print(f"[UPLINK] Transmission Failed: {response.text}")

    except Exception as e:
        print(f"[CRITICAL] AnkiConnect offline or Error: {e}")

if __name__ == '__main__':
    sync_to_cloud()