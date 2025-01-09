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
def hello_world():  
    if request.method == 'POST':
        data=request.get_json()
        username=data['username']
        password=data['password']
       
        hashed_password = generate_password_hash(password)
        query1 = f"UPDATE users SET password = '{hashed_password}' WHERE username = 'admin_01';"
        mycursor.execute(query1)
   
        try:
            query = f"SELECT username,password,role FROM users WHERE username = '{username}';"
            mycursor.execute(query)
            users = mycursor.fetchall()
            print(users)
            if users:
                username_=users[0][0]
                password_=users[0][1]
                role_=users[0][2]
            # print(password_,'ezaan amin')
                if username == username_:
                    if check_password_hash(password_, password):
                            access_token = create_access_token(identity=username, additional_claims={'role': role_})
                            return jsonify({'message': 'Login Success', 'access_token': access_token, 'expires_in': 3600})
                    else:
                        return jsonify({"error": "Invalid password"}), 401
                else:
                    return jsonify({"error": "Invalid username"}), 401
        except Error as e:
            print( jsonify({"error": f"Error: {e}"}), 500)
    
if __name__ == '__main__':
    backend.run(debug=True)


