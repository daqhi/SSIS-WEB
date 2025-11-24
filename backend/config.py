from dotenv import load_dotenv
import os


load_dotenv()


SupabaseConfig = {
    "host": "db.dynnqdaabhcmfnomebqk.supabase.co",
    "port": 5432,
    "dbname": "web-ssis",
    "user": "postgres",
    "password": "eliabado123",
    "sslmode": "require"      
}


DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST"),
    "port": int(os.getenv("DATABASE_PORT", 5432)),  
    "database": os.getenv("DATABASE_NAME"),
    "user": os.getenv("DATABASE_USER"),
    "password": os.getenv("DATABASE_PASSWORD")
}



class Config:
    MAIL_SERVER = os.getenv("MAIL_SERVER")  # e.g., sandbox.smtp.mailtrap.io
    MAIL_PORT = int(os.getenv("MAIL_PORT", 2525)) # Default to Mailtrap's common port
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", 'True') == 'True' # True by default
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", 'False') == 'True' # False by default
