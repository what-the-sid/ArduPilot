
function Parser(){
  this.buffer;
  this.data;
  this.FMT=[];
  this.FMT[128]={'Type':'128','length':'89','Name':'FMT','Format':'BBnNZ','Columns':'Type,Length,Name,Format,Columns'};
  this.offset=0;
  this.msgType=[];
  this.offsetArray=[];
}

var x_plot=[];
var y_plot=[];
var z_plot=[];
var label_plot=[];


Parser.prototype.FORMAT_TO_STRUCT = function(obj)
{
    var temp;
    var dict={};
    var column=assign_column(obj.Columns);
    for (var i = 0; i < obj.Format.length; i++) {
        temp=obj.Format.charAt(i);
        switch(temp){
            case 'b':
                dict[column[i]]=data.getInt8(this.offset);
                this.offset+=1;
                break;
            case 'B':
                dict[column[i]]=data.getUint8(this.offset);
                this.offset+=1;
                break;
            case 'h':
                dict[column[i]]=data.getInt16(this.offset,true);
                this.offset+=2;
                break;
            case 'H':
                dict[column[i]]=data.getUint16(this.offset,true);
                this.offset+=2;
                break;
            case 'i':
                dict[column[i]]=data.getInt32(this.offset,true);
                this.offset+=4;
                break;
            case 'I':
                dict[column[i]]=data.getUint32(this.offset,true);
                this.offset+=4;
                break;
            case 'f':
                dict[column[i]]=data.getFloat32(this.offset,true);
                this.offset+=4;
                break;
            case 'd':
                dict[column[i]]=data.getFloat64(this.offset,true);
                this.offset+=8;
                break;
            case 'Q':
                var low = data.getUint32(this.offset,true);
                this.offset+=4;
                var n = data.getUint32(this.offset,true) * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                dict[column[i]]=n;
                this.offset+=4;
                break;
            case 'q':
                var low = data.getInt32(this.offset,true);
                this.offset+=4;
                var n = data.getInt32(this.offset,true) * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                dict[column[i]]=n;
                this.offset+=4;
                break;
            case 'n':
                dict[column[i]]=String.fromCharCode.apply(null, new Uint8Array(this.buffer,this.offset,4)).replace(/\x00+$/g, '');
                this.offset+=4;
                break;
            case 'N':
                dict[column[i]]=String.fromCharCode.apply(null, new Uint8Array(this.buffer,this.offset,16)).replace(/\x00+$/g, '');
                this.offset+=16;
                break;
            case 'Z':
                dict[column[i]]=String.fromCharCode.apply(null, new Uint8Array(this.buffer,this.offset,64)).replace(/\x00+$/g, '');
                this.offset+=64;
                break;
            case 'c':
                //data.setInt16(offset,true);
                dict[column[i]]=data.getInt16(this.offset,true)*100;
                this.offset+=2;
                break;
            case 'C':
                //data.setUint16(offset,true);
                dict[column[i]]=data.getUint16(this.offset,true)*100;
                this.offset+=2;
                break;
            case 'E':
                //data.setUint32(offset,true);
                dict[column[i]]=data.getUint32(this.offset,true)*100;
                this.offset+=4;
                break;
            case 'e':
                //data.setInt32(offset,true);
                dict[column[i]]=data.getInt32(this.offset,true)*100;
                this.offset+=4;
                break;
            case 'L':
                //data.setInt32(offset,true);
                dict[column[i]]=data.getInt32(this.offset,true);
                this.offset+=4;
                break;
        }
    }
    return dict;
}

function toGraph(value1,value2,value3,value4)
{
  x_plot.push(value1);
  y_plot.push(value2);
  label_plot.push(value3);
  z_plot.push(value4);
}

Parser.prototype.parse_atOffset=function(type){
     var count=0;
    for(var i=0;i<this.msgType.length;i++)
    {
        if(this.msgType[i]==type) {
            count++;
            this.offset = this.offsetArray[i];
            var temp=this.FORMAT_TO_STRUCT(this.FMT[this.msgType[i]]);
            var time=time_stamp(temp.TimeUS);
            toGraph(temp.AccX,temp.AccY,time,temp.AccZ);
        }
    }
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

Parser.prototype.DF_reader=function()
{
    while(!this.buffer.size) {
        this.offset += 2;
        var attribute = data.getUint8(this.offset);
        this.offset += 1;
        this.offsetArray.push(this.offset);
        this.msgType.push(attribute);
        if(this.FMT[attribute]!=null) {
                var value = this.FORMAT_TO_STRUCT(this.FMT[attribute]);
                if (attribute == '128') {
                    this.FMT[value['Type']] = {
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
