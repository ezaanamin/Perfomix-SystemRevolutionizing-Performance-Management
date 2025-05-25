from flask import Flask, request, jsonify, make_response
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
from dotenv import load_dotenv
from os import environ
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pickle
import numpy as np


app = Flask(__name__)


load_dotenv()


CORS(app, origins=["http://localhost:3000"])  


app.config['DB_HOST'] = environ.get('DB_HOST')
app.config['DB_USER'] = environ.get('DB_USER')
app.config['DB_PASSWORD'] = environ.get('DB_PASSWORD')
app.config['DB_NAME'] = environ.get('DB_NAME')
app.config['JWT_SECRET_KEY'] = environ.get('JWT_SECRET_KEY')


jwt = JWTManager(app)


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


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('Name')
    password = data.get('password')

    if not name or not password:
        return jsonify({"error": "Name and password are required"}), 400

    query = "SELECT Name, Password, Role FROM User WHERE Name = %s;"
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

@app.route('/new_kpi', methods=['POST'])
@jwt_required()
def add_kpi():
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
            INSERT INTO KPI (role, kpi_name, target, status)
            VALUES (%s, %s, %s, %s)
        """
        mycursor.execute(insert_query, (role, kpi_name, target, status))
        mydb.commit()

        return jsonify({'message': 'KPI added successfully', 'data': data}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_users', methods=['GET'])
@jwt_required()
def get_users():
    try:
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
        mycursor.execute(query)
        users = mycursor.fetchall()

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

        return jsonify(user_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def add_user_if_not_exists(name, password, role, team_id=None):
    mycursor.execute("SELECT Name FROM User WHERE Name = %s", (name,))
    existing_user = mycursor.fetchone()

    if not existing_user:
        email = f"{name.lower()}@example.com"
        hashed_password = generate_password_hash(password)
        
        sql_query = """
        INSERT INTO User (Name, Email, Password, Role, TeamID)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        values = (name, email, hashed_password, role, team_id)
        
        mycursor.execute(sql_query, values)
        mydb.commit()
        print(f"✅ User '{name}' added successfully!")
    else:
        print(f"⚠️ User '{name}' already exists, skipping insertion.")


predefined_users = [
    {"UserID": 1, "Name": "zephyr_manager", "Email": "zephyr_manager@example.com", "Role": "Project Manager", "Password": "Manager$2025!", "TeamID": 2},
    {"UserID": 2, "Name": "nova_staff", "Email": "nova_staff@example.com", "Role": "Staff", "Password": "Staff#2025!", "TeamID": 4},
    {"UserID": 3, "Name": "admin1", "Email": "admin1@example.com", "Role": "Admin", "Password": "Admin@2025", "TeamID": None},
    {"UserID": 4, "Name": "Ali Khan", "Email": "ali.khan@example.com", "Role": "Software Engineer", "Password": "SoftwareEng#2025!", "TeamID": 1},
 
]

@app.route('/edit_kpi/<int:kpi_id>', methods=['POST'])
@jwt_required()
def edit_kpi(kpi_id):
    print("Updating KPI")
    try:
      
        data = request.get_json()
        print(data)

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

for user in predefined_users:
    add_user_if_not_exists(user["Name"], user["Password"], user["Role"], user["TeamID"])


@app.route('/bot_detection',methods=['POST'])
# @jwt_required()
def bot_detection():
    try:
        data = request.get_json()

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
        print(predict)
        return jsonify({"prediction": int(predict[0])})

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 400
    

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 400
if __name__ == '__main__':
    app.run(debug=True)
