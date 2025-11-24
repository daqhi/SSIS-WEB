from flask import Flask, request, jsonify
from flask_cors import CORS
from auth import auth_bp
from colleges import colleges_bp
from programs import programs_bp
from students import students_bp
from flask_mail import Mail, Message
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
mail = Mail(app)

CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(auth_bp)
app.register_blueprint(colleges_bp)
app.register_blueprint(programs_bp)
app.register_blueprint(students_bp)

@app.route("/")
def home():
    return "Flask is running!"

@app.route("/api/send-welcome-email", methods=["POST"])
def send_welcome_email():
    try:
        data = request.get_json()
        to_email = data.get('to_email')
        username = data.get('username')
        
        if not to_email or not username:
            return jsonify({"error": "Missing to_email or username"}), 400
        
        # Create the email message
        msg = Message(
            subject="Welcome to SSIS Web App!",
            sender="noreply@ssisweb.com",  # Use a proper sender email
            recipients=[to_email]
        )
        
        # Email content
        msg.body = f"""
Hello {username}!

Welcome to SSIS Web App! Your account has been created successfully.

You can now access the dashboard and manage your academic data.

Best regards,
SSIS Team
        """
        
        msg.html = f"""
<h2>Welcome to SSIS Web App!</h2>
<p>Hello <strong>{username}</strong>!</p>
<p>Your account has been created successfully. You can now access the dashboard and manage your academic data.</p>
<p>Best regards,<br>SSIS Team</p>
        """
        
        # Send the email
        mail.send(msg)
        
        return jsonify({"message": "Welcome email sent successfully"}), 200
        
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)