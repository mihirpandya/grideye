#filters output
import subprocess

proc = subprocess.Popen(['./a.out'], stdout=subprocess.PIPE)
while True:
  line = proc.stdout.readline()
  if line != '':
    #the real code does filtering here
    print "test:", line.rstrip()
  else:
    break
