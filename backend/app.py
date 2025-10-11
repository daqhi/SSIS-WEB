from flask import Flask
from flask_cors import CORS
from users import users_bp
from colleges import colleges_bp
from programs import programs_bp
#from students import students_bp



app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(users_bp)
app.register_blueprint(colleges_bp)
app.register_blueprint(programs_bp)

@app.route("/")
def home():
    return "Flask is running!"

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)