from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from datetime import timedelta
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

# JWT and DB Config
app.config['JWT_SECRET_KEY'] = "myapp"
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

app.config['MYSQL_USER'] = "root"
app.config['MYSQL_PASSWORD'] = "thushika03"
app.config['MYSQL_DB'] = "internship"
app.config['MYSQL_HOST'] = "localhost"
mysql = MySQL(app)

#------------- Register -----------------#
@app.route("/signup", methods=["POST"])
def register():
    data = request.json
    full_name = data.get('name')  # Changed from full_name to match frontend
    email = data.get('email')
    mobile_no = data.get('phone')  # Changed from mobile_no to match frontend
    password = data.get('password')

    if not all([full_name, email, mobile_no, password]):
        return jsonify({"message": "Missing details"}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM customer WHERE email = %s", (email,))
    if cur.fetchone():
        return jsonify({"message": "Account already registered"}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    cur.execute("INSERT INTO customer (full_name, email, mobile_no, password) VALUES (%s, %s, %s, %s)",
                (full_name, email, mobile_no, hashed_pw))
    mysql.connection.commit()
    
    # Create token and return user data
    access_token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
    return jsonify({
        "message": "Account registered successfully",
        "token": access_token,
        "user": {
            "email": email,
            "name": full_name
        }
    }), 201

# ------------------ Login ------------------ #
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Missing login credentials"}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT email, full_name, password FROM customer WHERE email = %s", (email,)) 
    user = cur.fetchone()

    if not user:
        return jsonify({"message": "Account not found"}), 404

    email, full_name, password_hash = user
    if bcrypt.check_password_hash(password_hash, password):
        access_token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
        return jsonify({
            "message": "Login successful", 
            "token": access_token,  # Changed from access_token to token
            "user": {               # Added user object
                "email": email,
                "name": full_name
            }
        }), 200
    else:
        return jsonify({"message": "Invalid password"}), 401
if __name__ == "__main__":
    app.run(debug=True)
    