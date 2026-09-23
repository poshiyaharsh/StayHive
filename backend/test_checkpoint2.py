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
        return e.code, json.loads(e.read().decode())

def run_tests():
    print("=== STAYHIVE CHECKPOINT 2 VERIFICATION SUITE ===")

    # 1. Health
    s, d = req(f"{BASE}/health/")
    print(f"1. Health Check: HTTP {s} | Database: {d.get('database')}")
    assert s == 200 and d.get('database') == 'connected', "Health check failed"

    # 2. Invalid Login
    s, d = req(f"{BASE}/auth/login/", {"username": "admin", "password": "wrongpassword123"}, method="POST")
    print(f"2. Invalid Login Attempt: HTTP {s} | Message: {d.get('message')}")
    assert s == 401, "Expected 401 for invalid login"

    # 3. Valid Login Admin
    s, d = req(f"{BASE}/auth/login/", {"username": "admin", "password": "admin123"}, method="POST")
    tokens = d.get('data', {})
    access = tokens.get('access')
    refresh = tokens.get('refresh')
    role = tokens.get('role')
    print(f"3. Valid Admin Login: HTTP {s} | Role: {role} | Access Token: {bool(access)} | Refresh Token: {bool(refresh)}")
    assert s == 200 and access and refresh, "Login failed"

    # 4. Auth Me with token
    s, d = req(f"{BASE}/auth/me/", headers={"Authorization": f"Bearer {access}"})
    user = d.get('data', {})
    print(f"4. GET /api/auth/me/ (Authenticated): HTTP {s} | User: {user.get('username')} ({user.get('first_name')} {user.get('last_name')}) | Role: {user.get('role')}")
    assert s == 200 and user.get('username') == 'admin', "Auth me verification failed"

    # 5. Auth Me without token
    s, d = req(f"{BASE}/auth/me/")
    print(f"5. GET /api/auth/me/ (Unauthenticated): HTTP {s} (Correctly rejected)")
    assert s == 401, "Expected 401 for unauthenticated request"

    # 6. Refresh token
    s, d = req(f"{BASE}/auth/refresh/", {"refresh": refresh}, method="POST")
    new_access = d.get('access')
    print(f"6. POST /api/auth/refresh/: HTTP {s} | New Access Token Generated: {bool(new_access)}")
    assert s == 200 and new_access, "Token refresh failed"

    # 7. Auth Me with new access token
    s, d = req(f"{BASE}/auth/me/", headers={"Authorization": f"Bearer {new_access}"})
    print(f"7. GET /api/auth/me/ with Refreshed Token: HTTP {s} | User: {d.get('data', {}).get('username')}")
    assert s == 200, "Refreshed token validation failed"

    # 8. Test all 6 Persona Logins from MySQL
    personas = [
        ('admin', 'admin123', 'ADMIN'),
        ('manager_vikram', 'stayhive123', 'MANAGER'),
        ('reception_priya', 'stayhive123', 'RECEPTION'),
        ('housekeeping_suresh', 'stayhive123', 'HOUSEKEEPING'),
        ('chef_anand', 'stayhive123', 'RESTAURANT'),
        ('rahul_sharma', 'stayhive123', 'CUSTOMER'),
    ]
    print("8. Persona Credentials & Role Verification (Direct MySQL Authentication):")
    for uname, pwd, exp_role in personas:
        s, d = req(f"{BASE}/auth/login/", {"username": uname, "password": pwd}, method="POST")
        act_role = d.get('data', {}).get('role')
        print(f"   [OK] {uname.ljust(20)} -> HTTP {s} | Expected: {exp_role.ljust(12)} | Got: {act_role}")
        assert s == 200 and act_role == exp_role, f"Failed for persona {uname}"

    # 9. Logout
    s, d = req(f"{BASE}/auth/logout/", {"refresh": refresh}, method="POST")
    print(f"9. POST /api/auth/logout/: HTTP {s} | Message: {d.get('message')}")
    assert s == 200, "Logout failed"

    print("=== ALL 9 CHECKPOINT 2 VERIFICATIONS PASSED SUCCESSFULLY ===")

if __name__ == '__main__':
    run_tests()
