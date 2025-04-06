from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
from dotenv import load_dotenv
from os import environ
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# Initialize Flask app
backend = Flask(__name__)
load_dotenv()
CORS(backend)

# Configuring the backend with environment variables
backend.config['DB_HOST'] = environ.get('DB_HOST')
backend.config['DB_USER'] = environ.get('DB_USER')
backend.config['DB_PASSWORD'] = environ.get('DB_PASSWORD')
backend.config['DB_NAME'] = environ.get('DB_NAME')
backend.config['JWT_SECRET_KEY'] = environ.get('JWT_SECRET_KEY')

# Initializing JWT
jwt = JWTManager(backend)

# Database connection
try:
    mydb = mysql.connector.connect(
        host=backend.config['DB_HOST'],
        user=backend.config['DB_USER'],
        password=backend.config['DB_PASSWORD'],
        database=backend.config['DB_NAME']
    )

    if mydb.is_connected():
        print("✅ Connected to the database")

    mycursor = mydb.cursor()

except Error as e:
    print(f"❌ Error while connecting to MySQL: {e}")

# Login route with JWT generation
@backend.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    Name = data.get('Name')
    password = data.get('password')

    if not Name or not password:
        return jsonify({"error": "Name and password are required"}), 400

    query = "SELECT Name, Password, Role FROM User WHERE Name = %s;"
    mycursor.execute(query, (Name,))
    user = mycursor.fetchone()

    if user:
        Name_, password_hash, role_ = user

        if check_password_hash(password_hash, password):
            access_token = create_access_token(identity=Name, additional_claims={'role': role_})
            return jsonify({'message': 'Login Success', 'access_token': access_token, 'expires_in': 3600})
        else:
            return jsonify({"error": "Invalid password"}), 401

    return jsonify({"error": "Invalid Name"}), 401


@backend.route('/kpi', methods=['GET'])
@jwt_required()

def get_kpis():
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

    return jsonify(kpi_list)


# Verify JWT token
def verify_jwt_token(token):
    try:
        secret_key = environ.get('JWT_SECRET_KEY')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# Route to add KPIs, requires JWT token
@backend.route('/new_kpi', methods=['POST'])
@jwt_required()
def add_kpis():
    try:
        data = request.json
        role = data.get('role')
        kpi_name = data.get('kpi')
        target = data.get('target')

        try:
            target = float(target)
        except ValueError:
            return jsonify({'error': 'Target must be a valid decimal number'}), 400

        status = 'active'
        insert_query = """
            INSERT INTO KPIs (role, kpi_name, target, status)
            VALUES (%s, %s, %s, %s)
        """
        mycursor.execute(insert_query, (role, kpi_name, target, status))
        return jsonify({'message': 'KPI added successfully', 'data': data}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route to get all users, requires JWT token
@backend.route('/get_users', methods=['GET'])
@jwt_required()
def Get_users():
    try:
        # SQL query to join the users and team tables and get the necessary information
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
        
        # Execute the query
        mycursor.execute(query)
        users = mycursor.fetchall()

        user_list = []
        for user in users:
            # Append user data along with team information
            user_list.append({
                "user_id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3],
                "team_name": user[4] if user[4] else 'N/A',  # Handle null team name gracefully
                "manager_id": user[5] if user[5] else 'N/A',  # Handle null manager ID gracefully
            })

        return jsonify(user_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Adding predefined users if they do not already exist
def add_user_if_not_exists(Name, password, role, TeamID=None):
    mycursor.execute("SELECT Name FROM User WHERE Name = %s", (Name,))
    existing_user = mycursor.fetchone()

    if not existing_user:
        email = f"{Name.lower()}@example.com"
        hashed_password = generate_password_hash(password)
        
        sql_query = """
        INSERT INTO User (Name, Email, Password, Role, TeamID)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        values = (Name, email, hashed_password, role, TeamID)
        
        mycursor.execute(sql_query, values)
        mydb.commit()
        print(f"✅ User '{Name}' added successfully!")
    else:
        print(f"⚠️ User '{Name}' already exists, skipping insertion.")


# Predefined users list to add to the database
predefined_User = [
    {"UserID": 1, "Name": "zephyr_manager", "Email": "zephyr_manager@example.com", "Role": "Project Manager", "Password": "Manager$2025!", "TeamID": 2},
    {"UserID": 2, "Name": "nova_staff", "Email": "nova_staff@example.com", "Role": "Staff", "Password": "Staff#2025!", "TeamID": 4},
    {"UserID": 3, "Name": "admin1", "Email": "admin1@example.com", "Role": "Admin", "Password": "Admin@2025", "TeamID": None},
    {"UserID": 4, "Name": "Ali Khan", "Email": "ali.khan@example.com", "Role": "Software Engineer", "Password": "SoftwareEng#2025!", "TeamID": 1},
    {"UserID": 5, "Name": "Priya Sharma", "Email": "priya.sharma@example.com", "Role": "Project Manager", "Password": "ProjectMngr#2025!", "TeamID": 2},
    {"UserID": 6, "Name": "Samuel Lee", "Email": "samuel.lee@example.com", "Role": "Business Manager", "Password": "BusinessMgr#2025!", "TeamID": 3},
    {"UserID": 7, "Name": "Anjali Gupta", "Email": "anjali.gupta@example.com", "Role": "Testing", "Password": "TestingTeam#2025!", "TeamID": 4},
    {"UserID": 8, "Name": "Michael Johnson", "Email": "michael.johnson@example.com", "Role": "Software Engineer", "Password": "SoftwareEng#2025!", "TeamID": 1},
    {"UserID": 9, "Name": "Sara Ali", "Email": "sara.ali@example.com", "Role": "Project Manager", "Password": "ProjectMngr#2025!", "TeamID": 2},
    {"UserID": 10, "Name": "Ravi Patel", "Email": "ravi.patel@example.com", "Role": "Software Engineer", "Password": "SoftwareEng#2025!", "TeamID": 1},
    {"UserID": 11, "Name": "Sofia Williams", "Email": "sofia.williams@example.com", "Role": "Business Manager", "Password": "BusinessMgr#2025!", "TeamID": 3},
    {"UserID": 12, "Name": "David Thompson", "Email": "david.thompson@example.com", "Role": "Testing", "Password": "TestingTeam#2025!", "TeamID": 4},
    {"UserID": 13, "Name": "Zara Hussain", "Email": "zara.hussain@example.com", "Role": "Software Engineer", "Password": "SoftwareEng#2025!", "TeamID": 1},
    {"UserID": 14, "Name": "Elena Torres", "Email": "elena.torres@example.com", "Role": "Project Manager", "Password": "ProjectMngr#2025!", "TeamID": 5}
]

# Add predefined users
for user in predefined_User:
    add_user_if_not_exists(user["Name"], user["Password"], user["Role"], user["TeamID"])

# Running the Flask app
if __name__ == '__main__':
    backend.run(debug=True)
