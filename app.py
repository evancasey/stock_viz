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

app = Flask(__name__)

app.config.update(
    DEBUG = True,
)

@app.route('/')
def index():
	return render_template('index2.html')

if __name__ == '__main__':
	port = int(os.environ.get("PORT", 5000))
	app.run(host='0.0.0.0', port=port)