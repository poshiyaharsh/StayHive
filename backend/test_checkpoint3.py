import urllib.request
import json
import urllib.error

BASE = 'http://127.0.0.1:8000/api'

def req(url, data=None, headers=None, method='GET'):
    h = {'Content-Type': 'application/json'}
    if headers:
        h.update(headers)
    body = json.dumps(data).encode() if data else None
    r = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        res = urllib.request.urlopen(r)
        return res.status, json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, {'raw': e.read().decode()}

def run_tests():
    print("=== STAYHIVE CHECKPOINT 3: REAL HOTEL + ROOM MANAGEMENT VERIFICATION ===")

    # 0. Login as Admin and Customer
    s, d = req(f"{BASE}/auth/login/", {"username": "admin", "password": "admin123"}, method="POST")
    admin_token = d['data']['access']
    admin_auth = {'Authorization': f'Bearer {admin_token}'}

    s, d = req(f"{BASE}/auth/login/", {"username": "rahul_sharma", "password": "stayhive123"}, method="POST")
    customer_token = d['data']['access']
    customer_auth = {'Authorization': f'Bearer {customer_token}'}

    # 1. Hotel List & Search
    s, d = req(f"{BASE}/hotels/")
    hotels = d.get('data', [])
    print(f"1. GET /api/hotels/: HTTP {s} | Loaded {len(hotels)} hotels from MySQL")
    assert s == 200 and len(hotels) >= 4, "Expected seeded hotels from MySQL"
    h1 = hotels[0]
    assert 'rooms_count' in h1 and 'available_rooms_count' in h1, "Expected calculated room counts"

    s, d = req(f"{BASE}/hotels/?search=Ahmedabad")
    search_res = d.get('data', [])
    print(f"2. GET /api/hotels/?search=Ahmedabad: HTTP {s} | Found {len(search_res)} properties")
    assert any('Ahmedabad' in h['city'] or 'Ahmedabad' in h['name'] for h in search_res), "Search by city failed"

    # 2. Hotel Detail
    s, d = req(f"{BASE}/hotels/1/")
    h_detail = d.get('data', {})
    print(f"3. GET /api/hotels/1/: HTTP {s} | Hotel: {h_detail.get('name')} | Room Types: {len(h_detail.get('room_types', []))}")
    assert s == 200 and h_detail.get('name'), "Hotel detail failed"

    # 3. Hotel Facilities & Gallery
    s, d = req(f"{BASE}/hotels/1/facilities/")
    print(f"4. GET /api/hotels/1/facilities/: HTTP {s} | Found {len(d.get('data', []))} facilities")
    assert s == 200 and len(d.get('data', [])) > 0, "Hotel facilities failed"

    s, d = req(f"{BASE}/hotels/1/gallery/")
    print(f"5. GET /api/hotels/1/gallery/: HTTP {s} | Found {len(d.get('data', []))} gallery images")
    assert s == 200 and len(d.get('data', [])) > 0, "Hotel gallery failed"

    # 4. Permission Check: Customer Cannot Create Hotel
    s, d = req(f"{BASE}/hotels/", {"name": "Test"}, headers=customer_auth, method="POST")
    print(f"6. Customer Create Hotel (Denied): HTTP {s} (Correctly forbidden)")
    assert s == 403, "Customer should not be able to create hotels"

    # 5. Hotel Create (Validation & Success)
    s, d = req(f"{BASE}/hotels/", {"name": ""}, headers=admin_auth, method="POST")
    print(f"7. Admin Hotel Create Validation Error: HTTP {s} | Errors: {list(d.get('errors', {}).keys())}")
    assert s == 400, "Expected validation failure for empty hotel name"

    new_hotel_payload = {
        "name": "StayHive Heritage Palace Jaipur",
        "tagline": "Royal Heritage & Palace Luxury",
        "description": "Experience regal hospitality in the heart of the Pink City.",
        "address": "Civil Lines, Near Raj Bhavan",
        "city": "Jaipur",
        "state": "Rajasthan",
        "country": "India",
        "pincode": "302006",
        "contact_number": "+91 141 556677",
        "email": "jaipur@stayhive.com",
        "star_rating": 4.9
    }
    s, d = req(f"{BASE}/hotels/", new_hotel_payload, headers=admin_auth, method="POST")
    new_hotel = d.get('data', {})
    new_hotel_id = new_hotel.get('id')
    print(f"8. Admin Create Hotel: HTTP {s} | Created ID: {new_hotel_id} | Name: {new_hotel.get('name')}")
    assert s == 201 and new_hotel_id, "Hotel creation failed"

    # 6. Hotel Update & Delete
    s, d = req(f"{BASE}/hotels/{new_hotel_id}/", {"tagline": "Updated Royal Heritage Tagline"}, headers=admin_auth, method="PATCH")
    print(f"9. Admin Update Hotel: HTTP {s} | Updated Tagline: {d.get('data', {}).get('tagline')}")
    assert s == 200, "Hotel update failed"

    s, d = req(f"{BASE}/hotels/{new_hotel_id}/", headers=admin_auth, method="DELETE")
    print(f"10. Admin Delete Hotel: HTTP {s} | Message: {d.get('message')}")
    assert s == 200, "Hotel deletion failed"

    # 7. Room Types List & Dynamic Room Counts
    s, d = req(f"{BASE}/room-types/")
    room_types = d.get('data', [])
    print(f"11. GET /api/room-types/: HTTP {s} | Loaded {len(room_types)} categories")
    assert s == 200 and len(room_types) >= 4, "Room types query failed"
    for rt in room_types:
        print(f"    - {rt.get('type_name')}: INR {rt.get('base_price')} | Capacity: {rt.get('capacity')} | Rooms in DB: {rt.get('rooms_count')}")
        assert rt.get('rooms_count') is not None, "rooms_count must be calculated"

    # 8. Room Type Validation & Create/Delete
    s, d = req(f"{BASE}/room-types/", {"type_name": "Ultra Suite", "capacity": 0, "base_price": -10}, headers=admin_auth, method="POST")
    print(f"12. Room Type Validation (capacity <= 0 / price < 0): HTTP {s} (Correctly rejected)")
    assert s == 400, "Expected validation failure for invalid capacity/price"

    s, d = req(f"{BASE}/room-types/", {"type_name": "Grand Penthouse", "capacity": 6, "base_price": 28000, "bed_type": "Dual King Beds"}, headers=admin_auth, method="POST")
    new_rt_id = d.get('data', {}).get('id')
    print(f"13. Admin Create Room Type: HTTP {s} | Created ID: {new_rt_id} | Name: {d.get('data', {}).get('type_name')}")
    assert s == 201 and new_rt_id, "Room type creation failed"

    s, d = req(f"{BASE}/room-types/{new_rt_id}/", headers=admin_auth, method="DELETE")
    print(f"14. Admin Delete Room Type: HTTP {s}")
    assert s == 200, "Room type deletion failed"

    # 9. Room List & Multi-Filtering
    s, d = req(f"{BASE}/rooms/")
    rooms = d.get('data', [])
    print(f"15. GET /api/rooms/: HTTP {s} | Loaded {len(rooms)} rooms across all hotels")
    assert s == 200 and len(rooms) >= 12, "Room query failed"
    r1 = rooms[0]
    assert r1.get('hotel_name') and r1.get('room_type_name'), "Room nested relation names missing"

    s, d = req(f"{BASE}/rooms/?status=Available")
    avail_rooms = d.get('data', [])
    print(f"16. Filter /api/rooms/?status=Available: Found {len(avail_rooms)} available rooms")
    assert all(r['status'] == 'Available' for r in avail_rooms), "Status filter mismatch"

    s, d = req(f"{BASE}/rooms/?floor=1")
    f1_rooms = d.get('data', [])
    print(f"17. Filter /api/rooms/?floor=1: Found {len(f1_rooms)} rooms on Floor 1")
    assert all(r['floor'] == 1 for r in f1_rooms), "Floor filter mismatch"

    s, d = req(f"{BASE}/rooms/?hotel=1")
    h1_rooms = d.get('data', [])
    print(f"18. Filter /api/rooms/?hotel=1: Found {len(h1_rooms)} rooms in Hotel 1")
    assert len(h1_rooms) > 0, "Hotel filter failed"

    # 10. Duplicate Room Number in Same Hotel (Unique Constraint & Friendly Message)
    dup_room_payload = {
        "hotel_id": 1,
        "room_type_id": 1,
        "room_number": "101", # Room 101 already exists in Hotel 1
        "floor": 1,
        "status": "Available",
        "housekeeping_status": "Clean"
    }
    s, d = req(f"{BASE}/rooms/", dup_room_payload, headers=admin_auth, method="POST")
    print(f"19. Duplicate Room Creation Check: HTTP {s} | Message: {d.get('message')}")
    assert s == 400 and "already exists in this hotel" in d.get('message', ''), "Expected friendly duplicate error"

    # 11. Create Real Room & Status Updates
    valid_room_payload = {
        "hotel_id": 1,
        "room_type_id": 1,
        "room_number": "999",
        "floor": 9,
        "status": "Available",
        "housekeeping_status": "Clean",
        "price_per_night": 4500
    }
    s, d = req(f"{BASE}/rooms/", valid_room_payload, headers=admin_auth, method="POST")
    new_room = d.get('data', {})
    new_room_id = new_room.get('id')
    print(f"20. Admin Create Room 999: HTTP {s} | Created ID: {new_room_id} | Status: {new_room.get('status')}")
    assert s == 201 and new_room_id, "Room creation failed"

    # Reception / Housekeeping update status
    s, d = req(f"{BASE}/rooms/{new_room_id}/update_status/", {"status": "Cleaning", "housekeeping_status": "Needs Cleaning"}, headers=admin_auth, method="PATCH")
    updated_r = d.get('data', {})
    print(f"21. Update Room Status (Cleaning / Needs Cleaning): HTTP {s} | New Status: {updated_r.get('status')} | HK: {updated_r.get('housekeeping_status')}")
    assert s == 200 and updated_r.get('status') == 'Cleaning' and updated_r.get('housekeeping_status') == 'Needs Cleaning', "Status update failed"

    # Room Amenities Check
    s, d = req(f"{BASE}/rooms/{new_room_id}/amenities/")
    print(f"22. GET /api/rooms/{new_room_id}/amenities/: HTTP {s} | Amenities count: {len(d.get('data', []))}")
    assert s == 200, "Room amenities failed"

    # Clean up test room 999
    s, d = req(f"{BASE}/rooms/{new_room_id}/", headers=admin_auth, method="DELETE")
    print(f"23. Admin Delete Room 999: HTTP {s}")
    assert s == 200, "Room deletion failed"

    print("=== ALL 23 CHECKPOINT 3 BACKEND API TESTS PASSED WITH 100% SUCCESS ===")

if __name__ == '__main__':
    run_tests()
