from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
from dotenv import load_dotenv
from os import environ
from werkzeug.security import  check_password_hash,generate_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
backend = Flask(__name__)
load_dotenv()

CORS(backend) 
backend.config['DB_HOST'] = environ.get('DB_HOST')
backend.config['DB_USER'] = environ.get('DB_USER')
backend.config['DB_PASSWORD'] = environ.get('DB_PASSWORD')
backend.config['DB_NAME'] = environ.get('DB_NAME')
backend.config['JWT_SECRET_KEY'] =environ.get('JWT_SECRET_KEY')
jwt = JWTManager(backend)

try:
    mydb = mysql.connector.connect(
        host=backend.config['DB_HOST'],
        user=backend.config['DB_USER'],
        password=backend.config['DB_PASSWORD'],
        database=backend.config['DB_NAME']
    )

    if mydb.is_connected():
        print("Connected to the database")

    mycursor = mydb.cursor()

except Error as e:
    print(f"Error while connecting to MySQL: {e}")
@backend.route('/login',methods = ['GET', 'POST'])
def Login():  
    if request.method == 'POST':
        data=request.get_json()
        username=data['username']
        password=data['password']

  
        
        query = f"SELECT username,password,role FROM users WHERE username = '{username}';"
        mycursor.execute(query)
        users = mycursor.fetchall()
        print(users)
     
        if users:
            username_=users[0][0]
            password_=users[0][1]
            role_=users[0][2]
            print(password_,'ezaan amin')

            if username == username_:
                 try:
                       if check_password_hash(password_, password):
                        access_token = create_access_token(identity=username, additional_claims={'role': role_})
                        return jsonify({'message': 'Login Success', 'access_token': access_token, 'expires_in': 3600})
                       else:
                        return jsonify({"error": "Invalid password"}), 401

                            
                 except:
                        return jsonify({"error": "Invalid password"}), 401
             
    
              
        
        if len(users)==0:
                return jsonify({"error": "Invalid username"}), 401


        
            
     
# @backend.route('/new_user',methods = ['GET', 'POST'])
# def new_user(username, password, role):
#     hashed_password = generate_password_hash(password)
    
#     sql_query = "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)"
#     values = (username, hashed_password, role)
    
#     cursor.execute(sql_query, values)
#     db_connection.commit()
#     print(f"User {username} added successfully!")

# manager_password = 'Manager$2025!'
# hashed_manager_password = generate_password_hash(manager_password)
# new_user('zephyr_manager', hashed_manager_password, 'Manager')

# staff_password = 'Staff#2025!'
# hashed_staff_password = generate_password_hash(staff_password)
# new_user('nova_staff', hashed_staff_password, 'Staff')

# cursor.close()
# db_connection.close()

if __name__ == '__main__':
    backend.run(debug=True)


