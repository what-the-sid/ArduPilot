var offset = 0;
var file=require("fs").readFileSync('2.bin');
var buffer=file;
var FMT=[];
var msg_type=[];
var offset_pos=[];

FMT[128]={'Type':'128','length':'89','Name':'FMT','Format':'BBnNZ','Columns':'Type,Length,Name,Format,Columns'};


 if (!Buffer.isBuffer(buffer)) {
      throw new Error("argument buffer is not a Buffer object");
  }


function FORMAT_TO_STRUCT(obj)
{
    var temp;
    var dict={};
    var column=assign_column(obj.Columns);
    for (var i = 0; i < obj.Format.length; i++) {
        temp=obj.Format.charAt(i);
        switch(temp){

            case 'b':
                dict[column[i]]=buffer.readInt8(offset);
                offset+=1;
                break;
            case 'B':
                dict[column[i]]=buffer.readUInt8(offset);
                offset+=1;
                break;
            case 'h':
                dict[column[i]]=buffer.readInt16LE(offset);
                offset+=2;
                break;
            case 'H':
                dict[column[i]]=buffer.readUInt16LE(offset);
                offset+=2;
                break;
            case 'i':
                dict[column[i]]=buffer.readInt32LE(offset);
                offset+=4;
                break;
            case 'I':
                dict[column[i]]=buffer.readUInt32LE(offset);
                offset+=4;
                break;
            case 'f':
                dict[column[i]]=buffer.readFloatLE(offset);
                offset+=4;
                break;
            case 'd':
                dict[column[i]]=buffer.readDoubleLE(offset);
                offset+=8;
                break;
            case 'Q':
                var low = buffer.readUInt32LE(offset);
                offset+=4;
                var n = buffer.readUInt32LE(offset) * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                dict[column[i]]=n;
                offset+=4;
                break;
            case 'q':
                var low = buffer.readInt32LE(offset);
                offset+=4;
                var n = buffer.readInt32LE(offset) * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                dict[column[i]]=n;
                offset+=4;
                break;
            case 'n':
                dict[column[i]]=buffer.toString('ascii', offset, offset + 4).replace(/\x00+$/g, '');
                offset+=4;
                break;
            case 'N':
                dict[column[i]]=buffer.toString('ascii', offset, offset + 16).replace(/\x00+$/g, '');
                offset+=16;
                break;
            case 'Z':
                dict[column[i]]=buffer.toString('ascii', offset, offset + 64).replace(/\x00+$/g, '');
                offset+=64;
                break;
            case 'c':
                dict[column[i]]=buffer.readInt16LE(offset)*100;
                offset+=2;
                break;
            case 'C':
                dict[column[i]]=buffer.readUInt16LE(offset)*100;
                offset+=2;
                break;
            case 'E':
                dict[column[i]]=buffer.readUInt32LE(offset)*100;
                offset+=4;
                break;
            case 'e':
                dict[column[i]]=buffer.readInt32LE(offset)*100;
                offset+=4;
                break;
            case 'L':
                dict[column[i]]=buffer.readInt32LE(offset);
                offset+=4;
                break;
            case 'i':
                dict[column[i]]=buffer.readUInt8(offset);
                offset+=1;
                break;
        }
    }
    return dict;

}


function time_stamp(TimeUs){
    var date = new Date(TimeUs*1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

function assign_column(obj){
    var ArrayOfString=obj.split(',');
    return ArrayOfString;
}


function DF_reader()
{
    while(!buffer.size) {
        offset += 2;
        var attribute = buffer.readUInt8(offset,offset+1);
        offset += 1;
        offset_pos.push(offset);
        msg_type.push(attribute);
        if(FMT[attribute]!=null) {
            try {
                var value = FORMAT_TO_STRUCT(FMT[attribute]);
                if (attribute == '128') {
                    FMT[value['Type']] = {
                        'Type': value['Type'],
                        'length': value['length'],
                        'Name': value['Name'],
                        'Format': value['Format'],
                        'Columns': value['Columns']
                    };
                }
                //if (attribute == '174') {
                    //require("fs").appendFileSync("test.txt", time_stamp(value['TimeUS']) + "," + value['AccX'] + "," + value['AccY'] + "," + value['AccZ'] + "\n");
                //}
            }
            catch(err){
                console.log(err.message);
                break;
            }
            finally{
                console.log(FMT[attribute].Name + ":");
                console.log(value);}
        }
    }
    console.log(offset_pos);
}

DF_reader();
