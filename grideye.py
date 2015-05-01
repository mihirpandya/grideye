import serial

# Grideye output looks like:
# '$GRIDEYE,0,6C,68,6A,67,71,6F,6E,6F*25\r\n'


class Grideye():

  SERIAL_PATH = '/dev/ttyUSB0'
  BAUD_RATE = 115200
  PREFIX = '$GRIDEYE'
  ser = None

  def __init__(self):
    self.ser = serial.Serial(self.SERIAL_PATH, self.BAUD_RATE, timeout=3)

  def getNextArray(self):
    result = [[]] * 8
    row = self.ser.readline()
    while(row.split(',')[0] != self.PREFIX):
      row = self.ser.readline()

    row = self.ser.readline()
    row = row.split('*')
    row_l = row[0].split(',')
    row_ints = list()
    for i in xrange(2, 10):
      row_ints.append(int(row_l[i], 16))
      result[int(row_l[1])] = row_ints

    for i in xrange(0, 7):
      row = self.ser.readline()
      row = row.split('*')
      row_l = row[0].split(',')
      row_ints = list()
      for i in xrange(2, 10):
        row_ints.append(int(row_l[i][-3:], 16))
        result[int(row_l[1])] = row_ints
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
