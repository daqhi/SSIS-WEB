from flask import Blueprint, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG

colleges_bp = Blueprint("colleges_bp", __name__, url_prefix="/api")

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Database connection successful")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise


# ✅ ADD COLLEGE
@colleges_bp.route("/add_college", methods=["POST"])
def add_college():
    try:
        data = request.get_json()
        collegecode = data.get("collegecode")
        collegename = data.get("collegename")

        if not collegecode or not collegename:
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO colleges (collegecode, collegename)
            VALUES (%s, %s)
            RETURNING collegecode;
            """,
            (collegecode, collegename)
        )

        college_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        print(f"✅ College '{collegename}' added successfully!")
        return jsonify({"message": "College registered successfully!", "collegecode": college_id}), 201

    except Exception as e:
        print(f"❌ Error in add_college: {e}")
        return jsonify({"error": str(e)}), 500


# ✅ LIST COLLEGES
@colleges_bp.route("/college_list", methods=["GET"])
def get_colleges():
    try:
        print("📋 GET /api/college_list endpoint hit!")
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT * FROM colleges;")
        colleges = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify(colleges), 200

    except Exception as e:
        print(f"❌ Error in get_colleges: {e}")
        return jsonify({"error": str(e)}), 500
