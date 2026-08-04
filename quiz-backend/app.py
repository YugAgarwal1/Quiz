from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Flask Server is Running"

if __name__ == "__main__":
    app.run(debug=True)