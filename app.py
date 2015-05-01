from flask import Flask, render_template
from flask.ext.socketio import send, emit, SocketIO
from grideye import Grideye
from json import dumps
import time, gevent, sys

sys.path.insert(0, 'Adafruit-Raspberry-Pi-Python-Code/Adafruit_ADS1x15/')

from Adafruit_ADS1x15 import ADS1x15

app = Flask(__name__)
socketio = SocketIO(app)

ge = Grideye()
ADS1015 = 0x00  # 12-bit ADC
adc = ADS1x15(ic=ADS1015)

# Select the gain
# gain = 6144  # +/- 6.144V
# gain = 4096  # +/- 4.096V
# gain = 2048  # +/- 2.048V
gain = 1024  # +/- 1.024V
# gain = 512   # +/- 0.512V
# gain = 256   # +/- 0.256V

# Select the sample rate
# sps = 8    # 8 samples per second
# sps = 16   # 16 samples per second
# sps = 32   # 32 samples per second
# sps = 64   # 64 samples per second
# sps = 128  # 128 samples per second
# sps = 250  # 250 samples per second
# sps = 475  # 475 samples per second
sps = 860  # 860 samples per second

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
        try:
            arr = ge.getNextArray()
            volts = adc.readADCSingleEnded(0, gain, sps) / 1000
            if volts < 0.05:
                volts = 0
            data = {}
            data['arr'] = arr
            data['volts'] = volts
            emit('updateArray', data)
            gevent.sleep(0.01)
        except Exception as e:
            print e
            continue

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0")
