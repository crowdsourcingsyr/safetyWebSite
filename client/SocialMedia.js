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

Template.SocialMedia.events({
  'mouseover #polygonA': function(e){
    var counter = 0;
    d3.csv("data/Ponly.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })
    return tooltipA.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonA': function(e){
    return tooltipA.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonA': function(e){
    $("#p1").html("");
    return tooltipA.style("visibility","hidden");
  },

  'mouseover #polygonB': function(e){
    var counter = 0;
    d3.csv("data/Conly.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })
    return tooltipB.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonB': function(e){
    return tooltipB.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonB': function(e){
    $("#p1").html("");
    return tooltipB.style("visibility","hidden");
  },

  'mouseover #polygonC': function(e){
    var counter = 0;
    d3.csv("data/Aonly.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })
    return tooltipC.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonC': function(e){
    return tooltipC.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonC': function(e){
    $("#p1").html("");
    return tooltipC.style("visibility","hidden");
  },

  'mouseover #polygonAB': function(e){
    var counter = 0;
    d3.csv("data/PC.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })
    return tooltipAB.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonAB': function(e){
    return tooltipAB.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonAB': function(e){
    $("#p1").html("");
    return tooltipAB.style("visibility","hidden");
  },

  'mouseover #polygonBC': function(e){
    var counter = 0;
    d3.csv("data/AC.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })
    return tooltipBC.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonBC': function(e){
    return tooltipBC.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonBC': function(e){
    $("#p1").html("");
    return tooltipBC.style("visibility","hidden");
  },

  'mouseover #polygonCA': function(e){
    var counter = 0;
    d3.csv("data/AP.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })
    return tooltipCA.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonCA': function(e){
    return tooltipCA.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonCA': function(e){
    $("#p1").html("");
    return tooltipCA.style("visibility","hidden");
  },

  'mouseover #polygonABC': function(e){
    var counter = 0;
    d3.csv("data/APC.csv", function(csv) {
        csv.map(function(d) {
            counter++;
        })
        $("#p1").html(counter);
    })
    return tooltipABC.style("visibility", "visible").style("color", "yellow");
  },

  'mousemove #polygonABC': function(e){
    return tooltipABC.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px");
  },

  'mouseout #polygonABC': function(e){
    $("#p1").html("");
    return tooltipABC.style("visibility","hidden");
  },


});
