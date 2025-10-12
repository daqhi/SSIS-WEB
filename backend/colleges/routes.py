from flask import Blueprint, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG

colleges_bp = Blueprint("colleges_bp", __name__, url_prefix="/api")

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Database connection successful")
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise


#============================ FOR ADDING ============================#

# for adding colleges
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

        print(f"College '{collegename}' added successfully!")
        return jsonify({"message": "College registered successfully!", "collegecode": college_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#============================ FOR LISTING ALL COLLEGES ============================#

@colleges_bp.route("/college_list", methods=["GET"])
def get_colleges():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM colleges;")
        colleges = cur.fetchall()
        cur.close()
        conn.close()
 
        return jsonify(colleges), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500




#============================ FOR UPDATE ============================#

@colleges_bp.route("/colleges/<string:collegecode>", methods=["PUT"])
def update_college(collegecode):
    try:
        data = request.get_json()
        new_code = data.get("collegecode")
        new_name = data.get("collegename")

        if not new_code or not new_name:
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Update the record
        cur.execute("""
            UPDATE colleges
            SET collegecode = %s, collegename = %s
            WHERE collegecode = %s
            RETURNING collegecode;
        """, (new_code, new_name, collegecode))

        updated = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if not updated:
            return jsonify({"error": "College not found"}), 404

        print(f"College '{collegecode}' updated successfully to '{new_code}' / '{new_name}'")
        return jsonify({"message": "College updated successfully"}), 200

    except Exception as e:
        print(f"Error updating college: {e}")
        return jsonify({"error": str(e)}), 500




#============================ FOR DELETE ============================#

@colleges_bp.route('/delete_college/<string:collegecode>', methods=['DELETE'])
def delete_college(collegecode):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM colleges WHERE collegecode = %s;", (collegecode,))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": f"College '{collegecode}' deleted successfully."}), 200
    except Exception as e:
        print(f"Error deleting college: {e}")
        return jsonify({"error": str(e)}), 500






#============================ FOR SEARCHING ============================#

@colleges_bp.route('/search_college/<string:keyword>', methods=['GET'])
def search_college(keyword):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """ SELECT * FROM colleges WHERE collegecode ILIKE %s OR collegename ILIKE %s; """
        search_pattern = f"%{keyword}%"

        cur.execute(query, (search_pattern, search_pattern))

        results = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500










