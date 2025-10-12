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


#============================ FOR ADDING ============================#
# for adding programs
@programs_bp.route("/add_program", methods=["POST"])
def add_program():
    try:
        data = request.get_json()
        collegecode = data.get("collegecode")
        programcode = data.get("programcode")
        programname = data.get("programname")

        if not collegecode or not programcode or not programname:
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO programs (collegecode, programcode, programname)
            VALUES (%s, %s, %s)
            RETURNING programcode;
        """, (collegecode, programcode, programname))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Program added successfully!"}), 201
    except Exception as e:
        print("Error in add_program:", e)
        return jsonify({"error": str(e)}), 500



#============================ FOR LISTING ALL PROGRAMS ============================#
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
     




#============================ FOR UPDATE ============================#

@programs_bp.route("/programs/<string:programcode>", methods=["PUT"])
def update_college(programcode):
    try:
        data = request.get_json()
        new_college = data.get('collegecode')
        new_code = data.get("programcode")
        new_name = data.get("programname")

        if not new_college or not new_code or not new_name:
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Update the record
        cur.execute("""
            UPDATE programs
            SET collegecode = %s, programcode = %s, programname = %s
            WHERE programcode = %s
            RETURNING programcode;
        """, (new_college, new_code, new_name, programcode))

        updated = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if not updated:
            return jsonify({"error": "Program not found"}), 404

        print(f"Program '{programcode}' updated successfully to '{new_college} / {new_code}' / '{new_name}'")
        return jsonify({"message": "Program updated successfully"}), 200

    except Exception as e:
        print(f"Error updating program: {e}")
        return jsonify({"error": str(e)}), 500



#============================ FOR DELETE ============================#

@programs_bp.route('/delete_program/<string:programcode>', methods=['DELETE'])
def delete_program(programcode):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM programs WHERE programcode = %s;", (programcode,))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": f"Program '{programcode}' deleted successfully."}), 200
    except Exception as e:
        print(f"Error deleting program: {e}")
        return jsonify({"error": str(e)}), 500





#============================ FOR SEARCHING ============================#

@programs_bp.route('/search_program/<string:keyword>', methods=['GET'])
def search_program(keyword):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """ SELECT * FROM programs WHERE collegecode ILIKE %s OR programcode ILIKE %s OR programname ILIKE %s; """
        search_pattern = f"%{keyword}%"

        cur.execute(query, (search_pattern, search_pattern, search_pattern))

        results = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


