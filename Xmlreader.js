var graphSelector=function(){
  this.type;
  this.button=[];
  this.xmlDoc;
  this.dataSet;
  this.config={
      type: 'line',
      data: {
        lables:[1,2,3],
        datasets: []
      },
      options: {
          responsive: true,
          title:{
              display:true,
              text:''
          },
          tooltips: {
              mode: 'index',
              intersect: false,
          },
          hover: {
              mode: 'nearest',
              intersect: true
          },
          scales: {
              xAxes: [{
                  display: true,
                  scaleLabel: {
                      display: true,
                      labelString: 'time'
                  }
              }],
              yAxes: [{
                  display: true,
                  scaleLabel: {
                      display: true,
                      labelString: 'Data'
                  }
              }]
          }
      }
  };
}

function getMsgType(element,fmt){
  for(i=0;i<fmt.length;i++)
  {
    if(fmt[i]!=null)
    {
      if(fmt[i].Name==element){
        return i;
      }
    }
  }
}

function split(obj){
    var ArrayOfString=obj.split(' ');
    return ArrayOfString;
}

graphSelector.prototype.getDescription=function(id){
  x = this.xmlDoc.getElementsByTagName("graph");
  y=this.xmlDoc.getElementsByTagName("description");
  for (i = 0; i < x.length; i++) {
    if(x[i].getAttributeNode("name").nodeValue==id)
    {
      return y[i].childNodes[0].nodeValue;
    }
  }
}
graphSelector.prototype.clear=function(){
  var txt="";
  return txt;
}
graphSelector.prototype.xmlReader = function () {
  var element,count=0;
  var temp=this.xmlDoc.getElementsByTagName("type");
  var name=this.xmlDoc.getElementsByTagName("graph");
  for(i=0;i<temp.length;i++)
  {
    element=split(temp[i].childNodes[0].nodeValue);
    for(j=0;j<element.length;j++)
    {
      for(k=0;k<this.type.length;k++){
        if(this.type[k]!=null){
        if(element[j]==this.type[k].Name){
          count++;
      }
    }
    }
    }
    if(count==element.length)
    {
    this.button.push(name[i].getAttributeNode("name").nodeValue);
    count=0;}
  }
}
graphSelector.prototype.graphConfig=function(Label,Data,colorNames,time,name)
{
  var colorName = colorNames[this.config.data.datasets.length % colorNames.length];
  var newColor = window.chartColors[colorName];
  var newDataset = {
      label:Label,
      backgroundColor: newColor,
      borderColor: newColor,
      data: Data,
      fill: false
  };
  this.config.data.labels=time;
  this.config.data.datasets.push(newDataset);
  this.config.options.title.text=name;
}

graphSelector.prototype.dataSet=function(getId,parser,color)
{
  var element,element2,TimeUs;
  var id=getId;
  var name=this.xmlDoc.getElementsByTagName("graph");
  var temp=this.xmlDoc.getElementsByTagName("type");
  var columns=this.xmlDoc.getElementsByTagName("expression");
  for(i=0;i<temp.length;i++)
  {
    element=split(temp[i].childNodes[0].nodeValue);
    element2=split(columns[i].childNodes[0].nodeValue);
    if(name[i].getAttributeNode("name").nodeValue==id){
        for(j=0;j<element.length;j++)
        {
          for(k=0;k<element2.length;k++)
          {
            if(element2[k] == 'TimeUS')
            {
              this.label=parser.parse_atOffset(getMsgType(element[j],this.type),element2[k]);
            }
            else{
              this.data=parser.parse_atOffset(getMsgType(element[j],this.type),element2[k]);
              this.graphConfig(element2[k],this.data,color,this.label,id);
            }
          }
        }
    }
    }
  }
