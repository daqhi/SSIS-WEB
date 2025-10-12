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


#============================ FOR ADDING ============================#
# for adding students
@students_bp.route("/add_student", methods=["POST"])
def add_student():
    try:
        data = request.get_json()
        idnum = data.get('idnum')
        firstname = data.get('firstname')
        lastname = data.get('lastname')
        sex = data.get('sex')
        yearlevel = data.get('yearlevel')
        programcode = data.get('programcode')

        if not idnum or not firstname or not lastname or not sex or not yearlevel or not programcode:
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection
        cur = conn.cursor()

        cur.execute(
            """"
            INSERT INTO students (idnum, firstname, lastname, sex, yearlevel, programcode)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING idnum;
            """,
            (idnum, firstname, lastname, sex, yearlevel, programcode)
        ) 

        student_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        print(f"Student {idnum} registered successfully!")
        return jsonify({'message': 'Student registered successfully!'}), 201
    
    except Exception as e:
        print (f"Error in add_student: {e}")
        return jsonify({'error': str(e)}), 500
    



#============================ FOR LISTING ALL STUDENTS ============================#
# list stuenst
@students_bp.route("/student_list", methods=['GET'])
def get_students():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM students;")
        users = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify(users), 200
        
    except Exception as e:
        print(f"Error in get_students: {e}")
        return jsonify({"error": str(e)}), 500
    


#============================ FOR LISTING ALL PROGRAMS ============================#
# list programs
@students_bp.route("/program_list", methods=['GET'])
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

@students_bp.route("/students/<string:idnum>", methods=["PUT"])
def update_student(idnum):
    try:
        data = request.get_json()
        new_idnum = data.get('idnum')
        new_firstname = data.get("firstname")
        new_lastname = data.get("lastname")
        new_sex = data.get('sex')
        new_yearlevel = data.get("yearlevel")
        new_programcode = data.get("programcode")

        if not new_idnum or not new_firstname or not new_lastname or not new_sex or not new_yearlevel or not new_programcode:
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Update the record
        cur.execute("""
            UPDATE students
            SET idnum = %s, firstname = %s, lastname = %s, sex = %s, yearlevel = %s, programcode = %s
            WHERE idnum = %s
            RETURNING idnum;
        """, (new_idnum, new_firstname, new_lastname,new_sex ,new_yearlevel, new_programcode, idnum))

        updated = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if not updated:
            return jsonify({"error": "Student not found"}), 404

        print(f"Student '{idnum}' updated successfully to '{new_idnum}")
        return jsonify({"message": "Student updated successfully"}), 200

    except Exception as e:
        print(f"Error updating student: {e}")
        return jsonify({"error": str(e)}), 500


#============================ FOR DELETE ============================#
@students_bp.route('/delete_student<string:idnum>', methods=['DELETE'])
def delete_student(idnum):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM students WHERE idnum = %s;", (idnum,))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": f"Student '{idnum}' deleted successfully."}), 200
    except Exception as e:
        print(f"Error deleting student: {e}")
        return jsonify({"error": str(e)}), 500




#============================ FOR SEARCHING ============================#

@students_bp.route('/search_student/<string:keyword>', methods=['GET'])
def search_student(keyword):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """ SELECT * FROM students WHERE idnum ILIKE %s OR firstname ILIKE %s OR lastname ILIKE %s OR sex ILIKE %s OR yearlevel ILIKE %s OR programcode ILIKE %s; """
        search_pattern = f"%{keyword}%"

        cur.execute(query, (search_pattern, search_pattern, search_pattern, search_pattern, search_pattern, search_pattern))

        results = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
