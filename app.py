from flask import (
    Flask,
    render_template,
    session,
    redirect,
    request
)
import urllib
import requests
import json
import datetime
import os

#setting up static dir
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../static/')

app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index2.html')

if __name__ == '__main__':
	app.run(debug=True)