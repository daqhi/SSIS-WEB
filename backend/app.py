# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import pool

load_dotenv()  # loads .env

DB_HOST = os.getenv("DATABASE_HOST", "localhost")
DB_PORT = os.getenv("DATABASE_PORT", "5432")
DB_NAME = os.getenv("DATABASE_NAME")
DB_USER = os.getenv("DATABASE_USER")
DB_PASS = os.getenv("DATABASE_PASSWORD")

app = Flask(__name__)
CORS(app)

# Simple threaded connection pool
conn_pool = psycopg2.pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=10,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASS,
)

def get_conn():
    return conn_pool.getconn()

def put_conn(conn):
    conn_pool.putconn(conn)

@app.route("/api/items", methods=["GET"])
def get_items():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, name, description, created_at FROM items ORDER BY id DESC;")
            rows = cur.fetchall()
            return jsonify(rows), 200
    finally:
        put_conn(conn)

@app.route("/api/items", methods=["POST"])
def create_item():
    data = request.get_json() or {}
    name = data.get("name")
    description = data.get("description")
    if not name:
        return jsonify({"error": "name is required"}), 400

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO items (name, description) VALUES (%s, %s) RETURNING id, name, description, created_at;",
                (name, description),
            )
            new_item = cur.fetchone()
            conn.commit()
            return jsonify(new_item), 201
    finally:
        put_conn(conn)

@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM items WHERE id = %s;", (item_id,))
            if cur.rowcount:
                conn.commit()
                return "", 204
            else:
                return jsonify({"error": "not found"}), 404
    finally:
        put_conn(conn)

# Clean up pool on shutdown (optional)
# @app.teardown_appcontext
# def close_pool(exception):
#     try:
#         if conn_pool:
#             conn_pool.closeall()
#     except Exception:
#         pass

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
