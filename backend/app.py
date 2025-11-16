from flask import Flask
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

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)