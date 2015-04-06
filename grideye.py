import serial, time

class Grideye():

	SERIAL_PATH = '/dev/tty.usbserial-AE00BUKF'
	BAUD_RATE = 115200
	PREFIX = '$GRIDEYE'
	ser = None
	AMP = 1.0

	def __init__(self):
		self.ser = serial.Serial(self.SERIAL_PATH,
								self.BAUD_RATE,
								timeout=3)

	def getNextArray(self):
		result = list()
		row = self.ser.readline()
		while(row.split(',')[0] != self.PREFIX):
			row = self.ser.readline()

		row = self.ser.readline()
		row = row.split('*')	
		row_l = row[0].split(',')
		row_ints = list()
		for i in xrange(2, 10):
			row_ints.append(int(row_l[i], 16)*self.AMP)
		result.append(row_ints)

		for i in xrange(0, 7):
			row = self.ser.readline()
			row = row.split('*')	
			row_l = row[0].split(',')
			row_ints = list()
			for i in xrange(2, 10):
				row_ints.append(int(row_l[i], 16)*self.AMP)
			result.append(row_ints)
		return result

if __name__ == "__main__":
	ge = Grideye()
	i = 1
	while(1):
		time.sleep(0.01)
		print 'Iteration %d:' % i
		array = ge.getNextArray()
		for el in array:
			print el
		i = i+1