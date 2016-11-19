  Meteor.subscribe('Aonly', {
      onReady: function(){
      }
  });

  Meteor.subscribe('Ponly',{
    onReady: function(){
    }
  });

  Meteor.subscribe('Conly',{
    onReady: function(){
    }
  });

  Meteor.subscribe('AP',{
    onReady: function(){
    }
  });

  Meteor.subscribe('AC',{
    onReady: function(){
    }
  });

  Meteor.subscribe('PC',{
    onReady: function(){
    }
  });

  Meteor.subscribe('APC',{
    onReady: function(){
    }
  });

//reactive data
DataforMainTable = [];
DataforMainTableDep = new Tracker.Dependency();
getDataforMainTable = function(){
  DataforMainTableDep.depend();
  return DataforMainTable;
};
setDataforMainTable = function(data){
  DataforMainTable = data;
  DataforMainTableDep.changed();
};
modDataforMainTable = function(data){
  for(var i = 0; i < DataforMainTable.length;i++){
    if(data != DataforMainTable[i].PDLocation){
      DataforMainTable.splice(i,1);
      i--;
    }
  }
  DataforMainTableDep.changed();
};

DataforSelect = [];
DataforSelectDep = new Tracker.Dependency();
getDataforSelect = function(){
  DataforSelectDep.depend();
  return DataforSelect;
};
setDataforSelect = function(data){
  DataforSelect = [];
  $.each(data,function(i,item){
    var nitem = new Object();
    nitem.PDLocation = item;
    DataforSelect.push(nitem);
  });
  DataforSelectDep.changed();
};
rmDataforSelect = function(){
  DataforSelect = [];
  DataforSelectDep.changed();
};

DataforStateTable = [];
DataforStateTableDep = new Tracker.Dependency();
getDataforStateTable = function(){
  DataforStateTableDep.depend();
  return DataforStateTable;
};
setDataforStateTable = function(dataFromTable){
  DataforStateTable = [];
  var field1 = [];
  var field2 = [];
  var total = 0;
  $.each(dataFromTable,function(i,item){
    var flag = 1;
    $.each(field1,function(i,item2){
      if(item2 == item['UserRole']){
        flag = 0;
        field2[i]=field2[i]+1;
      }
    });
    if(flag == 1){
      field1.push(item['UserRole']);
      field2.push(1);
    }
  });
  $.each(field2,function(i,item){
    total+=item;
  });
  field1.push('ALL');
  field2.push(total);
  $.each(field1,function(i,item){
    var row = new Object();
    row.UserRole = item;
    row.Number = field2[i];
    row.Percent = ((field2[i]/total)*100).toFixed(2) + "%";
    DataforStateTable.push(row);
  });
  DataforStateTableDep.changed();
};

r = 110;
CircleColors = {
  a: "#b9f6df",
  b: "#ffb6c1",
  c: "#5DADE2",
  ab: "#e6b09b",
  bc: "#BB8FCE",
  ca: "#2980B9",
  abc: "#993399"
};

function dots(x_0, y_0, r, n) {
    var a = [],
        d_alpha = 2 * Math.PI / n;
    for (var alpha = 0; alpha < 2 * Math.PI; alpha += d_alpha) {
        a.push([
            x_0 + r * Math.cos(alpha),
            y_0 + r * Math.sin(alpha)
        ]);
    }
    return (a);
}

shape_a = d3.geom.polygon(dots(r, r, r, 80));
shape_b = d3.geom.polygon(dots(2 * r, r, r, 80));
shape_c = d3.geom.polygon(dots(1.5 * r, 2 * r, r, 80));

shape_a_x_b = shape_a.slice();
shape_b.reverse().clip(shape_a_x_b);

shape_b_x_c = shape_c.slice();
shape_b.clip(shape_b_x_c);

shape_c_x_a = shape_c.slice();
shape_a.reverse().clip(shape_c_x_a);

shape_abc = shape_c_x_a.slice();
d3.geom.polygon(shape_b_x_c.reverse()).clip(shape_abc);

tooltipA = d3.select("body")
    .append("div")
    .attr("class","tips")
    .attr("data-toggle", "tooltip")
    .style("position", "absolute")
    .style("z-index", "50")
    .style("text-align", "center")
    .style("visibility", "hidden")
    .text("Public Only");

tooltipB = d3.select("body")
    .append("div")
    .attr("class","tips")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Co-mentioned only");

tooltipC = d3.select("body")
    .append("div")
    .attr("class","tips")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Agency Only");

tooltipAB = d3.select("body")
    .append("div")
    .attr("class","tips")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Public + Co-mentioned");

tooltipBC = d3.select("body")
    .append("div")
    .attr("class","tips")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Agency + Co-mentioned");

tooltipCA = d3.select("body")
    .append("div")
    .attr("class","tips")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Agency + Public");

tooltipABC = d3.select("body")
    .append("div")
    .attr("class","tips")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Agency + Public + Co-mentioned");


Template.SocialMedia.onCreated(function(){
});

Template.SocialMedia.onRendered(function(){
  var w = 3 * r;
  var h = 3 * r;


  var svg = d3.select("#polygon1")
              .attr("width",w)
              .attr("height",h);

  var circleA = svg.append("polygon")
                   .attr({
                     id: "polygonA",
                     points: shape_a,
                     fill:CircleColors.a
                    });
  var circleB = svg.append("polygon")
                   .attr({
                     id:"polygonB",
                     points: shape_b,
                     fill:CircleColors.b
                   });

  var circleC = svg.append("polygon")
                   .attr({
                     id:"polygonC",
                     points: shape_c,
                     fill:CircleColors.c
                   });

  var injectionAB = svg.append("polygon")
                       .attr({
                         id:"polygonAB",
                         points: shape_a_x_b,
                         fill: CircleColors.ab
                       });

  var injectionBC = svg.append("polygon")
                       .attr({
                         id:"polygonBC",
                         points: shape_b_x_c,
                         fill: CircleColors.bc
                       })

  var injectionCA = svg.append("polygon")
                       .attr({
                         id:"polygonCA",
                         points: shape_c_x_a,
                         fill: CircleColors.ca
                       })

  var injectionABC = svg.append("polygon")
                        .attr({
                          id:"polygonABC",
                          points: shape_abc,
                          fill: CircleColors.abc
                        })


  Deps.autorun(function(){


  });

});

Template.SocialMedia.helpers({
  showTheMainTable:function(){
    return Session.get('showTheMainTable');
  },
  getTitleText:function(){
    return Session.get('resetFLag');
  },
  getMediaData: function(){
    return getDataforMainTable();
  },
  settings: function(){
    return {
      showFilter:false,
      showNavigation:'auto',
      fields:[
        {key:'PoliceDepartment',label:'PoliceDepartment'},
        {key:'UserName', label:'UserName'},
        {key:'PDLocation', label:'PDLocation'},
        {key:'UserLocation',label:'UserLocation'},
        {key:'UserRole',label:'UserRole'}]
    };
  }
});

Template.SocialMedia.events({
  'mouseover #polygonA': function(e){
    var counter = 0;
    counter = Ponly.find().count();
    $("#p1").html(counter);
    /*d3.csv("data/Ponly.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })*/
    return tooltipA.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonA': function(e){
    return tooltipA.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonA': function(e){
    $("#p1").html("");
    return tooltipA.style("visibility","hidden");
  },

  'click #polygonA': function(e){
    rmDataforSelect();
    Session.set('resetFLag','Public Only');
    Session.set('showTheMainTable',true);
    DataforMainTable = Ponly.find().fetch();
    DataforMainTableDep.changed();
    var field1 = [];
    $.each(DataforMainTable,function(i,item){
      var flag = 1;
      for(var j = 0; j <= field1.length;j++){
        if(field1[j] == item.PDLocation){
          flag = 0;
        }
      }
      if(flag == 1){
        field1.push(item.PDLocation);
      }
    });
    setDataforSelect(field1);
    setDataforStateTable(DataforMainTable);


  },

  'mouseover #polygonB': function(e){
    var counter = 0;
    counter = Conly.find().count();
    $("#p1").html(counter);
    /*d3.csv("data/Conly.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })*/
    return tooltipB.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonB': function(e){
    return tooltipB.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonB': function(e){
    $("#p1").html("");
    return tooltipB.style("visibility","hidden");
  },

  'click #polygonB': function(e){
    rmDataforSelect();
    Session.set('resetFLag','Co-mentioned Only');
    Session.set('showTheMainTable',true);
    DataforMainTable = Conly.find().fetch();
    DataforMainTableDep.changed();
    var field1 = [];
    $.each(DataforMainTable,function(i,item){
      var flag = 1;
      for(var j = 0; j <= field1.length;j++){
        if(field1[j] == item.PDLocation){
          flag = 0;
        }
      }
      if(flag == 1){
        field1.push(item.PDLocation);
      }
    });
    setDataforSelect(field1);
    setDataforStateTable(DataforMainTable);
  },

  'mouseover #polygonC': function(e){
    var counter = 0;
    counter = Aonly.find().count();
    $("#p1").html(counter);
    /*d3.csv("data/Aonly.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })*/
    return tooltipC.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonC': function(e){
    return tooltipC.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonC': function(e){
    $("#p1").html("");
    return tooltipC.style("visibility","hidden");
  },

  'click #polygonC': function(e){
    rmDataforSelect();
    Session.set('resetFLag','Agency Only');
    Session.set('showTheMainTable',true);
    DataforMainTable = Aonly.find().fetch();
    DataforMainTableDep.changed();
    var field1 = [];
    $.each(DataforMainTable,function(i,item){
      var flag = 1;
      for(var j = 0; j <= field1.length;j++){
        if(field1[j] == item.PDLocation){
          flag = 0;
        }
      }
      if(flag == 1){
        field1.push(item.PDLocation);
      }
    });
    setDataforSelect(field1);
    setDataforStateTable(DataforMainTable);
  },

  'mouseover #polygonAB': function(e){
    var counter = 0;
    counter = Pc.find().count();
    $("#p1").html(counter);
    /*d3.csv("data/PC.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })*/
    return tooltipAB.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonAB': function(e){
    return tooltipAB.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonAB': function(e){
    $("#p1").html("");
    return tooltipAB.style("visibility","hidden");
  },

  'click #polygonAB': function(e){
    rmDataforSelect();
    Session.set('resetFLag','Public + Co-mentioned');
    Session.set('showTheMainTable',true);
    DataforMainTable = Pc.find().fetch();
    DataforMainTableDep.changed();
    var field1 = [];
    $.each(DataforMainTable,function(i,item){
      var flag = 1;
      for(var j = 0; j <= field1.length;j++){
        if(field1[j] == item.PDLocation){
          flag = 0;
        }
      }
      if(flag == 1){
        field1.push(item.PDLocation);
      }
    });
    setDataforSelect(field1);
    setDataforStateTable(DataforMainTable);
  },

  'mouseover #polygonBC': function(e){
    var counter = 0;
    counter = Ac.find().count();
    $("#p1").html(counter);
    /*d3.csv("data/AC.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })*/
    return tooltipBC.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonBC': function(e){
    return tooltipBC.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonBC': function(e){
    $("#p1").html("");
    return tooltipBC.style("visibility","hidden");
  },

  'click #polygonBC': function(e){
    rmDataforSelect();
    Session.set('resetFLag','Agency + Co-mentioned');
    Session.set('showTheMainTable',true);
    DataforMainTable = Ac.find().fetch();
    DataforMainTableDep.changed();
    var field1 = [];
    $.each(DataforMainTable,function(i,item){
      var flag = 1;
      for(var j = 0; j <= field1.length;j++){
        if(field1[j] == item.PDLocation){
          flag = 0;
        }
      }
      if(flag == 1){
        field1.push(item.PDLocation);
      }
    });
    setDataforSelect(field1);
    setDataforStateTable(DataforMainTable);
  },

  'mouseover #polygonCA': function(e){
    var counter = 0;
    counter = Ap.find().count();
    $("#p1").html(counter);
    /*d3.csv("data/AP.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })*/
    return tooltipCA.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonCA': function(e){
    return tooltipCA.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonCA': function(e){
    $("#p1").html("");
    return tooltipCA.style("visibility","hidden");
  },

  'click #polygonCA': function(e){
    rmDataforSelect();
    Session.set('resetFLag','Agency + Public');
    Session.set('showTheMainTable',true);
    DataforMainTable = Pc.find().fetch();
    DataforMainTableDep.changed();
    var field1 = [];
    $.each(DataforMainTable,function(i,item){
      var flag = 1;
      for(var j = 0; j <= field1.length;j++){
        if(field1[j] == item.PDLocation){
          flag = 0;
        }
      }
      if(flag == 1){
        field1.push(item.PDLocation);
      }
    });
    setDataforSelect(field1);
    setDataforStateTable(DataforMainTable);
  },

  'mouseover #polygonABC': function(e){
    var counter = 0;
    counter = Apc.find().count();
    $("#p1").html(counter);
    /*d3.csv("data/APC.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })*/
    return tooltipABC.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonABC': function(e){
    return tooltipABC.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonABC': function(e){
    $("#p1").html("");
    return tooltipABC.style("visibility","hidden");
  },

  'click #polygonABC': function(e){
    rmDataforSelect();
    Session.set('resetFLag','Agency + Public + Co-mentioned');
    Session.set('showTheMainTable',true);
    DataforMainTable = Apc.find().fetch();
    DataforMainTableDep.changed();
    var field1 = [];
    $.each(DataforMainTable,function(i,item){
      var flag = 1;
      for(var j = 0; j <= field1.length;j++){
        if(field1[j] == item.PDLocation){
          flag = 0;
        }
      }
      if(flag == 1){
        field1.push(item.PDLocation);
      }
    });
    setDataforSelect(field1);
    setDataforStateTable(DataforMainTable);
  },


});

Template.SocialMediaForm.events({
  'change #MediaSelect': function(e){
    modDataforMainTable($(e.target).val());
  },
  'click #ResetButton': function(e){
    rmDataforSelect();
    switch(Session.get('resetFLag')){
      case 'Public Only':
        DataforMainTable = Ponly.find().fetch();
        DataforMainTableDep.changed();
        break;
      case 'Co-mentioned Only':
        DataforMainTable = Conly.find().fetch();
        DataforMainTableDep.changed();
        break;
      case 'Agency Only':
        DataforMainTable = Aonly.find().fetch();
        DataforMainTableDep.changed();
        break;
      case 'Public + Co-mentioned':
        DataforMainTable = Pc.find().fetch();
        DataforMainTableDep.changed();
        break;
      case 'Agency + Co-mentioned':
        DataforMainTable = Ac.find().fetch();
        DataforMainTableDep.changed();
        break;
      case 'Agency + Public':
        DataforMainTable = Pc.find().fetch();
        DataforMainTableDep.changed();
        break;
      case 'Agency + Public + Co-mentioned':
        DataforMainTable = Apc.find().fetch();
        DataforMainTableDep.changed();
        break;
      default:
        break;
    }
  }
});

Template.SocialMediaForm.helpers({
  getPDLoptions:function(){
    return getDataforSelect();
  },
  getStateData:function(){
    return getDataforStateTable();
  }
});

Template.SocialMediaMainTable.helpers({
});

Template.MediaDataRows.events({
  'click':function(e){
    console.log(this.UserID);
    window.open("https://twitter.com/intent/user?user_id=" + this.UserID);
  }
});
