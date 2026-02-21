import os, json
import requests
from dotenv import load_dotenv

BASE = "https://www.space-track.org"

def login(session, user, pw):
    r = session.post(
        f"{BASE}/ajaxauth/login",
        data={"identity": user, "password": pw},
        timeout=30
    )
    r.raise_for_status()

def fetch_gp(session, limit=250):
    # gp = latest general perturbations + TLE lines + basic metadata
    url = (
        f"{BASE}/basicspacedata/query/class/gp/"
        f"orderby/EPOCH desc/"
        f"limit/{limit}/format/json"
    )
    r = session.get(url, timeout=30)
    r.raise_for_status()
    return r.json()

def build_single_json(records):
    objects = []
    for obj in records:
        norad = str(obj.get("NORAD_CAT_ID", "")).strip()
        if not norad:
            continue

        objects.append({
            "noradId": norad,
            "name": (obj.get("OBJECT_NAME") or "").strip(),
            "type": (obj.get("OBJECT_TYPE") or "").strip(),  # often PAYLOAD/DEBRIS/ROCKET BODY
            "epoch": (obj.get("EPOCH") or "").strip(),
            "tle": {
                "line1": (obj.get("TLE_LINE1") or "").strip(),
                "line2": (obj.get("TLE_LINE2") or "").strip()
            },

            # 👇 YOU will edit this later for a few interesting objects
            "education": None
        })

    # Python doesn't have 'null' — replace with None after paste fix below
    return objects

def main():
    load_dotenv()
    user = os.getenv("SPACE_TRACK_USERNAME")
    pw = os.getenv("SPACE_TRACK_PASSWORD")

    if not user or not pw:
        print("Missing SPACETRACK_USER / SPACETRACK_PASS in .env")
        return

    with requests.Session() as s:
        login(s, user, pw)
        records = fetch_gp(s, limit=250)

    # Build objects list safely (fix null->None)
    objects = []
    for obj in records:
        norad = str(obj.get("NORAD_CAT_ID", "")).strip()
        if not norad:
            continue
        objects.append({
            "noradId": norad,
            "name": (obj.get("OBJECT_NAME") or "").strip(),
            "type": (obj.get("OBJECT_TYPE") or "").strip(),
            "epoch": (obj.get("EPOCH") or "").strip(),
            "tle": {
                "line1": (obj.get("TLE_LINE1") or "").strip(),
                "line2": (obj.get("TLE_LINE2") or "").strip()
            },
            "education": None
        })

    out = {
        "source": {
            "provider": "Space-Track",
            "query": "class=gp orderby=EPOCH desc",
            "generatedAt": objects[0]["epoch"] if objects else ""
        },
        "fallbackEducationByType": {
            "DEBRIS": {
                "title": "Orbital Debris",
                "fact": "Even small debris can damage satellites because orbital speeds are extremely high.",
                "whyItMatters": "More debris increases collision risk and can trigger debris cascades."
            },
            "ROCKET BODY": {
                "title": "Rocket Body",
                "fact": "Spent rocket stages can remain in orbit and contribute to congestion.",
                "whyItMatters": "Large objects are harder to avoid and may fragment into debris."
            },
            "PAYLOAD": {
                "title": "Satellite / Payload",
                "fact": "Some satellites become inactive and can no longer maneuver to avoid collisions.",
                "whyItMatters": "Non-maneuverable objects increase collision probability."
            }
        },
        "objects": objects
    }

    os.makedirs("data", exist_ok=True)
    with open("data/space_objects.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

    print(f"Saved {len(objects)} objects to data/space_objects.json")


if __name__ == "__main__":
    main()






