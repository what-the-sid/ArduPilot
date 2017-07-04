var buffer;
var data;
var FMT=[];
var offset = 0;
var offsetArray=[];
var msgType=[];

FMT[128]={'Type':'128','length':'89','Name':'FMT','Format':'BBnNZ','Columns':'Type,Length,Name,Format,Columns'};


 //if (!Buffer.isBuffer(buffer)) {
      //throw new Error("argument buffer is not a Buffer object");
  //}


function FORMAT_TO_STRUCT(obj)
{
    var temp;
    var dict={};
    var column=assign_column(obj.Columns);
    for (var i = 0; i < obj.Format.length; i++) {
        temp=obj.Format.charAt(i);
        switch(temp){
            case 'b':
                dict[column[i]]=data.getInt8(offset);
                offset+=1;
                break;
            case 'B':
                dict[column[i]]=data.getUint8(offset);
                offset+=1;
                break;
            case 'h':
                dict[column[i]]=data.getInt16(offset,true);
                offset+=2;
                break;
            case 'H':
                dict[column[i]]=data.getUint16(offset,true);
                offset+=2;
                break;
            case 'i':
                dict[column[i]]=data.getInt32(offset,true);
                offset+=4;
                break;
            case 'I':
                dict[column[i]]=data.getUint32(offset,true);
                offset+=4;
                break;
            case 'f':
                dict[column[i]]=data.getFloat32(offset,true);
                offset+=4;
                break;
            case 'd':
                dict[column[i]]=data.getFloat64(offset,true);
                offset+=8;
                break;
            case 'Q':
                var low = data.getUint32(offset,true);
                offset+=4;
                var n = data.getUint32(offset,true) * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                dict[column[i]]=n;
                offset+=4;
                break;
            case 'q':
                var low = data.getInt32(offset,true);
                offset+=4;
                //data.setUint32(offset,true);
                var n = data.getInt32(offset,true) * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                dict[column[i]]=n;
                offset+=4;
                break;
            case 'n':
                dict[column[i]]=String.fromCharCode.apply(null, new Uint8Array(buffer,offset,4)).replace(/\x00+$/g, '');
                offset+=4;
                break;
            case 'N':
                dict[column[i]]=String.fromCharCode.apply(null, new Uint8Array(buffer,offset,16)).replace(/\x00+$/g, '');
                offset+=16;
                break;
            case 'Z':
                dict[column[i]]=String.fromCharCode.apply(null, new Uint8Array(buffer,offset,64)).replace(/\x00+$/g, '');
                offset+=64;
                break;
            case 'c':
                //data.setInt16(offset,true);
                dict[column[i]]=data.getInt16(offset,true)*100;
                offset+=2;
                break;
            case 'C':
                //data.setUint16(offset,true);
                dict[column[i]]=data.getUint16(offset,true)*100;
                offset+=2;
                break;
            case 'E':
                //data.setUint32(offset,true);
                dict[column[i]]=data.getUint32(offset,true)*100;
                offset+=4;
                break;
            case 'e':
                //data.setInt32(offset,true);
                dict[column[i]]=data.getInt32(offset,true)*100;
                offset+=4;
                break;
            case 'L':
                //data.setInt32(offset,true);
                dict[column[i]]=data.getInt32(offset,true);
                offset+=4;
                break;
        }
    }
    return dict;
}

function parse_atOffset(type){
     var count=0;
    for(var i=0;i<msgType.length;i++)
    {
        if(msgType[i]==type) {
            count++;
            offset = offsetArray[i];
            console.log(FORMAT_TO_STRUCT(FMT[msgType[i]]));
        }
    }
    console.log(count);
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
        var attribute = data.getUint8(offset);
        offset += 1;
        offsetArray.push(offset);
        msgType.push(attribute);
        if(FMT[attribute]!=null) {
                var value = FORMAT_TO_STRUCT(FMT[attribute]);
                if (attribute == '128') {
                    FMT[value['Type']] = {
                        'Type': value['Type'],
                        'length': value['Length'],
                        'Name': value['Name'],
                        'Format': value['Format'],
                        'Columns': value['Columns']
                    };
                }
        }
        else break;
    }
}
