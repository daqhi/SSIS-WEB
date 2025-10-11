from flask import Blueprint, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG

programs_bp = Blueprint("programs_bp", __name__, url_prefix="/api")

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Database connection successful")
        return conn
    except Exception as e:
        print (f"Database connection failed: {e}")
        raise



# for adding programs
@programs_bp.route("/add_program", methods=["POST"])
def add_program():
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
            """
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
    



# list programs
@programs_bp.route("/program_list", methods=['GET'])
def get_programs():
    try:
        print("GET /api/program_list endpoint hit!")
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM programs;")
        programs = cur.fetchall()
        
        print(f"Found {len(programs)} prorgams")
        print(f"Users data: {programs}")
        
        cur.close()
        conn.close()
        
        return jsonify(programs), 200
        
    except Exception as e:
        print(f"Error in get_programs: {e}")
        return jsonify({"error": str(e)}), 500