from dotenv import load_dotenv
import os


load_dotenv()


DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST"),
    "port": int(os.getenv("DATABASE_PORT", 5432)),  
    "database": os.getenv("DATABASE_NAME"),
    "user": os.getenv("DATABASE_USER"),
    "password": os.getenv("DATABASE_PASSWORD")
}


class SupabaseConfig:
    URL = os.getenv("SUPABASE_URL")
    KEY = os.getenv("SUPABASE_KEY")


class Config:
    MAIL_SERVER = os.getenv("MAIL_SERVER")  # e.g., sandbox.smtp.mailtrap.io
    MAIL_PORT = int(os.getenv("MAIL_PORT", 2525)) # Default to Mailtrap's common port
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", 'True') == 'True' # True by default
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", 'False') == 'True' # False by default
