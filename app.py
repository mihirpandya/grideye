from flask import Flask, render_template
from flask.ext.socketio import send, emit, SocketIO
from grideye import Grideye
from json import dumps

import time, gevent


app = Flask(__name__)
socketio = SocketIO(app)

ge = Grideye()
sampleArray = [
	[10, 20, 30, 40, 50, 60, 70, 80],
	[10, 20, 30, 40, 50, 60, 70, 80],
	[10, 20, 30, 40, 50, 60, 70, 80],
	[10, 20, 30, 40, 50, 60, 70, 80],
	[10, 20, 30, 40, 50, 60, 70, 80],
	[10, 20, 30, 40, 50, 60, 70, 80],
	[10, 20, 30, 40, 50, 60, 70, 80],
	[10, 20, 30, 40, 50, 60, 70, 80],
]

@app.route("/")
def hello():
    try:
        return render_template('index.html')
    except Exception as e:
        print str(e)

@socketio.on('startUpdate')
def handle_my_custom_event(data):
    while(1):
    	arr = ge.getNextArray()
    	emit('updateArray', arr)
    	gevent.sleep(0.1)

if __name__ == "__main__":
    socketio.run(app)