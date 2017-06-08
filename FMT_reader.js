var attr = {};
var offset = 0;
var file=require('fs').readFileSync('2.bin');
var buffer=file;
var temp=0
attr.FMT = [];
while(true) {
var fmt_dict = {};
offset += 2;
fmt_dict.attribute = buffer.readUInt8(offset);
offset += 1;
if(fmt_dict.attribute!="128")
{
    break;
}
fmt_dict.type = buffer.readUInt8(offset);
offset += 1;
fmt_dict.length = buffer.readUInt8(offset);
offset += 1;
fmt_dict.name = buffer.toString('ascii', offset, offset + 4);
offset += 4;
fmt_dict.name = fmt_dict.name.replace(/\x00+$/g, '')
fmt_dict.format = buffer.toString('ascii', offset, offset + 16);
offset += 16;
fmt_dict.format = fmt_dict.format.replace(/\x00+$/g, '')
fmt_dict.columns = buffer.toString('ascii', offset, offset + 64);
offset += 64;
fmt_dict.columns = fmt_dict.columns.replace(/\x00+$/g,'')
attr.FMT.push(fmt_dict);
}
console.log(attr);
