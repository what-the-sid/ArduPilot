var attr = {};
var offset = 0;
var i=1;
var file=require("fs").readFileSync('2.bin');
var buffer=file;
var msg_type=[];
msg_type[128]={'Type':'128','length':'89','Name':'FMT','Format':'BBnNZ','Columns':'Type,Length,Name,Format,Columns'};


if (!Buffer.isBuffer(buffer)) {
    throw new Error("argument buffer is not a Buffer object");
}


function FORMAT_TO_STRUCT(obj)
{
    var temp;
    var dict={};

    for (var i = 0; i < obj.length; i++) {
        temp=obj.charAt(i);

        switch(temp){

            case 'b':
                dict[i]=buffer.readInt8(offset);
                offset+=1;
                break;
            case 'B':
                dict[i]=buffer.readUInt8(offset);
                offset+=1;
                break;
            case 'h':
                dict[i]=buffer.readInt16BE(offset);
                offset+=2;
                break;
            case 'H':
                dict[i]=buffer.readUInt16BE(offset);
                offset+=2;
                break;
            case 'f':
                dict[i]=buffer.readFloatLE(offset);
                offset+=4;
                break;
            case 'Q':
                var low = buffer.readUInt32LE(offset);
                offset+=4;
                var n = buffer.readUInt32LE(offset) * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                dict[i]=n;
                offset+=4;
                break;
            case 'q':
                var low = buffer.readInt32LE(offset);
                offset+=4;
                var n = buffer.readInt32LE(offset) * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                dict[i]=n;
                offset+=4;
                break;
            case 'n':
                dict[i]=buffer.toString('ascii', offset, offset + 4).replace(/\x00+$/g, '');
                offset+=4;
                break;
            case 'N':
                dict[i]=buffer.toString('ascii', offset, offset + 16).replace(/\x00+$/g, '');
                offset+=16;
                break;
            case 'Z':
                dict[i]=buffer.toString('ascii', offset, offset + 64).replace(/\x00+$/g, '');
                offset+=64;
                break;
                // i   : int32_t
                // I   : uint32_t
                // f   : float
                // d   : double
                // c   : int16_t * 100
                // C   : uint16_t * 100
                // e   : int32_t * 100
                // E   : uint32_t * 100
                // L   : int32_t latitude/longitude
                // M   : uint8_t flight mode
                // q   : int64_t

        }
    }
    return dict;
}
function DF_reader()
{
    while(!buffer.EOF) {

        var fmt_dict = {};
        offset += 2;
        fmt_dict.attribute = buffer.readUInt8(offset);
        offset += 1;

        if(msg_type[fmt_dict.attribute]!=null) {
            var value = FORMAT_TO_STRUCT(msg_type[fmt_dict.attribute].Format);
            if (fmt_dict.attribute == '128') {
                msg_type[value[0]] = {
                    'Type': value[0],
                    'length': value[1],
                    'Name': value[2],
                    'Format': value[3],
                    'Columns': value[4]
                };
            }
            console.log(value);
        }
        else break;
    }
}
DF_reader();
console.log(msg_type);
