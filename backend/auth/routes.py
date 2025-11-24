from flask import Blueprint, jsonify, request, current_app
import requests
import os
from flask_mail import Message
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG
from config import SupabaseConfig
import bcrypt

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api")

def get_db_connection():
    try:
        conn = psycopg2.connect(**SupabaseConfig)
        print("Database connection successful!")
        return conn 
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise


# FOR SENDING EMAIL VIA MAILTRAP (using SMTP/Flask-Mail)
@auth_bp.route("/send-welcome-email", methods=["POST"])
def send_welcome_email():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # Get the mail instance from current app
        mail = current_app.extensions.get('mail')
        if not mail:
            return jsonify({"error": "Mail service not configured"}), 500

        # Create the email message
        message = Message(
            subject='Welcome to SSIS Web App!',
            sender='noreply@ssisweb.com',
            recipients=[email],
            body=f'Welcome to SSIS Web App! Your account has been created successfully.\n\nYou can now access the dashboard and manage your academic data.',
            html=f'<h2>Welcome to SSIS Web App!</h2><p>Your account has been created successfully.</p><p>You can now access the dashboard and manage your academic data.</p>'
        )

        # Send the email
        mail.send(message)
        
        return jsonify({"message": "Welcome email sent successfully!"})
    
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500




# REGISTER USER
@auth_bp.route("/signup", methods=["POST"])
def register_user():
    try:
        data = request.get_json()
        username = data.get("username")
        useremail = data.get("email")
        userpass = data.get("password")
        hashed_pass = bcrypt.hashpw(userpass.encode("utf-8"), bcrypt.gensalt()).decode()

        if not username or not useremail or not userpass:
            return jsonify({"error": "Missing required fields"}), 400
        
        if not bcrypt.checkpw(userpass.encode("utf-8"), userpass["userpass"].encode("utf-8")):
            return jsonify({"error": "Invalid password"}), 401

        conn = get_db_connection()
        cur = conn.cursor()


        cur.execute(
            """
            INSERT INTO users (username, useremail, userpass)
            VALUES (%s, %s, %s)
            RETURNING userid;
            """,
            (username, useremail, hashed_pass)
        )
        user_id = cur.fetchone()[0]
        conn.commit()

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



