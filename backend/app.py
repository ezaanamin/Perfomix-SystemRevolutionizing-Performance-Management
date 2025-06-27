from flask import Flask, request, jsonify, make_response
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
from dotenv import load_dotenv
from os import environ
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pickle
from datetime import datetime, date, timedelta
import numpy as np
import requests 
import pickle
import random
import os
from requests.auth import HTTPBasicAuth
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from flask import send_file
import pandas as pd
app = Flask(__name__)


load_dotenv()


CORS(app, origins=["http://localhost:3000"])  


app.config['DB_HOST'] = environ.get('DB_HOST')
app.config['DB_USER'] = environ.get('DB_USER')
app.config['DB_PASSWORD'] = environ.get('DB_PASSWORD')
app.config['DB_NAME'] = environ.get('DB_NAME')
app.config['JWT_SECRET_KEY'] = environ.get('JWT_SECRET_KEY')

app.config['GITHUB_TOKEN'] = os.environ.get('GITHUB_TOKEN')
app.config['GITHUB_REPO_OWNER'] = os.environ.get('GITHUB_REPO_OWNER')
app.config['GITHUB_REPOS'] = os.environ.get('GITHUB_REPOS').split(',') if os.environ.get('GITHUB_REPOS') else []

repo_owner = app.config.get('GITHUB_REPO_OWNER')
repo_name = app.config['GITHUB_REPOS'][0] if app.config['GITHUB_REPOS'] else None

if not repo_owner or not repo_name:
    raise RuntimeError("GitHub repo owner or name not configured")

repos_env = environ.get('GITHUB_REPOS')
app.config['GITHUB_REPOS'] = repos_env.split(',') if repos_env else []
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPOS = os.getenv("GITHUB_REPOS")
gh_headers = {"Authorization": f"token {GITHUB_TOKEN}"}
JIRA_SITE = os.getenv("JIRA_URL")               
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")


jira_auth = (JIRA_EMAIL, JIRA_API_TOKEN)


jira_headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}
df = pd.read_csv("/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/budget_allocation_1000.csv")

jwt = JWTManager(app)

def get_db_connection_and_cursor():
    db = get_db_connection()  
    return db, db.cursor()
try:
    mydb = mysql.connector.connect(
        host=app.config['DB_HOST'],
        user=app.config['DB_USER'],
        password=app.config['DB_PASSWORD'],
        database=app.config['DB_NAME']
    )
    if mydb.is_connected():
        print("✅ Connected to the database")
    mycursor = mydb.cursor()
except Error as e:
    print(f"❌ Error while connecting to MySQL: {e}")

from werkzeug.security import generate_password_hash
import mysql.connector

# Assuming you have your app.config already defined somewhere
def get_db_connection():
    return mysql.connector.connect(
        host=app.config['DB_HOST'],
        user=app.config['DB_USER'],
        password=app.config['DB_PASSWORD'],
        database=app.config['DB_NAME']
    )

def update_user_password(username, new_plain_password):
    try:
        db = get_db_connection()
        cursor = db.cursor()

        # Hash the new password
        hashed_password = generate_password_hash(new_plain_password)

        # Update the password for the given username
        update_query = "UPDATE User SET Password = %s WHERE Name = %s"
        cursor.execute(update_query, (hashed_password, username))

        db.commit()

        print(f"✅ Password for '{username}' updated successfully.")

    except Exception as e:
        print(f"❌ Error updating password for '{username}': {e}")

    finally:
        cursor.close()
        db.close()

# # Call this once to update Ali Khan's password
# update_user_password("Ali Khan", "SoftwareEng123")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPOS = os.getenv("GITHUB_REPOS")


gh_headers = {"Authorization": f"token {GITHUB_TOKEN}"}


JIRA_SITE = os.getenv("JIRA_URL")               
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")



jira_headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}

jira_auth = HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN)
jira_headers = {"Accept": "application/json"}
budget_data = pd.read_csv('/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/budget_allocation_1000.csv')



def detect_commit_count(user_id=None):
    print(GITHUB_REPO_OWNER)
    print(GITHUB_REPOS)
    url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPOS[0]}/commits"
    print(url)
    resp = requests.get(url, headers=gh_headers)
    print(resp,'ezaan')
    if resp.status_code != 200:
        print(f"⚠️ GitHub commits fetch error: {resp.status_code} {resp.text}")
        return {"Commit Frequency": 0}
    return {"Commit Frequency": len(resp.json())}

def detect_code_quality_mentions(user_id=None):
    print(GITHUB_REPO_OWNER)
    print(GITHUB_REPOS)
    url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPOS[0]}/issues"
    print(url)

    params = {"state": "all", "per_page": 100}
    resp = requests.get(url, headers=gh_headers, params=params)
    print(resp, 'ezaan')

    if resp.status_code != 200:
        print(f"⚠️ GitHub issues fetch error: {resp.status_code} {resp.text}")
        return {"Code Quality Mentions": 0}

    issues = resp.json()
    keywords = ["refactor", "code quality", "technical debt", "clean code", "lint error"]
    count = 0

    for issue in issues:
        title = issue.get('title', '').lower()
        body = issue.get('body', '').lower() if issue.get('body') else ''

        if any(keyword in title or keyword in body for keyword in keywords):
            count += 1

    return {"Code Quality Mentions": count}

def detect_closed_prs(user_id=None):
    url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPOS[0]}/pulls"
    params = {"state": "closed"}
    resp = requests.get(url, headers=gh_headers, params=params)
    if resp.status_code != 200:
        print(f"⚠️ GitHub PR fetch error: {resp.status_code} {resp.text}")
        return {"Closed PRs": 0}
    return {"Closed PRs": len(resp.json())}

def detect_bug_issues(user_id=None):
    url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPOS[0]}/issues"
    params = {"labels": "bug", "state": "all", "per_page": 100}
    resp = requests.get(url, headers=gh_headers, params=params)
    if resp.status_code != 200:
        print(f"⚠️ GitHub issue fetch error: {resp.status_code} {resp.text}")
        return {"Bug Issues": 0}
    return {"Bug Issues": len(resp.json())}

def detect_task_completion_rate(user_id, jira_user_email=None, jira_project_key=None):
    if not jira_project_key:
        return {"Task Completion Rate": 0}
    
    url = f"{JIRA_SITE}/rest/api/3/search"
    jql_all = f"project = {jira_project_key} AND issuetype in (Task, Story)"
    jql_done = f"project = {jira_project_key} AND statusCategory = Done AND issuetype in (Task, Story)"

    params_all = {"jql": jql_all, "maxResults": 1000, "fields": "status"}
    params_done = {"jql": jql_done, "maxResults": 1000, "fields": "status"}

    resp_all = requests.get(url, headers=jira_headers, auth=jira_auth, params=params_all)
    resp_done = requests.get(url, headers=jira_headers, auth=jira_auth, params=params_done)
    resp_all.raise_for_status()
    resp_done.raise_for_status()

    total_issues = resp_all.json().get("total", 0)
    done_issues = resp_done.json().get("total", 0)

    completion_rate = (done_issues / total_issues) * 100 if total_issues > 0 else 0.0
    return {"Task Completion Rate": round(completion_rate, 2)}

def detect_milestone_achievement_rate(user_id=None, project_id=None):
    url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPOS[0]}/milestones"
    params = {"state": "all"}
    resp = requests.get(url, headers=gh_headers, params=params)
    if resp.status_code != 200:
        print(f"⚠️ GitHub milestones fetch error: {resp.status_code} {resp.text}")
        return {"Milestone Achievement Rate": 0}

    milestones = resp.json()
    total = len(milestones)
    closed = len([m for m in milestones if m["state"] == "closed"])
    rate = (closed / total) * 100 if total > 0 else 0.0
    return {"Milestone Achievement Rate": round(rate, 2)}

def fetch_test_execution_time():
    try:
        url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPOS[0]}/actions/runs"
        resp = requests.get(url, headers=gh_headers)
        resp.raise_for_status()
        runs = resp.json().get("workflow_runs", [])

        for run in runs:
            if "test" in run["name"].lower():
                start_time = run["created_at"]
                end_time = run["updated_at"]
                from dateutil import parser
                duration_sec = (parser.parse(end_time) - parser.parse(start_time)).total_seconds()
                print(f"✅ Test run duration: {duration_sec} seconds")
                return {"Test Execution Time": duration_sec}

        print("⚠️ No test workflow run found.")
        return {"Test Execution Time": 0}
    except Exception as e:
        print(f"⚠️ Error fetching test execution time: {e}")
        return {"Test Execution Time": 0}


def _detect_kpi_test_case_coverage(user_id):
    try:
        url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPOS[0]}/commits/main/check-runs"
        resp = requests.get(url, headers=github_headers)
        resp.raise_for_status()
        check_runs = resp.json().get("check_runs", [])

        for check in check_runs:
            if "coverage" in check["name"].lower():
                summary = check.get("output", {}).get("summary", "")
                print(f"📊 Coverage summary for user {user_id}: {summary}")

                if "Coverage:" in summary:
                    coverage_value = float(summary.split("Coverage:")[1].split("%")[0].strip())
                    return {"Test Case Coverage": round(coverage_value, 2)}

        print(f"⚠️ No coverage check run found for user {user_id}.")
        return {"Test Case Coverage": 0}

    except Exception as e:
        print(f"⚠️ Error detecting Test Case Coverage for user {user_id}: {e}")
        return {"Test Case Coverage": 0}

def detect_budget_utilization(user_id=None):
    try:
        if budget_data.empty:
            return {"Budget Utilization": 0}
        row = budget_data.iloc[0]
        utilization = (row['Budget Spent'] / row['Budget Allocated']) * 100
        return {"Budget Utilization": round(utilization, 2)}
    except Exception as e:
        print(f"⚠️ Budget calculation error: {e}")
        return {"Budget Utilization": 0}

def detect_resource_allocation(user_id=None):
    try:
        if budget_data.empty:
            return {"Resource Allocation": 0}
        row = budget_data.iloc[0]
        allocation = (row['Actual Hours Worked'] / row['Planned Hours']) * 100
        return {"Resource Allocation": round(allocation, 2)}
    except Exception as e:
        print(f"⚠️ Resource allocation calculation error: {e}")
        return {"Resource Allocation": 0}

def detect_revenue_growth(user_id=None):
    try:
        if budget_data.empty:
            return {"Revenue Growth": 0}
        row = budget_data.iloc[0]
        growth = (row['Budget Spent'] / row['Budget Allocated']) * 100
        return {"Revenue Growth": round(growth, 2)}
    except Exception as e:
        print(f"⚠️ Revenue growth calculation error: {e}")
        return {"Revenue Growth": 0}
    

    
def operational_efficiency_kpi(user_id):
    try:
        if budget_data.empty:
            print("⚠️ No budget data available")
            return {"Operational Efficiency": 0}

        row = budget_data.iloc[0]
        efficiency = (row['Actual Hours Worked'] / row['Planned Hours']) * 100
        return {"Operational Efficiency": round(efficiency, 2)}
    except Exception as e:
        print(f"⚠️ Error in Operational Efficiency KPI: {e}")
        return {"Operational Efficiency": 0}
    
def bug_detection_rate_kpi(user_id, project_key=JIRA_PROJECT_KEY):
    try:
        url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPOS[0]}/issues"
        params = {"labels": "bug", "state": "all", "per_page": 100}
        resp = requests.get(url, headers=gh_headers, params=params)
        resp.raise_for_status()

        bugs = len(resp.json())
        return {"Bug Detection Rate": bugs}
    except Exception as e:
        print(f"⚠️ Error in Bug Detection Rate KPI: {e}")
        return {"Bug Detection Rate": 0}



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('Name')
    password = data.get('password')

    if not name or not password:
        return jsonify({"error": "Name and password are required"}), 400

    query = "SELECT Name, Password, Role FROM User WHERE Name = %s;"
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute(query, (name,))
    user = mycursor.fetchone()

    if user:
        name_, password_hash, role_ = user

        if check_password_hash(password_hash, password):
            access_token = create_access_token(identity=name, additional_claims={'role': role_})
            return jsonify({'message': 'Login Success', 'access_token': access_token, 'expires_in': 3600})
        else:
            return jsonify({"error": "Invalid password"}), 401

    return jsonify({"error": "Invalid Name"}), 401

@app.route('/kpi', methods=['GET'])
@jwt_required()
def get_kpis():

    db = get_db_connection()
    mycursor = db.cursor()
    query = "SELECT * FROM KPI;"
    mycursor.execute(query)
    kpis = mycursor.fetchall()

    kpi_list = []
    for kpi in kpis:
        kpi_list.append({
            "id": kpi[0],
            "kpi_name": kpi[1],
            "target": float(kpi[2]),
            "role": kpi[3],
            "status": kpi[4]
        })

    mycursor.close()
    return jsonify(kpi_list)

@app.route('/new_kpi', methods=['POST'])
@jwt_required()
def add_kpi():
    try:
        data = request.json
        role = data.get('role')
        kpi_name = data.get('kpi')
        target = data.get('target')
        db = get_db_connection()
        mycursor = db.cursor()

        try:
            target = float(target)
        except ValueError:
            return jsonify({'error': 'Target must be a valid decimal number'}), 400

        status = 'active'
        insert_query = """
            INSERT INTO KPI (role, kpi_name, target, status)
            VALUES (%s, %s, %s, %s)
        """
        mycursor.execute(insert_query, (role, kpi_name, target, status))
        mydb.commit()

        return jsonify({'message': 'KPI added successfully', 'data': data}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_users', methods=['GET'])
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT 
                User.UserID, 
                User.Name, 
                User.Email, 
                User.Role, 
                Team.TeamName,
                Team.ManagerID
            FROM User
            LEFT JOIN Team ON User.TeamID = Team.TeamID;
        """
        cursor.execute(query)
        users = cursor.fetchall()

        print(f"Fetched {len(users)} users from DB.")
        for user in users:
            print(user)

        user_list = []
        for user in users:
            user_list.append({
                "user_id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3],
                "team_name": user[4] if user[4] else 'N/A',
                "manager_id": user[5] if user[5] else 'N/A',
            })

        cursor.close()
        conn.close()

        return jsonify(user_list)

    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        print(f"❌ Error fetching users: {str(e)}")
        return jsonify({"error": str(e)}), 500

# predefined_users = [
#     {"Name": "zephyr_manager", "Role": "Project Manager", "Password": "Manager$2025!", "TeamID": 2},
#     {"Name": "nova_staff", "Role": "Staff", "Password": "Staff"
#     {"Name": "admin1", "Role": "Admin", "Password": "Admin@2025", "TeamID": None},
#     {"Name": "Ali Khan", "Role": "Software Engineer", "Password": "SoftwareEng
    
#     {"Name": "Bhavana Rao", "Role": "Software Engineer", "Password": "SoftwareEng
#     {"Name": "Carlos Diaz", "Role": "Project Manager", "Password": "Manager$2025!", "TeamID": 2},
#     {"Name": "Diana Lee", "Role": "Business Manager", "Password": "BusinessM
#     {"Name": "Eve Singh", "Role": "Testing Team", "Password": "TestingT
# ]

@app.route('/edit_kpi/<int:kpi_id>', methods=['POST'])
@jwt_required()
def edit_kpi(kpi_id):
    print("Updating KPI")
    try:
      
        data = request.get_json()
        print(data)
        db = get_db_connection()
        mycursor = db.cursor()

        if not data:
            return jsonify({'error': 'Invalid input, JSON required'}), 400

        
        kpi_name = data.get('kpi')
        target = data.get('target')
        status = data.get('status')

        
        if not kpi_name or target is None or not status:
            return jsonify({'error': 'Missing required fields: kpi_name, target, or status'}), 400

        
        try:
            target = float(target)
        except ValueError:
            return jsonify({'error': 'Target must be a valid decimal number'}), 400

        
        if status not in ['active', 'inactive']:
            return jsonify({'error': 'Invalid status value. It must be "active" or "inactive".'}), 400

        
        update_query = """
            UPDATE KPI
            SET KPIName = %s, TargetValue = %s, Status = %s
            WHERE KPIID = %s
        """
        
    
        mycursor.execute(update_query, (kpi_name, target, status, kpi_id))
        mydb.commit()

        
        if mycursor.rowcount == 0:
            return jsonify({"error": "KPI not found or no changes made"}), 404

  
        return jsonify({'message': 'KPI updated successfully', 'data': data}), 200

    except Exception as e:
    
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500










        



@app.route('/bot_detection',methods=['POST'])
@jwt_required()
def bot_detection():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        db = get_db_connection()
        mycursor = db.cursor()

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        today = date.today()

        
        check_query = """
            SELECT id, is_bot FROM BotDetection
            WHERE user_id = %s AND DATE(detection_date) = %s
        """
        mycursor.execute(check_query, (user_id, today))
        existing = mycursor.fetchone()

        if existing:
            
            return jsonify({
                "message": "Bot detection was already done today.",
                "prediction": existing[1]  
            }), 200

        
        ordered_keys = [
            'comment_length', 'issue_id', 'issue_status', 'issue_resolved',
            'conversation_comments', 'day', 'month', 'year', 'hour', 'minute', 'second',
            'day_issue_created_date', 'month_issue_created_month', 'year_issue_created_year',
            'activity_Closing_issue', 'activity_Commenting_issue', 'activity_Opening_issue',
            'activity_Reopening_issue', 'activity_Transferring_issue'
        ]
        values = [data.get(key, 0) for key in ordered_keys]
        arr = np.array(values, dtype=object).reshape(1, 19)

        
        
        
        
        
        
        
        pipe = pickle.load(open('/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/pipe.pkl','rb'))

        predict = pipe.predict(arr)
        is_bot = int(predict[0])

        
        insert_query = """
            INSERT INTO BotDetection (user_id, is_bot)
            VALUES (%s, %s)
        """
        mycursor.execute(insert_query, (user_id, is_bot))
        mydb.commit()

        return jsonify({
            "message": "Bot detection completed successfully.",
            "prediction": is_bot
        }), 200



    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 400

def get_active_kpis_for_role(role):
    try:
        db = get_db_connection()
        mycursor = db.cursor()
        mycursor.execute("SELECT KPIName FROM KPI WHERE Role = %s AND Status = 'active'", (role,))
        return [row[0] for row in mycursor.fetchall()]
    except Exception as e:
        print(f"❌ Error in get_active_kpis_for_role: {e}")
        return []


def save_performance_data(user_id, kpi_name, role, actual_value):
    try:
        db = get_db_connection()
        cursor = db.cursor()

        
        cursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s AND Role = %s", (kpi_name, role))
        kpi_id_row = cursor.fetchone()
        if not kpi_id_row:
            print(f"⚠️ KPIID not found for KPIName='{kpi_name}', Role='{role}'")
            return

        kpi_id = kpi_id_row[0]
        actual_value_float = float(actual_value)
        timestamp = datetime.utcnow()

        
        insert_sql = """
            INSERT INTO PerformanceData (UserID, KPIID, ActualValue, Timestamp)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(insert_sql, (user_id, kpi_id, actual_value_float, timestamp))
        db.commit()

        print(f"✅ Saved performance data: UserID={user_id}, KPI='{kpi_name}', Value={actual_value_float}")

    except Exception as e:
        print(f"❌ Error in save_performance_data: {e}")

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
SINCE_DATE = "2025-01-01T00:00:00Z"  

KPI_TARGETS = {
    "Code Quality": 95,
    "Code Efficiency": 10,
    "Commit Frequency": 10,
    "Task Completion Rate": 90,
    "Milestone Achievement Rate": 95,
    "Budget Utilization": 5,
    "Resource Allocation": 85,
    "Revenue Growth": 10,
    "Operational Efficiency": 15,
    "Test Case Coverage": 95,
    "Bug Detection Rate": 100,
    "Test Execution Time": 20,
}


SINCE_DATE = "2025-01-01T00:00:00Z"  



GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPOS = os.getenv("GITHUB_REPOS", "").split(",")
def get_github_headers():
    token = app.config.get("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"token {token}"
    return headers
SINCE_DATE = "2025-01-01T00:00:00Z"  

HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "Authorization": f"token {GITHUB_TOKEN}"
} if GITHUB_TOKEN else {"Accept": "application/vnd.github.v3+json"}

def detect_and_save_kpis(user_id, role, detection_functions):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT Name, Email FROM User WHERE UserID = %s AND Role = %s", (user_id, role))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": f"{role} user not found or incorrect role."}), 404

        user_name, user_email = user
        detected_kpis = {}
        active_kpis = get_active_kpis_for_role(role) or []

        jira_project_key = JIRA_PROJECT_KEY

        
        role_to_base_course = {
            'software engineer': 'python data structures',
            'project manager': 'leadership and emotional intelligence',
            'business manager': 'business strategy: business model canvas analysis with miro',
            'testing': 'python data structures',
        }
        base_course = role_to_base_course.get(role.lower(), 'project management basics')

        for kpi_name, detect_func in detection_functions.items():
            if kpi_name not in active_kpis:
                continue

            try:
                
                if kpi_name == 'Task Completion Rate':
                    result = detect_func(user_id, jira_user_email=user_email, jira_project_key=jira_project_key)
                elif kpi_name == 'Milestone Achievement Rate':
                    result = detect_func(user_id, project_id=1)
                else:
                    result = detect_func(user_id)

                detected_kpis.update(result)

                for key, value in result.items():
                    try:
                        val_float = float(value)
                    except Exception:
                        val_float = 0.0

                    
                    save_performance_data(user_id, key, role, val_float)

                    
                    if val_float < 50:
                        recommended_courses = recommend(base_course)
                        recommendation_text = ", ".join(recommended_courses)

                        
                        insert_query = """
                            INSERT INTO Recommendation (UserID, KPIID, Text, Timestamp, course_name)
                            VALUES (
                                %s, 
                                (SELECT KPIID FROM KPI WHERE KPIName = %s LIMIT 1), 
                                %s, 
                                %s,
                                %s
                            )
                        """
                        cursor.execute(insert_query, (
                            user_id,
                            key,
                            recommendation_text,
                            datetime.now(),
                            base_course.title(),
                        ))
                        db.commit()

            except Exception as e:
                print(f"⚠️ Error detecting KPI '{kpi_name}': {e}")

        return jsonify({
            "message": f"{role} KPIs detected for {user_name}",
            "detected_kpis": detected_kpis
        }), 200

    except Exception as e:
        print(f"❌ Error in detect_and_save_kpis for {role}: {e}")
        return jsonify({"error": str(e)}), 500



@app.route('/detect_kpi/software_engineer/<int:user_id>', methods=['POST'])
@jwt_required()
def detect_software_engineer_kpis(user_id):
    detection_funcs = {
        "Commit Frequency": detect_commit_count,
        "Closed PRs": detect_closed_prs,
        "Bug Issues": detect_bug_issues,
        "Task Completion Rate": detect_task_completion_rate,
        "Code Quality":detect_code_quality_mentions
    }
    return detect_and_save_kpis(user_id, "Software Engineer", detection_funcs)

@app.route('/detect_kpi/project_manager/<int:user_id>', methods=['POST'])
@jwt_required()
def detect_project_manager_kpis(user_id):
    detection_functions = {
        "Milestone Achievement Rate": detect_milestone_achievement_rate,
        "Budget Utilization": detect_budget_utilization,
        "Resource Allocation": detect_resource_allocation,
        "Revenue Growth": detect_revenue_growth,
    }
    return detect_and_save_kpis(user_id, "Project Manager", detection_functions)


@app.route('/detect_kpi/business_manager/<int:user_id>', methods=['POST'])
@jwt_required()
def detect_business_manager_kpis(user_id):
    detection_functions = {
        "Revenue Growth": detect_revenue_growth,
        "Operational Efficiency": operational_efficiency_kpi,
    }
    return detect_and_save_kpis(user_id, "Business Manager", detection_functions)

@app.route('/detect_kpi/testing_team/<int:user_id>', methods=['POST'])
@jwt_required()
def detect_testing_team_kpis(user_id):
    detection_functions = {
        "Test Case Coverage": _detect_kpi_test_case_coverage,
        "Bug Detection Rate": bug_detection_rate_kpi,
        "Test Execution Time": fetch_test_execution_time,
    }
    return detect_and_save_kpis(user_id, "Testing Team", detection_functions)

@app.route('/kpi_data', methods=['GET'])
@jwt_required()
def get_kpi_data():
    db = get_db_connection()
    mycursor = db.cursor()
    """
    Fetches stored detected KPI data.
    Allows filtering by KPI name, role, user ID, and date range.
    """
    kpi_name_filter = request.args.get('kpi_name')
    role_filter = request.args.get('role')
    user_id_filter = request.args.get('user_id')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = """
        SELECT kd.DetectedValue, kd.DetectionDate, k.KPIName, k.Role, u.Name AS UserName
        FROM KPIData kd
        JOIN KPI k ON kd.KPIID = k.KPIID
        LEFT JOIN User u ON kd.UserID = u.UserID
        WHERE 1=1
    """
    params = []

    if kpi_name_filter:
        query += " AND k.KPIName = %s"
        params.append(kpi_name_filter)
    if role_filter:
        query += " AND k.Role = %s"
        params.append(role_filter)
    if user_id_filter:
        
        try:
            user_id_filter_int = int(user_id_filter)
            query += " AND kd.UserID = %s"
            params.append(user_id_filter_int)
        except ValueError:
            return jsonify({"error": "Invalid user_id provided. Must be an integer."}), 400
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            query += " AND kd.DetectionDate >= %s"
            params.append(start_date)
        except ValueError:
            return jsonify({"error": "Invalid start_date format. Use %Y-%m-%d"}), 400
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            query += " AND kd.DetectionDate <= %s"
            params.append(end_date)
        except ValueError:
            return jsonify({"error": "Invalid end_date format. Use %Y-%m-%d"}), 400

    query += " ORDER BY kd.DetectionDate DESC;"

    try:
        mycursor.execute(query, params)
        kpi_data = mycursor.fetchall()

        result = []
        for row in kpi_data:
            result.append({
                "detected_value": float(row[0]),
                "detection_date": row[1].isoformat(),
                "kpi_name": row[2],
                "kpi_role": row[3],
                "user_name": row[4] if row[4] else "N/A"
            })
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ Error fetching KPI data: {str(e)}")
        return jsonify({"error": str(e)}), 500




@app.route('/active-kpis/<role>', methods=['GET'])
@jwt_required()
def get_active_kpis_by_role(role):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        query = "SELECT KPIID, KPIName, TargetValue, Role, Status FROM KPI WHERE Role=%s AND Status='active';"
        cursor.execute(query, (role,))
        kpis = cursor.fetchall()
    finally:
        cursor.close()

    kpi_list = [{
        "id": kpi[0],
        "kpi_name": kpi[1],
        "target": float(kpi[2]),
        "role": kpi[3],
        "status": kpi[4]
    } for kpi in kpis]

    return jsonify(kpi_list)
@app.route('/get/performance_data', methods=['GET'])
@jwt_required()

def get_performance_data_with_percent():
    try:
        mydb = get_db_connection()  
        mycursor = mydb.cursor(dictionary=True)

        query = """
            SELECT 
                pd.PerformanceID,
                u.Name AS UserName,
                k.KPIName,
                pd.ActualValue,
                k.TargetValue,
                ROUND(LEAST((pd.ActualValue / k.TargetValue) * 100, 100), 2) AS PerformancePercent,
                pd.Timestamp
            FROM PerformanceData pd
            JOIN User u ON pd.UserID = u.UserID
            JOIN KPI k ON pd.KPIID = k.KPIID
            ORDER BY pd.Timestamp DESC;
        """
        mycursor.execute(query)
        data = mycursor.fetchall()

        return jsonify(data)  

    except Exception as e:
        print(f"❌ Error fetching performance data: {e}")
        return jsonify({"error": str(e)}), 500  

def recommend(course):
    try:
        
        new_df_path = '/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/course_df.pkl'
        similarity_path = '/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/similarity.pkl'
        print("Checking file existence...")
        print(f"Course DF path: {new_df_path} -> Exists? {os.path.exists(new_df_path)}")
        print(f"Similarity path: {similarity_path} -> Exists? {os.path.exists(similarity_path)}")
        
        if not os.path.exists(new_df_path) or not os.path.exists(similarity_path):
            return ["Course recommendations not available."]

        new_df = pickle.load(open(new_df_path, 'rb'))
        similarity = pickle.load(open(similarity_path, 'rb'))

        course = course.lower()
        if course not in new_df['course_name'].values:
            return ["No similar courses found."]

        course_index = new_df[new_df['course_name'] == course].index[0]
        distances = similarity[course_index]
        course_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]
        recommended_courses = [new_df.iloc[i[0]].course_name.title() for i in course_list]

        return recommended_courses

    except Exception as e:
        print(f"❌ Error in recommend(): {e}")
        return ["Course recommendations unavailable."]
@app.route('/get/low_performance_with_courses', methods=['GET'])
def get_low_performance_recommendations():
    try:
        mydb = get_db_connection()
        if mydb is None:
            return jsonify({"error": "Database connection failed."}), 500

        mycursor = mydb.cursor()

        query = """
            SELECT 
                r.RecommendationID,
                u.Name AS UserName,
                u.Role,
                k.KPIName,
                pd.ActualValue,
                k.TargetValue,
                ROUND((pd.ActualValue / k.TargetValue) * 100, 2) AS PerformancePercent,
                r.Timestamp,
                r.Text AS RecommendationText,
                r.course_name
            FROM Recommendation r
            JOIN User u ON r.UserID = u.UserID
            JOIN KPI k ON r.KPIID = k.KPIID
            JOIN PerformanceData pd ON pd.UserID = r.UserID AND pd.KPIID = r.KPIID
            WHERE pd.Timestamp = (
                SELECT MAX(pd2.Timestamp) 
                FROM PerformanceData pd2 
                WHERE pd2.UserID = r.UserID AND pd2.KPIID = r.KPIID
            )
            AND ROUND((pd.ActualValue / k.TargetValue) * 100, 2) < 50
            ORDER BY r.Timestamp DESC
            LIMIT 100;
        """

        mycursor.execute(query)
        data = mycursor.fetchall()

        columns = [
            "RecommendationID",
            "UserName",
            "Role",
            "KPIName",
            "ActualValue",
            "TargetValue",
            "PerformancePercent",
            "Timestamp",
            "RecommendationText",
            "CourseName",
        ]

        results = []
        for row in data:
            record = dict(zip(columns, row))
            ts = record["Timestamp"]
            if hasattr(ts, "strftime"):
                record["Timestamp"] = ts.strftime("%a, %d %b %Y %H:%M:%S GMT")
            record["PerformancePercent"] = f"{record['PerformancePercent']}%"
            results.append(record)

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get/my_low_performance_recommendations', methods=['GET'])
@jwt_required()
def get_my_low_performance_recommendations():
    try:
        current_user_name = get_jwt_identity()  # assumes you store Name in JWT identity

        mydb = get_db_connection()
        if mydb is None:
            return jsonify({"error": "Database connection failed."}), 500

        mycursor = mydb.cursor()

        query = """
            SELECT 
                r.RecommendationID,
                u.Name AS UserName,
                u.Role,
                k.KPIName,
                pd.ActualValue,
                k.TargetValue,
                ROUND((pd.ActualValue / k.TargetValue) * 100, 2) AS PerformancePercent,
                r.Timestamp,
                r.Text AS RecommendationText,
                r.course_name
            FROM Recommendation r
            JOIN User u ON r.UserID = u.UserID
            JOIN KPI k ON r.KPIID = k.KPIID
            JOIN PerformanceData pd ON pd.UserID = r.UserID AND pd.KPIID = r.KPIID
            WHERE u.Name = %s
            AND pd.Timestamp = (
                SELECT MAX(pd2.Timestamp) 
                FROM PerformanceData pd2 
                WHERE pd2.UserID = r.UserID AND pd2.KPIID = r.KPIID
            )
            AND ROUND((pd.ActualValue / k.TargetValue) * 100, 2) < 50
            ORDER BY r.Timestamp DESC
            LIMIT 100;
        """

        params = (current_user_name,)

        mycursor.execute(query, params)
        data = mycursor.fetchall()

        columns = [
            "RecommendationID",
            "UserName",
            "Role",
            "KPIName",
            "ActualValue",
            "TargetValue",
            "PerformancePercent",
            "Timestamp",
            "RecommendationText",
            "CourseName",
        ]

        results = []
        for row in data:
            record = dict(zip(columns, row))
            ts = record["Timestamp"]
            if hasattr(ts, "strftime"):
                record["Timestamp"] = ts.strftime("%a, %d %b %Y %H:%M:%S GMT")
            record["PerformancePercent"] = f"{record['PerformancePercent']}%"
            results.append(record)

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/get/performance_insights', methods=['GET'])
def get_performance_insights():
    try:
        mydb = get_db_connection()
        mycursor = mydb.cursor()

        performance_query = """
            SELECT
                SUM(CASE WHEN (pd.ActualValue / k.TargetValue) < 0.5 THEN 1 ELSE 0 END) AS Under_50,
                SUM(CASE WHEN (pd.ActualValue / k.TargetValue) BETWEEN 0.5 AND 0.7 THEN 1 ELSE 0 END) AS Between_50_70,
                SUM(CASE WHEN (pd.ActualValue / k.TargetValue) > 0.7 THEN 1 ELSE 0 END) AS Over_70
            FROM PerformanceData pd
            JOIN KPI k ON pd.KPIID = k.KPIID;
        """
        mycursor.execute(performance_query)
        perf_counts = mycursor.fetchone() or (0, 0, 0)

        kpi_query = """
            SELECT 
                k.KPIName,
                COUNT(*) as Count
            FROM PerformanceData pd
            JOIN KPI k ON pd.KPIID = k.KPIID
            WHERE (pd.ActualValue / k.TargetValue) < 0.7
            GROUP BY k.KPIName;
        """
        mycursor.execute(kpi_query)
        kpi_counts = mycursor.fetchall()

        result = {
            "performance_distribution": {
                "Under 50%": perf_counts[0],
                "50-70%": perf_counts[1],
                "70%+": perf_counts[2]
            },
            "kpi_distribution": [
                {"kpi": row[0], "value": row[1]} for row in kpi_counts
            ]
        }

        mycursor.close()
        mydb.close()

        return jsonify(result)

    except Exception as e:
        print(f"❌ Error fetching insights data: {e}")
        return jsonify({"error": str(e)}), 500



@app.route('/update_settings', methods=['POST'])
@jwt_required()
def update_settings():
    data = request.get_json()
    print("Received update data:", data)

    username = data.get('username')
    email = data.get('email')  
    old_password = data.get('old_password') or data.get('oldPassword')
    new_password = data.get('new_password') or data.get('newPassword')

    if not old_password:
        return jsonify({'error': 'Old password is required.'}), 400

    name = get_jwt_identity()
    print(name,'ezaan')

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        
        cursor.execute("SELECT * FROM User WHERE Name = %s", (name,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found.'}), 404

        
        if not check_password_hash(user['Password'], old_password):
            return jsonify({'error': 'Old password is incorrect.'}), 401

        update_fields = []
        update_values = []

        if username:
            update_fields.append("Name = %s")
            update_values.append(username)

        if email:
            update_fields.append("Email = %s")
            update_values.append(email)

        if new_password:
            hashed_password = generate_password_hash(new_password)
            update_fields.append("Password = %s")
            update_values.append(hashed_password)

        if update_fields:
            update_query = f"UPDATE User SET {', '.join(update_fields)} WHERE Name = %s"
            update_values.append(name)
            cursor.execute(update_query, tuple(update_values))
            db.commit()

        return jsonify({'message': 'Settings updated successfully.'}), 200

    except Exception as e:
        print(f"❌ Error updating settings: {e}")
        return jsonify({'error': 'Failed to update settings.'}), 500


@app.route('/get/latest_performance', methods=['GET'])
@jwt_required()
def get_latest_performance():
    try:
        print("Request received for latest performance data.")

        store_name = get_jwt_identity()
        print(f"Authenticated user: {store_name}")

        if not store_name:
            return jsonify({"error": "User identity not found in token"}), 400

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        
        cursor.execute("SELECT UserID FROM User WHERE Name = %s", (store_name,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            db.close()
            return jsonify({"error": "User not found for store"}), 404

        user_id = user['UserID']

        cursor.execute("SELECT MAX(Timestamp) AS LatestTimestamp FROM PerformanceData WHERE UserID = %s", (user_id,))
        latest_ts_row = cursor.fetchone()
        latest_timestamp = latest_ts_row['LatestTimestamp'] if latest_ts_row else None

        if not latest_timestamp:
            cursor.close()
            db.close()
            return jsonify({"error": "No performance data found for user"}), 404

        cursor.execute("""
            SELECT 
                pd.PerformanceID,
                u.Name AS UserName,
                k.KPIName,
                pd.ActualValue,
                k.TargetValue,
                ROUND(LEAST((pd.ActualValue / k.TargetValue) * 100, 100), 2) AS PerformancePercent,
                pd.Timestamp
            FROM PerformanceData pd
            JOIN User u ON pd.UserID = u.UserID
            JOIN KPI k ON pd.KPIID = k.KPIID
            WHERE pd.UserID = %s AND pd.Timestamp = %s
            ORDER BY pd.PerformanceID
        """, (user_id, latest_timestamp))

        data = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify(data), 200

    except Exception as e:
        print(f"❌ Error fetching latest performance: {e}")
        return jsonify({"error": str(e)}), 500



@app.route('/performance_report', methods=['GET'])
@jwt_required()
def performance_report():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        date_filter = request.args.get('date')
        download = request.args.get('download')

        query = """
            SELECT 
                u.Name AS UserName,
                k.KPIName,
                pd.ActualValue,
                k.TargetValue,
                ROUND(LEAST((pd.ActualValue / k.TargetValue) * 100, 100), 2) AS PerformancePercent,
                pd.Timestamp
            FROM PerformanceData pd
            JOIN User u ON pd.UserID = u.UserID
            JOIN KPI k ON pd.KPIID = k.KPIID
        """
        params = ()

        if date_filter:
            query += " WHERE DATE(pd.Timestamp) = %s"
            params = (date_filter,)

        query += " ORDER BY pd.Timestamp DESC, u.Name"

        cursor.execute(query, params)
        data = cursor.fetchall()

        cursor.close()
        db.close()

        
        if download == '1':
            buffer = BytesIO()
            pdf = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter

            pdf.setFont("Helvetica-Bold", 14)
            pdf.drawString(50, height - 50, "Performance Report")

            pdf.setFont("Helvetica", 10)
            y = height - 80

            headers = ["UserName", "KPIName", "Actual", "Target", "Performance (%)", "Timestamp"]
            col_positions = [50, 150, 300, 350, 420, 500]

            for i, header in enumerate(headers):
                pdf.drawString(col_positions[i], y, header)

            y -= 20

            for row in data:
                if y < 50:
                    pdf.showPage()
                    y = height - 50

                pdf.drawString(col_positions[0], y, row['UserName'])
                pdf.drawString(col_positions[1], y, row['KPIName'])
                pdf.drawString(col_positions[2], y, str(row['ActualValue']))
                pdf.drawString(col_positions[3], y, str(row['TargetValue']))
                pdf.drawString(col_positions[4], y, f"{row['PerformancePercent']}%")
                pdf.drawString(col_positions[5], y, row['Timestamp'].strftime("%Y-%m-%d %H:%M"))

                y -= 18

            pdf.save()
            buffer.seek(0)

            return send_file(
                buffer,
                as_attachment=True,
                download_name="Performance_Report.pdf",
                mimetype='application/pdf'
            )


        return jsonify(data), 200

    except Exception as e:
        print(f"❌ Error in performance report: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/my_performance_report', methods=['GET'])
@jwt_required()
def my_performance_report():
    try:
        current_user_name = get_jwt_identity()  # assuming this holds the Name string

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        date_filter = request.args.get('date')
        download = request.args.get('download')

        query = """
            SELECT 
                u.Name AS UserName,
                k.KPIName,
                pd.ActualValue,
                k.TargetValue,
                ROUND(LEAST((pd.ActualValue / k.TargetValue) * 100, 100), 2) AS PerformancePercent,
                pd.Timestamp
            FROM PerformanceData pd
            JOIN User u ON pd.UserID = u.UserID
            JOIN KPI k ON pd.KPIID = k.KPIID
            WHERE u.Name = %s
        """
        params = (current_user_name,)

        if date_filter:
            query += " AND DATE(pd.Timestamp) = %s"
            params += (date_filter,)

        query += " ORDER BY pd.Timestamp DESC"

        cursor.execute(query, params)
        data = cursor.fetchall()

        cursor.close()
        db.close()

        if download == '1':
            buffer = BytesIO()
            pdf = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter

            pdf.setFont("Helvetica-Bold", 14)
            pdf.drawString(50, height - 50, f"{current_user_name} Performance Report")

            pdf.setFont("Helvetica", 10)
            y = height - 80

            headers = ["UserName", "KPIName", "Actual", "Target", "Performance (%)", "Timestamp"]
            col_positions = [50, 150, 300, 350, 420, 500]

            for i, header in enumerate(headers):
                pdf.drawString(col_positions[i], y, header)

            y -= 20

            for row in data:
                if y < 50:
                    pdf.showPage()
                    y = height - 50

                pdf.drawString(col_positions[0], y, row['UserName'])
                pdf.drawString(col_positions[1], y, row['KPIName'])
                pdf.drawString(col_positions[2], y, str(row['ActualValue']))
                pdf.drawString(col_positions[3], y, str(row['TargetValue']))
                pdf.drawString(col_positions[4], y, f"{row['PerformancePercent']}%")
                pdf.drawString(col_positions[5], y, row['Timestamp'].strftime("%Y-%m-%d %H:%M"))

                y -= 18

            pdf.save()
            buffer.seek(0)

            filename = f"{current_user_name.replace(' ', '_')}_Performance_Report.pdf"

            return send_file(
                buffer,
                as_attachment=True,
                download_name=filename,
                mimetype='application/pdf'
            )

        return jsonify(data), 200

    except Exception as e:
        print(f"❌ Error in my performance report: {e}")
        return jsonify({"error": str(e)}), 500
@app.route('/user_performance_rating', methods=['GET'])
@jwt_required()
def user_performance_rating():
    try:
        username = request.args.get('username')
        if not username:
            return jsonify({"error": "Missing username parameter"}), 400

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        query = """
            SELECT 
                ROUND(LEAST((pd.ActualValue / k.TargetValue) * 100, 100), 2) AS PerformancePercent,
                pd.Timestamp,
                (SELECT COALESCE(SUM(b.is_bot), 0) 
                 FROM BotDetection b 
                 WHERE b.user_id = u.UserID) AS BotsDetected
            FROM PerformanceData pd
            JOIN `User` u ON pd.UserID = u.UserID
            JOIN KPI k ON pd.KPIID = k.KPIID
            WHERE u.Name = %s AND k.Status = 'active'
            ORDER BY pd.Timestamp DESC
            LIMIT 1
        """

        cursor.execute(query, (username,))
        result = cursor.fetchone()

        if not result:
            cursor.close()
            db.close()
            return jsonify({"error": "No performance data found for user"}), 404

        performance_percent = result['PerformancePercent']
        bot_count = result['BotsDetected']
        penalty_per_bot = 2  

        rating = performance_percent - (bot_count * penalty_per_bot)
        rating = max(0, min(100, rating))  

        response = {
            "UserName": username,
            "PerformancePercent": performance_percent,
            "BotCount": bot_count,
            "Rating": float(rating),
            "LastUpdated": result['Timestamp'].strftime("%Y-%m-%d %H:%M:%S"),
        }

        cursor.close()
        db.close()

        return jsonify(response), 200

    except Exception as e:
        print(f"❌ Error in user_performance_rating: {e}")
        return jsonify({"error": str(e)}), 500
    

@app.route('/admin_dashboard_data', methods=['GET'])
@jwt_required()
def admin_dashboard_data():
    try:
        admin_name = "admin"
        db = get_db_connection()  
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) AS total_users FROM User")
        row = cursor.fetchone()
        total_users = row["total_users"] if row else 0

        cursor.execute("SELECT COUNT(*) AS total_bots FROM BotDetection WHERE is_bot = 1")
        row = cursor.fetchone()
        total_bots = row["total_bots"] if row else 0

        cursor.execute("""
            SELECT 
                COUNT(*) AS total_performances,
                SUM(CASE WHEN pd.ActualValue >= k.TargetValue THEN 1 ELSE 0 END) AS achieved_count
            FROM PerformanceData pd
            JOIN KPI k ON pd.KPIID = k.KPIID
            WHERE k.Status = 'active'
        """)
        perf_data = cursor.fetchone() or {"total_performances": 0, "achieved_count": 0}

        total_perf = perf_data.get("total_performances", 0) or 0
        achieved = perf_data.get("achieved_count", 0) or 0
        kpi_achievement_rate = round((achieved / total_perf) * 100, 2) if total_perf > 0 else 0

        cursor.execute("""
            SELECT 
                pd.PerformanceID, u.Name AS user_name, pd.ActualValue, pd.Timestamp, k.KPIName
            FROM PerformanceData pd
            JOIN User u ON pd.UserID = u.UserID
            JOIN KPI k ON pd.KPIID = k.KPIID
            WHERE k.Status = 'active'
            ORDER BY pd.Timestamp DESC
            LIMIT 5
        """)
        recent_performances = cursor.fetchall() or []

        cursor.execute("""
            SELECT 
                k.KPIName,
                COUNT(pd.PerformanceID) AS total_records,
                SUM(CASE WHEN pd.ActualValue >= k.TargetValue THEN 1 ELSE 0 END) AS achieved
            FROM KPI k
            LEFT JOIN PerformanceData pd ON k.KPIID = pd.KPIID
            WHERE k.Status = 'active'
            GROUP BY k.KPIID
        """)
        kpi_summary = cursor.fetchall() or []

        cursor.close()
        db.close()

        return jsonify({
            "admin": admin_name,
            "stats": {
                "total_users": total_users,
                "total_bots": total_bots,
                "kpi_achievement_rate": kpi_achievement_rate,
                "recent_performances_count": len(recent_performances),
            },
            "recent_reports": recent_performances,
            "kpi_summary": kpi_summary
        }), 200

    except Exception as e:
        print(f"❌ Error fetching admin dashboard data: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
