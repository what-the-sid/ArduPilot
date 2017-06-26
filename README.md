# ArduPilot DFReader
New ArduPilot JSparser which is capable of reading the binary log.
# To parse a specific dataType:
Add dataType number in the function parse_atOffset(),which is called in last line
# example:
parse_atOffset(174) for ACCX,ACCY,ACCZ parsed values
