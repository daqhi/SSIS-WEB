from flask import Flask
from flask_cors import CORS
from users import users_bp

app = Flask(__name__)

# ✅ Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ✅ Register your blueprint
app.register_blueprint(users_bp)


@app.route("/")
def home():
    return "Flask is running!"

if __name__ == "__main__":
    print("🚀 Starting Flask server...")
    app.run(debug=True, port=5000)