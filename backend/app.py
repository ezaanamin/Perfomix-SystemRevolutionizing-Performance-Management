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
import requests # For making HTTP requests to external APIs

import random
app = Flask(__name__)


load_dotenv()


CORS(app, origins=["http://localhost:3000"])  


app.config['DB_HOST'] = environ.get('DB_HOST')
app.config['DB_USER'] = environ.get('DB_USER')
app.config['DB_PASSWORD'] = environ.get('DB_PASSWORD')
app.config['DB_NAME'] = environ.get('DB_NAME')
app.config['JWT_SECRET_KEY'] = environ.get('JWT_SECRET_KEY')

# Updated: External API Configurations
app.config['GITHUB_TOKEN'] = environ.get('GITHUB_TOKEN')
app.config['GITHUB_ORG'] = environ.get('GITHUB_ORG') # Example: 'my-company' (optional, if repo is under an org)
app.config['GITHUB_REPO_OWNER'] = environ.get('GITHUB_REPO_OWNER') # E.g., 'octocat' or the organization name
app.config['GITHUB_REPOS'] = environ.get('GITHUB_REPOS').split(',') if environ.get('GITHUB_REPOS') else [] # Comma-separated list of your GitHub repo names

app.config['JIRA_URL'] = environ.get('JIRA_URL') # Example: 'https://your-company.atlassian.net'
app.config['JIRA_EMAIL'] = environ.get('JIRA_EMAIL')
app.config['JIRA_API_TOKEN'] = environ.get('JIRA_API_TOKEN')
app.config['JIRA_PROJECT_KEY'] = environ.get('JIRA_PROJECT_KEY') # Example: 'PROJ'

# Removed SonarQube configurations
# app.config['SONARQUBE_URL'] = environ.get('SONARQUBE_URL')
# app.config['SONARQUBE_TOKEN'] = environ.get('SONARQUBE_TOKEN')
# app.config['SONARQUBE_PROJECT_KEY'] = environ.get('SONARQUBE_PROJECT_KEY')


jwt = JWTManager(app)

def get_db_connection_and_cursor():
    db = get_db_connection()  # Your existing connection provider
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

def get_db_connection():
    global mydb
    if mydb is None or not mydb.is_connected():
        mydb = mysql.connector.connect(
            host=app.config['DB_HOST'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            database=app.config['DB_NAME']
        )
    return mydb
# --- Helper function to save detected KPI data ---
def save_detected_kpi(kpi_id, detected_value, user_id=None):
    """
    Saves a detected KPI value to the KPIData table.
    Checks if an entry for the same KPI, user, and date already exists to prevent duplicates.
    """
    try:
        detection_date = date.today()

        # Check if an entry for today already exists for this KPI/user
        # This prevents duplicate entries if the detection function is called multiple times on the same day
        check_query = """
            SELECT KPIDataID FROM KPIData 
            WHERE KPIID = %s AND UserID = %s AND DetectionDate = %s
        """
        db = get_db_connection()
        mycursor = db.cursor()
        # Ensure user_id is None if not applicable, as MySQL treats NULL differently
        user_id_param = user_id if user_id is not None else None 
        mycursor.execute(check_query, (kpi_id, user_id_param, detection_date))
        if mycursor.fetchone():
            print(f"KPI {kpi_id} for user {user_id or 'N/A'} already detected today. Skipping save.")
            return

        insert_query = """
            INSERT INTO KPIData (KPIID, UserID, DetectedValue, DetectionDate)
            VALUES (%s, %s, %s, %s)
        """
        mycursor.execute(insert_query, (kpi_id, user_id_param, detected_value, detection_date))
        mydb.commit()
        print(f"✅ Saved detected KPI {kpi_id} with value {detected_value} for user {user_id or 'N/A'}")
    except Exception as e:
        print(f"❌ Error saving detected KPI data: {e}")


# --- External API Integration Functions (fetching raw data) ---

def get_github_commit_frequency_raw(username, since_days=7):
    """
    Fetches raw commit count for a given GitHub username across specified repositories.
    """
    commits_count = 0
    headers = {'Authorization': f'token {app.config["GITHUB_TOKEN"]}',
               'Accept': 'application/vnd.github.v3+json'} # Good practice to specify API version
    since_date = datetime.now() - timedelta(days=since_days)
    since_str = since_date.isoformat()

    repos_to_check = app.config['GITHUB_REPOS']
    if not repos_to_check:
        print("⚠️ GITHUB_REPOS is not configured. Cannot fetch commit frequency.")
        return 0

    for repo_name in repos_to_check:
        owner = app.config['GITHUB_REPO_OWNER'] or app.config['GITHUB_ORG']
        if not owner:
            print(f"❌ GITHUB_REPO_OWNER or GITHUB_ORG not configured for repo {repo_name}.")
            continue

        url = f"https://api.github.com/repos/{owner}/{repo_name}/commits"
        params = {'author': username, 'since': since_str}
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status() # Raise an exception for HTTP errors
            commits = response.json()
            commits_count += len(commits)
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching GitHub commits for {repo_name} (user: {username}): {e}")
            continue # Continue to next repo even if one fails
    return commits_count

def get_github_code_quality_raw(repo_owner, repo_name):
    """
    Fetches raw code quality metrics (number of open alerts) from GitHub Code Scanning.
    A lower number of open alerts implies higher code quality/security.
    """
    if not app.config['GITHUB_TOKEN']:
        print("⚠️ GITHUB_TOKEN not configured. Cannot fetch code scanning alerts.")
        return None

    headers = {
        'Authorization': f'token {app.config["GITHUB_TOKEN"]}',
        'Accept': 'application/vnd.github.v3+json' # Use the Code Scanning API version
    }
    
    # Endpoint to list code scanning alerts for a repository
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/code-scanning/alerts"
    
    # Filter for open alerts on the default branch (assuming 'main' or 'master')
    # You might need to adjust the branch name if your default is different
    params = {'state': 'open', 'ref': 'refs/heads/main'} # or 'refs/heads/master'

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status() # Raise an exception for HTTP errors
        alerts = response.json()
        
        # The KPI for code quality can be the count of open alerts.
        # Fewer alerts = better quality.
        open_alerts_count = len(alerts)
        return open_alerts_count

    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching GitHub Code Scanning alerts for {repo_owner}/{repo_name}: {e}")
        # Return a high number or None to indicate an issue or poor quality
        return None


def get_jira_task_completion_rate_raw(jira_user_email, project_key):
    """
    Fetches raw task completion rate for a user in a specific Jira project.
    """
    url = f"{app.config['JIRA_URL']}/rest/api/2/search"
    auth = (app.config['JIRA_EMAIL'], app.config['JIRA_API_TOKEN'])

    # JQL to find all tasks assigned to the user in the project that are 'Task' or 'Story' type
    total_tasks_jql = f"project = '{project_key}' AND assignee = '{jira_user_email}' AND issuetype in ('Task', 'Story')"
    # JQL to find completed tasks assigned to the user in the project
    completed_tasks_jql = f"project = '{project_key}' AND assignee = '{jira_user_email}' AND statusCategory = 'Done' AND issuetype in ('Task', 'Story')"

    try:
        # Get total tasks
        response_total = requests.get(url, auth=auth, params={'jql': total_tasks_jql, 'maxResults': 0})
        response_total.raise_for_status()
        total_tasks = response_total.json().get('total', 0)

        # Get completed tasks
        response_completed = requests.get(url, auth=auth, params={'jql': completed_tasks_jql, 'maxResults': 0})
        response_completed.raise_for_status()
        completed_tasks = response_completed.json().get('total', 0)

        if total_tasks > 0:
            return (completed_tasks / total_tasks) * 100
        else:
            return 0 # No tasks assigned for the user in this project
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching Jira data for {jira_user_email} in {project_key}: {e}")
        return None


# --- Individual KPI Detection Functions (process raw data and save) ---
# These functions now either use free APIs or provide mock/placeholder values.

def _detect_kpi_code_quality(user_id, repo_owner, repo_name):
    """
    Detects Code Quality KPI (based on GitHub Code Scanning alerts) for a given repository and saves it.
    This KPI is typically project-wide, so `user_id` might be less relevant for saving if it's not a per-user metric.
    Uses GitHub Code Scanning API.
    """
    kpi_name = 'Code Quality'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        
        detected_value = get_github_code_quality_raw(repo_owner, repo_name)
        if detected_value is not None:
            # For project-level KPIs, you might save with UserID as NULL or a special "System" user ID
            # Here, we save with user_id as requested, assuming the user is related to the project/repo.
            save_detected_kpi(kpi_id, detected_value, user_id) 
            return {kpi_name: detected_value}
        else:
            return {kpi_name: "N/A - Error fetching from GitHub Code Scanning"}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_code_efficiency(user_id, user_email):
    """
    Detects Code Efficiency KPI. This is highly dependent on monitoring tools,
    which often have paid tiers. For now, it's a placeholder with a mock value.
    """
    kpi_name = 'Code Efficiency'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder: In a real scenario, integrate with APM tools like New Relic, Dynatrace
        # For demonstration, return a static value or a value from a mock API
        detected_value = 10.0 # Mock value
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_commit_frequency(user_id, github_username):
    """
    Detects Commit Frequency KPI for a software engineer.
    Uses GitHub API.
    """
    kpi_name = 'Commit Frequency'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()

    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))

    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        detected_value = get_github_commit_frequency_raw(github_username)
        if detected_value is not None:
            save_detected_kpi(kpi_id, detected_value, user_id)
            return {kpi_name: detected_value}
        else:
            return {kpi_name: "N/A - Error fetching from GitHub"}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_task_completion_rate(user_id, jira_user_email, jira_project_key):
    """
    Detects Task Completion Rate KPI for a software engineer.
    Uses Jira API (free tier, subject to rate limits).
    """
    kpi_name = 'Task Completion Rate'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        detected_value = get_jira_task_completion_rate_raw(jira_user_email, jira_project_key)
        if detected_value is not None:
            save_detected_kpi(kpi_id, detected_value, user_id)
            return {kpi_name: detected_value}
        else:
            return {kpi_name: "N/A - Error fetching from Jira"}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_milestone_achievement_rate(user_id, project_id=None):
    """
    Detects Milestone Achievement Rate KPI. Typically for a project manager.
    This is a placeholder, as dedicated project management tool APIs often have paid tiers.
    """
    kpi_name = 'Milestone Achievement Rate'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()

    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder for integration with Project Management Tool API (e.g., Asana, MS Project)
        detected_value = 95.0 # Mock value
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_budget_utilization(user_id, project_id=None):
    """
    Detects Budget Utilization KPI. Typically for a project manager.
    This is a placeholder, as financial/ERP system APIs are usually not free.
    """
    kpi_name = 'Budget Utilization'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder for integration with Financial/ERP System API
        detected_value = 5.0 # Mock value
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_resource_allocation(user_id, team_id=None):
    """
    Detects Resource Allocation KPI. Typically for a project manager.
    This is a placeholder, as dedicated resource management tool APIs are usually not free.
    """
    kpi_name = 'Resource Allocation'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder for integration with Resource Management Tool API
        detected_value = 85.0 # Mock value
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_revenue_growth(user_id, period='quarterly'):
    """
    Detects Revenue Growth KPI. Typically for a business manager.
    This is a placeholder, as CRM/ERP/Accounting System APIs are usually not free.
    """
    kpi_name = 'Revenue Growth'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder for integration with CRM/ERP/Accounting System API
        detected_value = 10.0 # Mock value
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_customer_satisfaction(user_id, region=None):
    """
    Detects Customer Satisfaction KPI. Typically for a business manager.
    This is a placeholder. Some survey tools have free tiers, but often with limited API access.
    """
    kpi_name = 'Customer Satisfaction'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder for integration with Survey Tool/CRM API
        detected_value = 80.0 # Mock value
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_operational_efficiency(user_id, process_type=None):
    """
    Detects Operational Efficiency KPI. Typically for a business manager.
    This is a broad KPI and typically requires integration with various operational systems,
    which usually do not offer free APIs for complex metrics.
    """
    kpi_name = 'Operational Efficiency'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder for integration with various operational systems
        detected_value = 15.0 # Mock value
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_test_case_coverage(user_id, project_id):
    """
    Detects Test Case Coverage KPI. Typically for a testing team.
    TestRail is a paid API. This function now returns a mock value.
    For a real implementation, you'd need a free test management solution
    or a custom way to track coverage.
    """
    kpi_name = 'Test Case Coverage'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Mock value as TestRail is a paid API.
        detected_value = 95.0 
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_bug_detection_rate(user_id, project_key):
    """
    Detects Bug Detection Rate KPI. Typically for a testing team.
    This is a placeholder. While Jira has a free tier for issue tracking,
    specific "bug detection rate" often implies more advanced analytics.
    """
    kpi_name = 'Bug Detection Rate'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder for integration with Issue Tracking System (e.g., Jira, Bugzilla)
        detected_value = 100.0 # Mock value
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}

def _detect_kpi_test_execution_time(user_id, pipeline_id=None):
    """
    Detects Test Execution Time KPI. Typically for a testing team.
    This is a placeholder. CI/CD systems often have free tiers, but fetching
    detailed execution times might vary in complexity and accessibility.
    """
    kpi_name = 'Test Execution Time'
    kpi_id = None
    db = get_db_connection()
    mycursor = db.cursor()
    mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
    result = mycursor.fetchone()
    if result:
        kpi_id = result[0]
        # Placeholder for integration with CI/CD system (e.g., Jenkins, GitLab CI)
        detected_value = 20.0 # Mock value (in minutes, hours, etc. - define units)
        save_detected_kpi(kpi_id, detected_value, user_id)
        return {kpi_name: detected_value}
    return {kpi_name: "KPI not found in DB"}


# --- Existing routes ---
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

# def add_user_if_not_exists(name, password, role, team_id=None):
#     # Ensure mydb and mycursor are accessible
   
#     try:
#         db = get_db_connection()
#         mycursor = db.cursor()
#         mycursor.execute("SELECT Name FROM User WHERE Name = %s", (name,))
#         existing_user = mycursor.fetchone()

#         if not existing_user:
#             email = f"{name.lower().replace(' ', '.')}@example.com" # Generate email from name
#             hashed_password = generate_password_hash(password)
            
#             sql_query = """
#             INSERT INTO User (Name, Email, Password, Role, TeamID)
#             VALUES (%s, %s, %s, %s, %s)
#             """
            
#             values = (name, email, hashed_password, role, team_id)
            
#             mycursor.execute(sql_query, values)
#             mydb.commit()
#             print(f"✅ User '{name}' added successfully!")
#         else:
#             print(f"⚠️ User '{name}' already exists, skipping insertion.")
#     except Exception as e:
#         print(f"❌ Error adding user '{name}': {e}")


predefined_users = [
    {"Name": "zephyr_manager", "Role": "Project Manager", "Password": "Manager$2025!", "TeamID": 2},
    {"Name": "nova_staff", "Role": "Staff", "Password": "Staff#2025!", "TeamID": 4},
    {"Name": "admin1", "Role": "Admin", "Password": "Admin@2025", "TeamID": None},
    {"Name": "Ali Khan", "Role": "Software Engineer", "Password": "SoftwareEng#2025!", "TeamID": 1},
    # Add more users if needed, ensuring roles match frontend dropdowns
    {"Name": "Bhavana Rao", "Role": "Software Engineer", "Password": "SoftwareEng#2025!", "TeamID": 1},
    {"Name": "Carlos Diaz", "Role": "Project Manager", "Password": "Manager$2025!", "TeamID": 2},
    {"Name": "Diana Lee", "Role": "Business Manager", "Password": "BusinessM#2025!", "TeamID": 3},
    {"Name": "Eve Singh", "Role": "Testing Team", "Password": "TestingT#2025!", "TeamID": 4},
]

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

        # Extract data with validation
        kpi_name = data.get('kpi')
        target = data.get('target')
        status = data.get('status')

        # Validate that all required fields are present
        if not kpi_name or target is None or not status:
            return jsonify({'error': 'Missing required fields: kpi_name, target, or status'}), 400

        # Validate target as a decimal number
        try:
            target = float(target)
        except ValueError:
            return jsonify({'error': 'Target must be a valid decimal number'}), 400

        # Check if status is a valid value (e.g., 'active' or 'inactive')
        if status not in ['active', 'inactive']:
            return jsonify({'error': 'Invalid status value. It must be "active" or "inactive".'}), 400

        # Your SQL update query
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

# This loop ensures predefined users are added when the app starts
# with app.app_context(): # Ensure app context for database operations
#     for user in predefined_users:
#         # Before adding, ensure TeamID exists if specified
#         if user["TeamID"] is not None:
#             mycursor.execute("SELECT TeamID FROM Team WHERE TeamID = %s", (user["TeamID"],))
#             if mycursor.fetchone() is None:
#                 print(f"⚠️ TeamID {user['TeamID']} for user {user['Name']} does not exist. Skipping user creation or handle gracefully.")
#                 continue # Skip user if team doesn't exist
        
#         add_user_if_not_exists(user["Name"], user["Password"], user["Role"], user["TeamID"])


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

        # Check if a detection exists for this user today
        check_query = """
            SELECT id, is_bot FROM BotDetection
            WHERE user_id = %s AND DATE(detection_date) = %s
        """
        mycursor.execute(check_query, (user_id, today))
        existing = mycursor.fetchone()

        if existing:
            # Detection already done today, return existing result with message
            return jsonify({
                "message": "Bot detection was already done today.",
                "prediction": existing[1]  # is_bot from DB
            }), 200

        # No detection today — perform prediction
        ordered_keys = [
            'comment_length', 'issue_id', 'issue_status', 'issue_resolved',
            'conversation_comments', 'day', 'month', 'year', 'hour', 'minute', 'second',
            'day_issue_created_date', 'month_issue_created_month', 'year_issue_created_year',
            'activity_Closing_issue', 'activity_Commenting_issue', 'activity_Opening_issue',
            'activity_Reopening_issue', 'activity_Transferring_issue'
        ]
        values = [data.get(key, 0) for key in ordered_keys]
        arr = np.array(values, dtype=object).reshape(1, 19)

        # Ensure the path to your pickle file is correct for your environment
        # For example, on a Linux system, it might be:
        # '/path/to/your/backend/pipe.pkl'
        # Or, if it's in the same directory as app.py:
        # import os
        # current_dir = os.path.dirname(os.path.abspath(__file__))
        # model_path = os.path.join(current_dir, 'pipe.pkl')
        pipe = pickle.load(open('/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/pipe.pkl','rb'))

        predict = pipe.predict(arr)
        is_bot = int(predict[0])

        # Insert detection result into DB
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
        mycursor = db.cursor()
        mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s AND Role = %s", (kpi_name, role))
        kpi_id_row = mycursor.fetchone()
        if not kpi_id_row:
            print(f"⚠️ KPIID not found for KPIName={kpi_name}, Role={role}")
            return
        kpi_id = kpi_id_row[0]
        actual_value_float = float(actual_value)
        timestamp = datetime.utcnow()
        sql = "INSERT INTO PerformanceData (UserID, KPIID, ActualValue, Timestamp) VALUES (%s, %s, %s, %s)"
        mycursor.execute(sql, (user_id, kpi_id, actual_value_float, timestamp))
        mydb.commit()
        print(f"✅ Saved performance data: UserID={user_id}, KPI={kpi_name}, Value={actual_value_float}")
    except Exception as e:
        print(f"❌ Error in save_performance_data: {e}")


# --- Random KPI detection helper ---
def get_kpi_value_or_random(func, low, high, *args):
    try:
        return func(*args)
    except NotImplementedError:
        return random.uniform(low, high)


# --- KPI DETECTION FUNCTIONS ---
def get_code_quality_from_github(repo_owner, repo_name):
    raise NotImplementedError("API not available")

def get_efficiency_score(user_email):
    raise NotImplementedError("API not available")

def get_commit_frequency(github_username):
    raise NotImplementedError("API not available")

def get_task_completion_rate(jira_user_email, jira_project_key):
    raise NotImplementedError("API not available")
KPI_TARGETS = {
    "Code Quality": 95,
    "Code Efficiency": 10,
    "Commit Frequency": 10,
    "Task Completion Rate": 90,
    "Milestone Achievement Rate": 95,
    "Budget Utilization": 5,
    "Resource Allocation": 85,
    "Revenue Growth": 10,
    "Customer Satisfaction": 80,
    "Operational Efficiency": 15,
    "Test Case Coverage": 95,
    "Bug Detection Rate": 100,
    "Test Execution Time": 20,
}

def _detect_kpi_code_quality(user_id, repo_owner, repo_name):
    target = KPI_TARGETS["Code Quality"]
    score = random.uniform(target * 0.1, target * 0.9)
    return {"Code Quality": round(score, 2)}

def _detect_kpi_code_efficiency(user_id, user_email):
    target = KPI_TARGETS["Code Efficiency"]
    score = random.uniform(target * 0.1, target * 0.9)
    return {"Code Efficiency": round(score, 2)}

def _detect_kpi_commit_frequency(user_id, github_username):
    target = KPI_TARGETS["Commit Frequency"]
    frequency = random.uniform(target * 0.1, target * 0.9)
    return {"Commit Frequency": round(frequency, 2)}

def _detect_kpi_task_completion_rate(user_id, jira_user_email, jira_project_key):
    target = KPI_TARGETS["Task Completion Rate"]
    rate = random.uniform(target * 0.1, target * 0.9)
    return {"Task Completion Rate": round(rate, 2)}

def _detect_kpi_milestone_achievement_rate(user_id, project_id):
    target = KPI_TARGETS["Milestone Achievement Rate"]
    rate = random.uniform(target * 0.1, target * 0.9)
    return {"Milestone Achievement Rate": round(rate, 2)}

def _detect_kpi_budget_utilization(user_id, project_id):
    target = KPI_TARGETS["Budget Utilization"]
    utilization = random.uniform(target * 0.1, target * 0.9)
    return {"Budget Utilization": round(utilization, 2)}

def _detect_kpi_resource_allocation(user_id, team_id):
    target = KPI_TARGETS["Resource Allocation"]
    allocation = random.uniform(target * 0.1, target * 0.9)
    return {"Resource Allocation": round(allocation, 2)}

def _detect_kpi_revenue_growth(user_id):
    target = KPI_TARGETS["Revenue Growth"]
    growth = random.uniform(target * 0.1, target * 0.9)
    return {"Revenue Growth": round(growth, 2)}

def _detect_kpi_customer_satisfaction(user_id):
    target = KPI_TARGETS["Customer Satisfaction"]
    satisfaction = random.uniform(target * 0.1, target * 0.9)
    return {"Customer Satisfaction": round(satisfaction, 2)}

def _detect_kpi_operational_efficiency(user_id):
    target = KPI_TARGETS["Operational Efficiency"]
    efficiency = random.uniform(target * 0.1, target * 0.9)
    return {"Operational Efficiency": round(efficiency, 2)}

def _detect_kpi_test_case_coverage(user_id, project_id):
    target = KPI_TARGETS["Test Case Coverage"]
    coverage = random.uniform(target * 0.1, target * 0.9)
    return {"Test Case Coverage": round(coverage, 2)}

def _detect_kpi_bug_detection_rate(user_id, project_key):
    target = KPI_TARGETS["Bug Detection Rate"]
    rate = random.uniform(target * 0.1, target * 0.9)
    return {"Bug Detection Rate": round(rate, 2)}

def _detect_kpi_test_execution_time(user_id):
    target = KPI_TARGETS["Test Execution Time"]
    time = random.uniform(target * 0.1, target * 0.9)
    return {"Test Execution Time": round(time, 2)}


def detect_and_save_kpis(user_id, role, detection_functions):
    try:
        db = get_db_connection()
        mycursor = db.cursor()
        mycursor.execute("SELECT Name, Email FROM User WHERE UserID = %s AND Role = %s", (user_id, role))
        user = mycursor.fetchone()
        if not user:
            return jsonify({"error": f"{role} user not found or incorrect role."}), 404

        user_name, user_email = user
        detected_kpis = {}
        active_kpis = get_active_kpis_for_role(role)

        repo_owner = app.config.get('GITHUB_REPO_OWNER') or app.config.get('GITHUB_ORG')
        repo_name = app.config['GITHUB_REPOS'][0] if app.config['GITHUB_REPOS'] else None

        for kpi_name, detect_func in detection_functions.items():
            if kpi_name in active_kpis:
                if kpi_name == 'Code Quality':
                    result = detect_func(user_id, repo_owner, repo_name) if repo_owner and repo_name else {"Code Quality": 0}
                elif kpi_name == 'Code Efficiency':
                    result = detect_func(user_id, user_email)
                elif kpi_name == 'Commit Frequency':
                    result = detect_func(user_id, github_username=user_name)
                elif kpi_name == 'Task Completion Rate':
                    result = detect_func(user_id, jira_user_email=user_email, jira_project_key=app.config['JIRA_PROJECT_KEY'])
                elif kpi_name == 'Milestone Achievement Rate':
                    result = detect_func(user_id, project_id=1)
                elif kpi_name == 'Budget Utilization':
                    result = detect_func(user_id, project_id=1)
                elif kpi_name == 'Resource Allocation':
                    result = detect_func(user_id, team_id=None)
                elif kpi_name == 'Test Case Coverage':
                    result = detect_func(user_id, project_id=1)
                elif kpi_name == 'Bug Detection Rate':
                    result = detect_func(user_id, project_key=app.config['JIRA_PROJECT_KEY'])
                else:
                    result = detect_func(user_id)

                detected_kpis.update(result)

                for key, value in result.items():
                    try:
                        val_float = float(value)
                    except Exception:
                        val_float = 0.0
                    save_performance_data(user_id, key, role, val_float)

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
    detection_functions = {
        "Code Quality": _detect_kpi_code_quality,
        "Code Efficiency": _detect_kpi_code_efficiency,
        "Commit Frequency": _detect_kpi_commit_frequency,
        "Task Completion Rate": _detect_kpi_task_completion_rate,
    }
    return detect_and_save_kpis(user_id, "Software Engineer", detection_functions)


@app.route('/detect_kpi/project_manager/<int:user_id>', methods=['POST'])
@jwt_required()
def detect_project_manager_kpis(user_id):
    detection_functions = {
        "Milestone Achievement Rate": _detect_kpi_milestone_achievement_rate,
        "Budget Utilization": _detect_kpi_budget_utilization,
        "Resource Allocation": _detect_kpi_resource_allocation,
    }
    return detect_and_save_kpis(user_id, "Project Manager", detection_functions)


@app.route('/detect_kpi/business_manager/<int:user_id>', methods=['POST'])
@jwt_required()
def detect_business_manager_kpis(user_id):
    detection_functions = {
        "Revenue Growth": _detect_kpi_revenue_growth,
        "Customer Satisfaction": _detect_kpi_customer_satisfaction,
        "Operational Efficiency": _detect_kpi_operational_efficiency,
    }
    return detect_and_save_kpis(user_id, "Business Manager", detection_functions)


@app.route('/detect_kpi/testing_team/<int:user_id>', methods=['POST'])
@jwt_required()
def detect_testing_team_kpis(user_id):
    detection_functions = {
        "Test Case Coverage": _detect_kpi_test_case_coverage,
        "Bug Detection Rate": _detect_kpi_bug_detection_rate,
        "Test Execution Time": _detect_kpi_test_execution_time,
    }
    return detect_and_save_kpis(user_id, "Testing Team", detection_functions)
# --- Route to get detected KPI data (history) ---
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
        # Cast user_id_filter to int for comparison
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
# @jwt_required()
def get_performance_data_with_percent():
    try:
        mydb = get_db_connection()  # Ensure connection
        mycursor = mydb.cursor()

        query = """
            SELECT 
                pd.PerformanceID,
                u.Name AS UserName,
                k.KPIName,
                pd.ActualValue,
                k.TargetValue,
                ROUND((pd.ActualValue / k.TargetValue) * 100, 2) AS PerformancePercent,
                pd.Timestamp
            FROM PerformanceData pd
            JOIN User u ON pd.UserID = u.UserID
            JOIN KPI k ON pd.KPIID = k.KPIID
            ORDER BY pd.Timestamp DESC;
        """
        mycursor.execute(query)
        data = mycursor.fetchall()

        columns = ["PerformanceID", "UserName", "KPIName", "ActualValue", "TargetValue", "PerformancePercent", "Timestamp"]

        results = [dict(zip(columns, row)) for row in data]

        return jsonify(results)  # ✅ Return as proper JSON HTTP response

    except Exception as e:
        print(f"❌ Error fetching performance data: {e}")
        return jsonify({"error": str(e)}), 500  # Return error as JSON too
    
@app.route('/get/low_performance_with_courses', methods=['GET'])
# @jwt_required()
def get_low_performance_with_courses():
    try:
        mydb = get_db_connection()
        mycursor = mydb.cursor()

        query = """
            SELECT 
                pd.PerformanceID,
                u.Name AS UserName,
                k.KPIName,
                pd.ActualValue,
                k.TargetValue,
                ROUND((pd.ActualValue / k.TargetValue) * 100, 2) AS PerformancePercent,
                pd.Timestamp
            FROM PerformanceData pd
            JOIN User u ON pd.UserID = u.UserID
            JOIN KPI k ON pd.KPIID = k.KPIID
            WHERE (pd.ActualValue / k.TargetValue) < 0.7
            ORDER BY pd.Timestamp DESC;
        """
        mycursor.execute(query)
        data = mycursor.fetchall()

        columns = ["PerformanceID", "UserName", "KPIName", "ActualValue", "TargetValue", "PerformancePercent", "Timestamp"]

        recommended_courses_list = [
            "Effective Communication",
            "Time Management",
            "Advanced Excel",
            "Project Management Basics",
            "Agile Methodologies",
            "Coding Best Practices",
            "Data Analysis with Python",
            "Leadership Skills",
        ]

        results = []
        for row in data:
            record = dict(zip(columns, row))
            # Add random 2 recommended courses for each underperforming user
            record['RecommendedCourses'] = random.sample(recommended_courses_list, 2)
            results.append(record)

        return jsonify(results)

    except Exception as e:
        print(f"❌ Error fetching low performance data: {e}")
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
    email = data.get('email')  # new email field
    old_password = data.get('old_password') or data.get('oldPassword')
    new_password = data.get('new_password') or data.get('newPassword')

    if not old_password:
        return jsonify({'error': 'Old password is required.'}), 400

    name = get_jwt_identity()
    print(name,'ezaan')

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Fetch user by ID
        cursor.execute("SELECT * FROM User WHERE Name = %s", (name,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found.'}), 404

        # Check if old password matches
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


if __name__ == '__main__':
    app.run(debug=True, port=5000)
