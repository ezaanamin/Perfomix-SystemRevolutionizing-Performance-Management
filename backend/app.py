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
import pickle
import random
import os
from requests.auth import HTTPBasicAuth
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

# app.config['SONARQUBE_URL'] = environ.get('SONARQUBE_URL')
# app.config['SONARQUBE_TOKEN'] = environ.get('SONARQUBE_TOKEN')
# app.config['SONARQUBE_PROJECT_KEY'] = environ.get('SONARQUBE_PROJECT_KEY')
# GitHub Config
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPOS = os.getenv("GITHUB_REPOS")

# GitHub API Headers
gh_headers = {"Authorization": f"token {GITHUB_TOKEN}"}

# Jira Config
JIRA_SITE = os.getenv("JIRA_URL")               # Note: your env has `JIRA_URL`
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")

# Jira Auth tuple (email, token)
jira_auth = (JIRA_EMAIL, JIRA_API_TOKEN)

# Jira API Headers
jira_headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}
df = pd.read_csv("/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/budget_allocation_1000.csv")

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
# def save_detected_kpi(kpi_id, detected_value, user_id=None):
#     """
#     Saves a detected KPI value to the KPIData table.
#     Checks if an entry for the same KPI, user, and date already exists to prevent duplicates.
#     """
#     try:
#         detection_date = date.today()

#         # Check if an entry for today already exists for this KPI/user
#         # This prevents duplicate entries if the detection function is called multiple times on the same day
#         check_query = """
#             SELECT KPIDataID FROM KPIData 
#             WHERE KPIID = %s AND UserID = %s AND DetectionDate = %s
#         """
#         db = get_db_connection()
#         mycursor = db.cursor()
#         # Ensure user_id is None if not applicable, as MySQL treats NULL differently
#         user_id_param = user_id if user_id is not None else None 
#         mycursor.execute(check_query, (kpi_id, user_id_param, detection_date))
#         if mycursor.fetchone():
#             print(f"KPI {kpi_id} for user {user_id or 'N/A'} already detected today. Skipping save.")
#             return

#         insert_query = """
#             INSERT INTO KPIData (KPIID, UserID, DetectedValue, DetectionDate)
#             VALUES (%s, %s, %s, %s)
#         """
#         mycursor.execute(insert_query, (kpi_id, user_id_param, detected_value, detection_date))
#         mydb.commit()
#         print(f"✅ Saved detected KPI {kpi_id} with value {detected_value} for user {user_id or 'N/A'}")
#     except Exception as e:
#         print(f"❌ Error saving detected KPI data: {e}")



# def get_github_commit_frequency_raw(username, since_days=7):
  
#     commits_count = 0
#     headers = {'Authorization': f'token {app.config["GITHUB_TOKEN"]}',
#                'Accept': 'application/vnd.github.v3+json'} # Good practice to specify API version
#     since_date = datetime.now() - timedelta(days=since_days)
#     since_str = since_date.isoformat()

#     repos_to_check = app.config['GITHUB_REPOS']
#     if not repos_to_check:
#         print("⚠️ GITHUB_REPOS is not configured. Cannot fetch commit frequency.")
#         return 0

#     for repo_name in repos_to_check:
#         owner = app.config['GITHUB_REPO_OWNER'] or app.config['GITHUB_ORG']
#         if not owner:
#             print(f"❌ GITHUB_REPO_OWNER or GITHUB_ORG not configured for repo {repo_name}.")
#             continue

#         url = f"https://api.github.com/repos/{owner}/{repo_name}/commits"
#         params = {'author': username, 'since': since_str}
        
#         try:
#             response = requests.get(url, headers=headers, params=params)
#             response.raise_for_status() # Raise an exception for HTTP errors
#             commits = response.json()
#             commits_count += len(commits)
#         except requests.exceptions.RequestException as e:
#             print(f"❌ Error fetching GitHub commits for {repo_name} (user: {username}): {e}")
#             continue # Continue to next repo even if one fails
#     return commits_count

# def get_github_code_quality_raw(repo_owner, repo_name):
  
#     if not app.config['GITHUB_TOKEN']:
#         print("⚠️ GITHUB_TOKEN not configured. Cannot fetch code scanning alerts.")
#         return None

#     headers = {
#         'Authorization': f'token {app.config["GITHUB_TOKEN"]}',
#         'Accept': 'application/vnd.github.v3+json' # Use the Code Scanning API version
#     }
    
#     # Endpoint to list code scanning alerts for a repository
#     url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/code-scanning/alerts"
    
#     # Filter for open alerts on the default branch (assuming 'main' or 'master')
#     # You might need to adjust the branch name if your default is different
#     params = {'state': 'open', 'ref': 'refs/heads/main'} # or 'refs/heads/master'

#     try:
#         response = requests.get(url, headers=headers, params=params)
#         response.raise_for_status() # Raise an exception for HTTP errors
#         alerts = response.json()
        
#         # The KPI for code quality can be the count of open alerts.
#         # Fewer alerts = better quality.
#         open_alerts_count = len(alerts)
#         return open_alerts_count

#     except requests.exceptions.RequestException as e:
#         print(f"❌ Error fetching GitHub Code Scanning alerts for {repo_owner}/{repo_name}: {e}")
#         # Return a high number or None to indicate an issue or poor quality
#         return None


# def get_jira_task_completion_rate_raw(jira_user_email, project_key):
   
#     url = f"{app.config['JIRA_URL']}/rest/api/2/search"
#     auth = (app.config['JIRA_EMAIL'], app.config['JIRA_API_TOKEN'])

#     # JQL to find all tasks assigned to the user in the project that are 'Task' or 'Story' type
#     total_tasks_jql = f"project = '{project_key}' AND assignee = '{jira_user_email}' AND issuetype in ('Task', 'Story')"
#     # JQL to find completed tasks assigned to the user in the project
#     completed_tasks_jql = f"project = '{project_key}' AND assignee = '{jira_user_email}' AND statusCategory = 'Done' AND issuetype in ('Task', 'Story')"

#     try:
#         # Get total tasks
#         response_total = requests.get(url, auth=auth, params={'jql': total_tasks_jql, 'maxResults': 0})
#         response_total.raise_for_status()
#         total_tasks = response_total.json().get('total', 0)

#         # Get completed tasks
#         response_completed = requests.get(url, auth=auth, params={'jql': completed_tasks_jql, 'maxResults': 0})
#         response_completed.raise_for_status()
#         completed_tasks = response_completed.json().get('total', 0)

#         if total_tasks > 0:
#             return (completed_tasks / total_tasks) * 100
#         else:
#             return 0 # No tasks assigned for the user in this project
#     except requests.exceptions.RequestException as e:
#         print(f"❌ Error fetching Jira data for {jira_user_email} in {project_key}: {e}")
#         return None


# # --- Individual KPI Detection Functions (process raw data and save) ---
# # These functions now either use free APIs or provide mock/placeholder values.

# def _detect_kpi_code_quality(user_id, repo_owner, repo_name):
#     """
#     Detects Code Quality KPI (based on GitHub Code Scanning alerts) for a given repository and saves it.
#     This KPI is typically project-wide, so `user_id` might be less relevant for saving if it's not a per-user metric.
#     Uses GitHub Code Scanning API.
#     """
#     kpi_name = 'Code Quality'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()
#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
        
#         detected_value = get_github_code_quality_raw(repo_owner, repo_name)
#         if detected_value is not None:
#             # For project-level KPIs, you might save with UserID as NULL or a special "System" user ID
#             # Here, we save with user_id as requested, assuming the user is related to the project/repo.
#             save_detected_kpi(kpi_id, detected_value, user_id) 
#             return {kpi_name: detected_value}
#         else:
#             return {kpi_name: "N/A - Error fetching from GitHub Code Scanning"}
#     return {kpi_name: "KPI not found in DB"}

# def _detect_kpi_code_efficiency(user_id, user_email):
#     """
#     Detects Code Efficiency KPI. This is highly dependent on monitoring tools,
#     which often have paid tiers. For now, it's a placeholder with a mock value.
#     """
#     kpi_name = 'Code Efficiency'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()
#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         # Placeholder: In a real scenario, integrate with APM tools like New Relic, Dynatrace
#         # For demonstration, return a static value or a value from a mock API
#         detected_value = 10.0 # Mock value
#         save_detected_kpi(kpi_id, detected_value, user_id)
#         return {kpi_name: detected_value}
#     return {kpi_name: "KPI not found in DB"}

# def _detect_kpi_commit_frequency(user_id, github_username):
#     """
#     Detects Commit Frequency KPI for a software engineer.
#     Uses GitHub API.
#     """
#     kpi_name = 'Commit Frequency'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()

#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))

#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         detected_value = get_github_commit_frequency_raw(github_username)
#         if detected_value is not None:
#             save_detected_kpi(kpi_id, detected_value, user_id)
#             return {kpi_name: detected_value}
#         else:
#             return {kpi_name: "N/A - Error fetching from GitHub"}
#     return {kpi_name: "KPI not found in DB"}

# def _detect_kpi_task_completion_rate(user_id, jira_user_email, jira_project_key):
#     """
#     Detects Task Completion Rate KPI for a software engineer.
#     Uses Jira API (free tier, subject to rate limits).
#     """
#     kpi_name = 'Task Completion Rate'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()
#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         detected_value = get_jira_task_completion_rate_raw(jira_user_email, jira_project_key)
#         if detected_value is not None:
#             save_detected_kpi(kpi_id, detected_value, user_id)
#             return {kpi_name: detected_value}
#         else:
#             return {kpi_name: "N/A - Error fetching from Jira"}
#     return {kpi_name: "KPI not found in DB"}

# def _detect_kpi_milestone_achievement_rate(user_id, project_id=None):
#     """
#     Detects Milestone Achievement Rate KPI. Typically for a project manager.
#     This is a placeholder, as dedicated project management tool APIs often have paid tiers.
#     """
#     kpi_name = 'Milestone Achievement Rate'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()

#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         # Placeholder for integration with Project Management Tool API (e.g., Asana, MS Project)
#         detected_value = 95.0 # Mock value
#         save_detected_kpi(kpi_id, detected_value, user_id)
#         return {kpi_name: detected_value}
#     return {kpi_name: "KPI not found in DB"}

# def _detect_kpi_bug_detection_rate(user_id, project_key):
#     """
#     Detects Bug Detection Rate KPI. Typically for a testing team.
#     This is a placeholder. While Jira has a free tier for issue tracking,
#     specific "bug detection rate" often implies more advanced analytics.
#     """
#     kpi_name = 'Bug Detection Rate'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()
#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         # Placeholder for integration with Issue Tracking System (e.g., Jira, Bugzilla)
#         detected_value = 100.0 # Mock value
#         save_detected_kpi(kpi_id, detected_value, user_id)
#         return {kpi_name: detected_value}
#     return {kpi_name: "KPI not found in DB"}

# def _detect_kpi_customer_satisfaction(user_id, region=None):
#     """
#     Detects Customer Satisfaction KPI. Typically for a business manager.
#     This is a placeholder. Some survey tools have free tiers, but often with limited API access.
#     """
#     kpi_name = 'Customer Satisfaction'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()
#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         # Placeholder for integration with Survey Tool/CRM API
#         detected_value = 80.0 # Mock value
#         save_detected_kpi(kpi_id, detected_value, user_id)
#         return {kpi_name: detected_value}
#     return {kpi_name: "KPI not found in DB"}

# def _detect_kpi_operational_efficiency(user_id, process_type=None):
#     """
#     Detects Operational Efficiency KPI. Typically for a business manager.
#     This is a broad KPI and typically requires integration with various operational systems,
#     which usually do not offer free APIs for complex metrics.
#     """
#     kpi_name = 'Operational Efficiency'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()
#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         # Placeholder for integration with various operational systems
#         detected_value = 15.0 # Mock value
#         save_detected_kpi(kpi_id, detected_value, user_id)
#         return {kpi_name: detected_value}
#     return {kpi_name: "KPI not found in DB"}

# def _detect_kpi_test_case_coverage(user_id, project_id):
#     """
#     Detects Test Case Coverage KPI. Typically for a testing team.
#     TestRail is a paid API. This function now returns a mock value.
#     For a real implementation, you'd need a free test management solution
#     or a custom way to track coverage.
#     """
#     kpi_name = 'Test Case Coverage'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()
#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         # Mock value as TestRail is a paid API.
#         detected_value = 95.0 
#         save_detected_kpi(kpi_id, detected_value, user_id)
#         return {kpi_name: detected_value}
#     return {kpi_name: "KPI not found in DB"}


# def _detect_kpi_test_execution_time(user_id, pipeline_id=None):
#     """
#     Detects Test Execution Time KPI. Typically for a testing team.
#     This is a placeholder. CI/CD systems often have free tiers, but fetching
#     detailed execution times might vary in complexity and accessibility.
#     """
#     kpi_name = 'Test Execution Time'
#     kpi_id = None
#     db = get_db_connection()
#     mycursor = db.cursor()
#     mycursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s", (kpi_name,))
#     result = mycursor.fetchone()
#     if result:
#         kpi_id = result[0]
#         # Placeholder for integration with CI/CD system (e.g., Jenkins, GitLab CI)
#         detected_value = 20.0 # Mock value (in minutes, hours, etc. - define units)
#         save_detected_kpi(kpi_id, detected_value, user_id)
#         return {kpi_name: detected_value}
#     return {kpi_name: "KPI not found in DB"}



GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPOS = os.getenv("GITHUB_REPOS")

# GitHub API Headers
gh_headers = {"Authorization": f"token {GITHUB_TOKEN}"}

# Jira Config
JIRA_SITE = os.getenv("JIRA_URL")               # Note: your env has `JIRA_URL`
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")


# Jira API Headers
jira_headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}

jira_auth = HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN)
jira_headers = {"Accept": "application/json"}
budget_data = pd.read_csv('/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/budget_allocation_1000.csv')

# GitHub KPIs without project filtering

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


# # --- Existing routes ---
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
        cursor = db.cursor()

        # Fetch KPIID for the given KPIName and Role
        cursor.execute("SELECT KPIID FROM KPI WHERE KPIName = %s AND Role = %s", (kpi_name, role))
        kpi_id_row = cursor.fetchone()
        if not kpi_id_row:
            print(f"⚠️ KPIID not found for KPIName='{kpi_name}', Role='{role}'")
            return

        kpi_id = kpi_id_row[0]
        actual_value_float = float(actual_value)
        timestamp = datetime.utcnow()

        # Insert performance data record
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
SINCE_DATE = "2025-01-01T00:00:00Z"  # Example, update as needed

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


SINCE_DATE = "2025-01-01T00:00:00Z"  # example ISO8601 date for GitHub queries

# --- GitHub API Helpers ---

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPOS = os.getenv("GITHUB_REPOS", "").split(",")
def get_github_headers():
    token = app.config.get("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"token {token}"
    return headers
SINCE_DATE = "2025-01-01T00:00:00Z"  # or whatever date you want to analyze since

HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "Authorization": f"token {GITHUB_TOKEN}"
} if GITHUB_TOKEN else {"Accept": "application/vnd.github.v3+json"}

def _parse_github_date(date_str):
    try:
        return datetime.datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
    except:
        return None

# def detect_code_quality(user_id):
#     """
#     Proxy for code quality: use ratio of closed PRs with requested changes = 0.
#     (Assuming PRs without change requests mean good quality)
#     """
#     repo_owner = GITHUB_REPO_OWNER
#     repo_name = GITHUB_REPOS[0]

#     url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/pulls"
#     params = {"state": "closed", "per_page": 100}
#     page = 1
#     total_prs = 0
#     good_quality_prs = 0

#     while True:
#         params["page"] = page
#         resp = requests.get(url, headers=HEADERS, params=params)
#         if resp.status_code != 200:
#             break
#         prs = resp.json()
#         if not prs:
#             break

#         for pr in prs:
#             if not pr.get("merged_at"):
#                 continue  # Only consider merged PRs
#             pr_number = pr["number"]
#             # Fetch reviews for PR
#             reviews_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/pulls/{pr_number}/reviews"
#             reviews_resp = requests.get(reviews_url, headers=HEADERS)
#             if reviews_resp.status_code != 200:
#                 continue
#             reviews = reviews_resp.json()
#             # Count number of review comments requesting changes
#             change_requests = sum(1 for r in reviews if r.get("state") == "CHANGES_REQUESTED")
#             total_prs += 1
#             if change_requests == 0:
#                 good_quality_prs += 1

#         if "next" not in resp.links:
#             break
#         page += 1

#     quality_score = (good_quality_prs / total_prs) * 100 if total_prs > 0 else 0.0
#     return {"Code Quality": round(quality_score, 2)}

# def detect_code_efficiency(user_id):
#     """
#     Proxy for code efficiency: ratio of lines added vs lines deleted (balance)
#     More balanced changes considered better efficiency
#     """
#     repo_owner = GITHUB_REPO_OWNER
#     repo_name = GITHUB_REPOS[0]

#     url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/commits"
#     params = {"since": SINCE_DATE, "per_page": 100}
#     page = 1
#     total_additions = 0
#     total_deletions = 0

#     while True:
#         params["page"] = page
#         resp = requests.get(url, headers=HEADERS, params=params)
#         if resp.status_code != 200:
#             break
#         commits = resp.json()
#         if not commits:
#             break

#         for commit in commits:
#             commit_url = commit.get("url")
#             if not commit_url:
#                 continue
#             commit_resp = requests.get(commit_url, headers=HEADERS)
#             if commit_resp.status_code != 200:
#                 continue
#             stats = commit_resp.json().get("stats", {})
#             total_additions += stats.get("additions", 0)
#             total_deletions += stats.get("deletions", 0)

#         if "next" not in resp.links:
#             break
#         page += 1

#     if total_additions + total_deletions == 0:
#         efficiency_score = 0.0
#     else:
#         ratio = min(total_additions, total_deletions) / max(total_additions, total_deletions)
#         efficiency_score = ratio * 100  # 0 to 100 scale

#     return {"Code Efficiency": round(efficiency_score, 2)}

# def detect_commit_frequency(user_id):
#     """
#     Count commits since SINCE_DATE as commit frequency score capped at 100
#     """
#     repo_owner = GITHUB_REPO_OWNER
#     repo_name = GITHUB_REPOS[0]

#     url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/commits"
#     params = {"since": SINCE_DATE, "per_page": 100}
#     page = 1
#     total_commits = 0

#     while True:
#         params["page"] = page
#         resp = requests.get(url, headers=HEADERS, params=params)
#         if resp.status_code != 200:
#             break
#         commits = resp.json()
#         if not commits:
#             break
#         total_commits += len(commits)

#         if "next" not in resp.links:
#             break
#         page += 1

#     frequency_score = min(total_commits, 100)
#     return {"Commit Frequency": float(frequency_score)}
# def _detect_kpi_test_case_coverage(user_id, project_id=None):
#     # Example approach:
#     # Count the number of test files changed in recent commits or
#     # Count PRs with "test" in the title or label or with test files changed

#     repo_owner = app.config.get('GITHUB_REPO_OWNER')
#     repos = app.config.get('GITHUB_REPOS', [])
#     if not repo_owner or not repos:
#         return {"Test Case Coverage": 0.0}

#     repo_name = repos[0]
#     url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/pulls"
#     params = {"state": "closed", "sort": "updated", "direction": "desc", "per_page": 100}
#     headers = get_github_headers()
#     page = 1
#     since_dt = _parse_github_date(SINCE_DATE)
#     if not since_dt:
#         return {"Test Case Coverage": 0.0}

#     test_prs_count = 0
#     total_prs_count = 0

#     while True:
#         params["page"] = page
#         response = requests.get(url, headers=headers, params=params)
#         if response.status_code != 200:
#             break
#         prs = response.json()
#         if not prs:
#             break

#         for pr in prs:
#             updated_at_str = pr.get("updated_at")
#             updated_at_dt = _parse_github_date(updated_at_str)
#             if updated_at_dt and updated_at_dt < since_dt:
#                 return {"Test Case Coverage": round((test_prs_count / total_prs_count) * 100, 2) if total_prs_count else 0.0}
#             total_prs_count += 1

#             # Check if PR touches test files or has "test" label/title
#             pr_number = pr.get("number")
#             # Fetch files changed in PR
#             files_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/pulls/{pr_number}/files"
#             files_resp = requests.get(files_url, headers=headers)
#             if files_resp.status_code != 200:
#                 continue
#             files = files_resp.json()
#             has_test_file = any(f.get("filename", "").lower().startswith("test") or "/test" in f.get("filename", "").lower() for f in files)
#             has_test_label = any(label.get("name", "").lower() == "test" for label in pr.get("labels", []))
#             title = pr.get("title", "").lower()

#             if has_test_file or has_test_label or "test" in title:
#                 test_prs_count += 1

#         if "next" not in response.links:
#             break
#         page += 1

#     coverage = round((test_prs_count / total_prs_count) * 100, 2) if total_prs_count else 0.0
#     return {"Test Case Coverage": coverage}

# def _detect_kpi_bug_detection_rate(user_id, project_key=None):
#     # Fetch issues with label "bug" closed or opened since SINCE_DATE, calculate ratio or count

#     repo_owner = app.config.get('GITHUB_REPO_OWNER')
#     repos = app.config.get('GITHUB_REPOS', [])
#     if not repo_owner or not repos:
#         return {"Bug Detection Rate": 0.0}
#     repo_name = repos[0]

#     url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues"
#     params = {
#         "state": "all",
#         "labels": "bug",
#         "since": SINCE_DATE,
#         "per_page": 100
#     }
#     headers = get_github_headers()
#     page = 1
#     bug_issues_count = 0

#     while True:
#         params["page"] = page
#         response = requests.get(url, headers=headers, params=params)
#         if response.status_code != 200:
#             break
#         issues = response.json()
#         if not issues:
#             break

#         # Filter out PRs (issues with 'pull_request' key)
#         bug_issues = [issue for issue in issues if "pull_request" not in issue]
#         bug_issues_count += len(bug_issues)

#         if "next" not in response.links:
#             break
#         page += 1

#     # You might want to normalize bug detection rate, for demo just return count capped at 100
#     rate = min(bug_issues_count, 100)
#     return {"Bug Detection Rate": float(rate)}



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

        repo_owner = GITHUB_REPO_OWNER
        repo_name = GITHUB_REPOS
        jira_project_key = JIRA_PROJECT_KEY

        for kpi_name, detect_func in detection_functions.items():
            if kpi_name not in active_kpis:
                continue

            try:
                # Detect KPI with correct params
                if kpi_name == 'Task Completion Rate':
                    result = detect_func(user_id, jira_user_email=user_email, jira_project_key=jira_project_key)
                elif kpi_name == 'Milestone Achievement Rate':
                    result = detect_func(user_id, project_id=1)
                else:
                    result = detect_func(user_id)

                detected_kpis.update(result)

                # Save each KPI to DB
                for key, value in result.items():
                    try:
                        val_float = float(value)
                    except Exception:
                        val_float = 0.0
                    save_performance_data(user_id, key, role, val_float)

            except Exception as e:
                print(f"⚠️ Error detecting KPI '{kpi_name}': {e}")

        return jsonify({
            "message": f"{role} KPIs detected for {user_name}",
            "detected_kpis": detected_kpis
        }), 200

    except Exception as e:
        print(f"❌ Error in detect_and_save_kpis for {role}: {e}")
        return jsonify({"error": str(e)}), 500

# ----- Flask Routes -----

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
def recommend(course):
    try:
        # Use the same style as your pipe.pkl load:
        new_df_path = '/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/course_df.pkl'
        similarity_path = '/home/ezaan-amin/Documents/PortFolio/Perfomix-SystemRevolutionizing-Performance-Management-main/backend/similarity.pkl'
        print("Checking file existence...")
        print(f"Course DF path: {new_df_path} -> Exists? {os.path.exists(new_df_path)}")
        print(f"Similarity path: {similarity_path} -> Exists? {os.path.exists(similarity_path)}")
        # Check if files exist (optional, but recommended)
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
def get_low_performance_with_courses():
    try:
        mydb = get_db_connection()
        if mydb is None:
            return jsonify({"error": "Database connection failed."}), 500

        mycursor = mydb.cursor()

        query = """
            SELECT 
                pd.PerformanceID,
                u.Name AS UserName,
                u.Role,
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

        columns = ["PerformanceID", "UserName", "Role", "KPIName", "ActualValue", "TargetValue", "PerformancePercent", "Timestamp"]

        role_to_course = {
            'software engineer': 'python data structures',
            'project manager': 'leadership and emotional intelligence',
            'business manager': 'business strategy: business model canvas analysis with miro',
            'testing': 'python data structures',
        }

        results = []
        for row in data:
            record = dict(zip(columns, row))
            role = (record.get('Role') or 'unknown').lower()

            base_course = role_to_course.get(role, 'project management basics')
            recommended_courses = recommend(base_course)

            record['RecommendedCourses'] = recommended_courses
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
