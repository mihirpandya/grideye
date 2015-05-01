from flask import Flask, render_template
from flask.ext.socketio import send, emit, SocketIO
from grideye import Grideye
from json import dumps

import time, gevent


app = Flask(__name__)
socketio = SocketIO(app)

ge = Grideye()
sampleArray = [
    list(xrange(10, 18)),
    list(xrange(20, 28)),
    list(xrange(30, 38)),
    list(xrange(40, 48)),
    list(xrange(50, 58)),
    list(xrange(60, 68)),
    list(xrange(70, 78)),
    list(xrange(80, 88)),
]


@app.route("/")
def hello():
    try:
        return render_template('index.html')
    except Exception as e:
        print str(e)


@socketio.on('startUpdate')
def handle_my_custom_event(data):
    i = 1
    while(1):
        i = i+1
        arr = ge.getNextArray()
        emit('updateArray', i % 64)
        gevent.sleep(0.01)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0")
