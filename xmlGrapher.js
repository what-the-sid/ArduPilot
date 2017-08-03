var graphSelector=function(){
  this.option=0;
  this.type;
  this.button=[];
  this.list=[];
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
          animation: {
        duration: 1000,
        onProgress: function(animation) {
            progress.value = animation.currentStep / animation.numSteps;
        },
        onComplete: function(animation) {
            window.setTimeout(function() {
                progress.value = 0;
            }, 2000);
        }
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
              yAxes: [
                {
                  "id": "1",
                  display: true,
                  position:"left",
                  scaleLabel: {
                      display: true,
                      labelString: 'Data'
                  },
            },
                {
                  "id": "2",
                  display: true,
                  position:"right",
                  scaleLabel: {
                      display: true,
                      labelString: 'Data2'
                  },
                },
            ]
          }
      }
  };
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

graphSelector.prototype.customLogger = function () {
    var element,count=0;
    var temp=this.xmlDoc.getElementsByTagName("type");
    var name=this.xmlDoc.getElementsByTagName("graph");
    var columns=this.xmlDoc.getElementsByTagName("expression");
    for(i=0;i<temp.length;i++)
    {
      element=split(temp[i].childNodes[0].nodeValue);
      for(j=0;j<element.length;j++)
      {
        for(k=0;k<this.type.length;k++){
          if(this.type[k]!=null){
          if(element[j]==this.type[k].Name){
            var column=columns[i].childNodes[0].nodeValue.split(" ");
            var selected="";
            for(l=0;l<column.length;l++)
            {
              if(this.type[k].Columns.search(column[l])>=1){
                if(l<column.length-1)
              selected+=column[l]+" ";
              else {
                selected+=column[l];
              }
            }
            }
            this.list.push({name:element[j],columns:selected});// if(this.type[k].Columns.search(element[j])>=0)
        }
      }
      }
      }
    }
    this.list=this.list.filter((thing, index, self) => self.findIndex(t => t.name === thing.name ) === index)
  }



graphSelector.prototype.graphConfig=function(Label,Data,colorNames,time,name,date)
{
  var id=["1","2"];
  var positioned;
  if(this.option==0){
    positioned=id[0];
    this.option=1;
  }
  else if(this.option==1){
    positioned=id[1];
    this.option=0;
  }
  var colorName = colorNames[this.config.data.datasets.length % colorNames.length];
  var newColor = window.chartColors[colorName];
  if(Data.length>5){
  var newDataset = {
      "label":Label,
      yAxisID:positioned,
      "backgroundColor": newColor,
      "borderColor": newColor,
      "data": Data,
      "fill": false
  };
  this.config.data.labels=time;
  this.config.data.datasets.push(newDataset);
  this.config.options.title.text=name + "  ( "+ date+ " )";
}
}



graphSelector.prototype.dataSet=function(getId,parser,color)
{
  var element,element2,TimeUs,element3,data=[];
  var id=getId;
  var name=this.xmlDoc.getElementsByTagName("graph");
  var temp=this.xmlDoc.getElementsByTagName("type");
  var columns=this.xmlDoc.getElementsByTagName("expression");
  for(var i=0;i<temp.length;i++)
  {
    if(name[i].getAttributeNode("name").nodeValue==id){
          element=split(temp[i].childNodes[0].nodeValue);
          element2=split(columns[i].childNodes[0].nodeValue);
          var column="";
        for(var j=0;j<element.length;j++)
        {
          for(var k=0;k<element2.length;k++)
          {
            if(k<=element2.length-2)
            column+=element2[k]+",";
            else column+=element2[k];
            }
            data.push({name:element[j],Column:column});
            column="";
          }
    }
    }
    for(var i=0;i<data.length;i++){
      var splitted=data[i].Column.split(",");
      for(var j=0;j<splitted.length;j++){
        if(splitted[j]=='TimeUS')
        this.label=parser.parse_atOffset(data[i].name,splitted[j]);
        else {
          this.data=parser.parse_atOffset(data[i].name,splitted[j]);
        }
        if(this.data!=null){
         element3=data[i].name + "." + splitted[j] + "  ";
        this.graphConfig(element3,this.data,color,this.label,id,parser.time)
      }
      }
    }
  }
