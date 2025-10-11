from flask import Blueprint, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG

students_bp = Blueprint("students_bp", __name__, url_prefix="/api")

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Database connection successful")
        return conn
    except Exception as e:
        print (f"Database connection failed: {e}")
        raise



# for adding students
@students_bp.route("/add_student", methods=["POST"])
def add_student():
    try:
        data = request.get_json()
        programcode = data.get('programcode')
        programname = data.get('programname')
        collegecode = data.get('collegecode')

        if not programcode or not programname or not collegecode:
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection
        cur = conn.cursor()

        cur.execute(
            """"
            INSERT INTO programs (collegecode, programcode, programname)
            VALUES (%s, %s, %s)
            RETURNING programcode;
            """,
            (collegecode, programcode, programname)
        )

        program_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        print(f"Program {programname} registered successfully!")
        return jsonify({'message': 'Program registered successfully!'}), 201
    
    except Exception as e:
        print (f"Error in add_program: {e}")
        return jsonify({'error': str(e)}), 500
    



# list colleges
@programs_bp.route("/program_list", methods=['GET'])
def get_programs():
    try:
        print("GET /api/program_list endpoint hit!")
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM programs;")
        users = cur.fetchall()
        
        print(f"Found {len(users)} users")
        print(f"Users data: {users}")
        
        cur.close()
        conn.close()
        
        return jsonify(users), 200
        
    except Exception as e:
        print(f"Error in get_users: {e}")
        return jsonify({"error": str(e)}), 500