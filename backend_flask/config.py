import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev_secret_key_change_in_production'
    # MySQL connection string: mysql+pymysql://username:password@host/db_name
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///buyme.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
