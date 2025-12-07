import pymysql
import os
from config import Config

# Connection Config
DB_HOST = '127.0.0.1'
DB_USER = 'root'
DB_PASSWORD = 'password'
DB_NAME = 'buyme'
DB_PORT = 3000

try:
    # Connect to MySQL Server (no DB selected yet)
    conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, port=DB_PORT)
    cursor = conn.cursor()
    
    # Create DB
    cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
    cursor.execute(f"CREATE DATABASE {DB_NAME}")
    print(f"Database '{DB_NAME}' dropped and recreated successfully.")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error creating database: {e}")
