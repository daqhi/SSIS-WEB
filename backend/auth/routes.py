from flask import Blueprint, jsonify, request, current_app
from flask_mail import Message
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api")

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Database connection successful!")
        return conn 
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise



# REGISTER USER
@auth_bp.route("/register", methods=["POST"])
def register_user():
    try:
        data = request.get_json()
        username = data.get("username")
        useremail = data.get("email")
        userpass = data.get("password")

        if not username or not useremail or not userpass:
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO users (username, useremail, userpass)
            VALUES (%s, %s, %s)
            RETURNING userid;
            """,
            (username, useremail, userpass)
        )
        user_id = cur.fetchone()[0]
        conn.commit()

        mail = current_app.extensions.get('mail')

        message = Message(  
            subject='Account Registration Successful',
            sender='noreply@webssis.com',
            recipients=[useremail],
            body=f'You have registered your account successfully. Welcome to Web SSIS, {username}!'
        )

        mail.send(message)

        cur.close()
        conn.close()

        print(f"User {username} registered successfully with ID {user_id}")
        return jsonify({"message": "User registered successfully!", "userid": user_id}), 201

    except Exception as e:
        print(f"Error in register_user: {e}")
        return jsonify({"error": str(e)}), 500



# GET USERS
@auth_bp.route("/users", methods=["GET"])
def get_users():
    try:
        print("GET /api/users endpoint hit!")
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM users;")
        users = cur.fetchall()
        
        print(f"Found {len(users)} users")
        print(f"Users data: {users}")
        
        cur.close()
        conn.close()
        
        return jsonify(users), 200
        
    except Exception as e:
        print(f"Error in get_users: {e}")
        return jsonify({"error": str(e)}), 500




# LOGIN USER
@auth_bp.route("/login", methods=["POST"])
def login_user():
    try:
        data = request.get_json()
        username = data.get("username")
        userpass = data.get("password")

        if not username or not userpass:
            return jsonify({"error": "Missing username or password"}), 400

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT * FROM users WHERE username = %s;", (username,))
        user = cur.fetchone()

        cur.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if user["userpass"] != userpass:  # (plain text)
            return jsonify({"error": "Invalid password"}), 401

        print(f"User '{username}' logged in successfully!")
        return jsonify({
            "message": "Login successful",
            "user": {
                "userid": user["userid"],
                "username": user["username"],
                "email": user["useremail"]
            }
        }), 200

    except Exception as e:
        print(f"Error in login_user: {e}")
        return jsonify({"error": str(e)}), 500



