if (Meteor.isClient) {
    //The universities information for select
    PlaceInfo = [
      {"_id": 0, "placeIndex": 0,"placeCategory": 'Syracuse University'},
      {"_id": 1, "placeIndex": 1,"placeCategory": 'Emory University'},
      {"_id": 2, "placeIndex": 2,"placeCategory": 'Rice University'},
      {"_id": 3, "placeIndex": 3,"placeCategory": 'Georgia Institute of Technology'},
      {"_id": 4, "placeIndex": 4,"placeCategory": 'University at Buffalo'},
      {"_id": 5, "placeIndex": 5,"placeCategory": 'Hunter College'}
    ];
    $.each(PlaceInfo,function(i,item){
      switch(i){
        case 0:
          item["placeCategory"] = (Session.get("isCity") == 1)?'Syracuse':'Syracuse University';
          break;
        case 1:
          item["placeCategory"] = (Session.get("isCity") == 1)?'Atlana':'Emory University';
          break;
        case 2:
          item["placeCategory"] = (Session.get("isCity") == 1)?'Houston':'Rice University';
          break;
        case 3:
          item["placeCategory"] = (Session.get("isCity") == 1)?'Atlana':'Georgia Institute of Technology';
          break;
        case 4:
          item["placeCategory"] = (Session.get("isCity") == 1)?'Buffalo':'University at Buffalo';
          break;
        case 5:
          item["placeCategory"] = (Session.get("isCity") == 1)?'New York':'Hunter College';
          break;
      }
    });
    PlaceInfoDep = new Tracker.Dependency;
    getPlaceInfo = function () {
      PlaceInfoDep.depend();
      return PlaceInfo;
    };
    setPlaceInfo = function (flag) {
        //console.log(flag);
        $.each(PlaceInfo,function(i,item){
          switch(i){
            case 0:
              item["placeCategory"] = (flag == 1)?'Syracuse':'Syracuse University';
              break;
            case 1:
              item["placeCategory"] = (flag == 1)?'Atlana':'Emory University';
              break;
            case 2:
              item["placeCategory"] = (flag == 1)?'Houston':'Rice University';
              break;
            case 3:
              item["placeCategory"] = (flag == 1)?'Atlana':'Georgia Institute of Technology';
              break;
            case 4:
              item["placeCategory"] = (flag == 1)?'Buffalo':'University at Buffalo';
              break;
            case 5:
              item["placeCategory"] = (flag == 1)?'New York':'Hunter College';
              break;
          }
        });
        PlaceInfoDep.changed();
    };
    Meteor.subscribe('markers', {
        onReady: function(){
        }
    });
    Meteor.subscribe('eventcomments', {
        onReady: function(){
        }
    });
     Meteor.subscribe('eventtocomment', {
        onReady: function(){
        }
    });
    Meteor.subscribe('safetytips',{
        onReady:function(){
          triggeredTips = []
          triggeredTipsDep = new Tracker.Dependency();
        }
    });
    Meteor.subscribe('safetyevents', {
        onReady: function() {
            //console.log("demo.js");
            //console.log(map._layers);
            var data_array = [0, 0, 0];
            Session.set('fromDate', "'"+moment().subtract(6, "months").format("L")+"'");
            Session.set('toDate', "'"+moment().format("L")+"'");
            triggeredEvents= []
            triggeredEventsDep = new Tracker.Dependency();
            /*SafetyEvents.find({
                    "Date_Time_Reported": {
                        $gte: new Date(Session.get('fromDate')),
                        $lte: new Date(Session.get('toDate'))
                    }
                }).forEach(function(obj) {//assuming that safetyevents takes longer to load than markers. When the number of users becomes larger than number of events, this will have to be changed. Currently meteor has no way to trigger event when all data subsciptions are loaded
            var results = Markers.find({"userid": Meteor.userId()});
            results.forEach(function(doc) {
            if (doc.layerType =='circle'){
                if (getDistanceFromLatLonInKm(obj.Lat,obj.Lon,doc.latlng.lat,doc.latlng.lng) < doc.radius/1000) //check if the point is within each of the markers
                    triggeredEvents.push(obj);
            }
            else
            {
                if(isInPolygon(obj.Lat,obj.Lon,doc.latlngs))
                     triggeredEvents.push(obj);
            }
          })
        })*/
        dataLoading = false; //to prevent tracker.autorun being called when data is loading to client collection
        }
    });

  /*  Handlebars.registerHelper('getRowClass', function(Severity) {
    switch (Severity) {
        case 0 : {
            return 'active';
        }
        break;
        case 1 : {
            return 'warning';
        }
        break;
        default : {
            return 'danger';
        }
    }});*/


   $(function() {
        $(document).ready(function() {
            $('#map').css({
                height: $(window).height() * .65 + 'px'
            });
        });
        $(window).resize(function() {
            $('#map').css({
                height: $(window).height() * .65 + 'px'
            });

        });
    });

}

Template.eventtable.onCreated(function(){
  this.subscribe("safetyevents");
  this.subscribe("markers");
});

Template.eventtable.helpers({
    getData: function() {
       triggeredEventsDep.depend();
       return triggeredEvents;
    },
    getRowClass: function(item){
      return function (item) {
          var Severity = item.Severity;
          switch (Severity) {
              case 0 : {
                  return 'active';
              }
              break;
              case 1 : {
                  return 'warning';
              }
              break;
              default : {
                  return 'danger';
              }
            }
      };
  },
    settings: function(){
      return {
        showFilter:false,
        fields:[
          {key:'Case_Number',label:'Index'},
          {key:'Date_Time_Reported',label:'Date'},
          {key:'General_Location', label:'Location'},
          {key:'Nature_Classification', label:'description'}]
      };
    }
});

Template.eventtable.events({
  'click .reactive-table tbody tr':function(e){
    if (typeof eventMarker == 'undefined') {
            eventMarker=[];
        }
    for(i=0;i<eventMarker.length;i++)
            map.removeLayer(eventMarker[i]);
    eventMarker[0] =  L.marker([this.Lat, this.Lon], {icon: highIcon})
                      .addTo(map)
                      .bindPopup("<b>Type:</b> "+this.Nature_Classification+"<br>"+"<b>Location:</b>"+this.General_Location+"<br>")
                      .openPopup();

    var keyword = this.Nature_Classification.split(" ");
    if(keyword[0].indexOf(',') > 0){
        keyword = this.Nature_Classification.split(",");
    }
    var tableRows = $("#tipsTable").find("td").filter(function(){
      return $(this).text().trim().indexOf(keyword[0].trim())== -1;
    }).closest("tr");
    tableRows.css({"font-weight": "normal"});
    var tableRow = $("#tipsTable").find("td").filter(function(){
      return $(this).text().trim().indexOf(keyword[0].trim())!= -1;
    }).closest("tr");
    var baseRow = $("#tipsTable").find("th").filter(function(){
      return $(this).text().trim() == "Category";
    }).closest("tr");
    console.log(tableRow);
    tableRow.css({"font-weight": "bold"});
    var rowpos = tableRow.position().top-baseRow.position().top;

    console.log(rowpos);
    $("#tipsTable").animate({scrollTop:rowpos},1000);

  }

});
/*
Template.eventRow.events({
  'click': function(e) {
    if (typeof eventMarker == 'undefined') {
            eventMarker=[];
        }
    for(i=0;i<eventMarker.length;i++)
            map.removeLayer(eventMarker[i]);
    eventMarker[0] =  L.marker([this.Lat, this.Lon], {icon: highIcon})
                      .addTo(map)
                      .bindPopup("<b>Type:</b> "+this.Nature_Classification+"<br>"+"<b>Location:</b>"+this.General_Location+"<br>")
                      .openPopup();

    var keyword = this.Nature_Classification.split(" ");
    if(keyword[0].indexOf(',') > 0){
        keyword = this.Nature_Classification.split(",");
    }
    var tableRows = $("#tipsTable").find("td").filter(function(){
      return $(this).text().trim().indexOf(keyword[0].trim())== -1;
    }).closest("tr");
    tableRows.css({"font-weight": "normal"});
    var tableRow = $("#tipsTable").find("td").filter(function(){
      return $(this).text().trim().indexOf(keyword[0].trim())!= -1;
    }).closest("tr");
    var baseRow = $("#tipsTable").find("th").filter(function(){
      return $(this).text().trim() == "Category";
    }).closest("tr");
    console.log(tableRow);
    tableRow.css({"font-weight": "bold"});
    var rowpos = tableRow.position().top-baseRow.position().top;

    console.log(rowpos);
    $("#tipsTable").animate({scrollTop:rowpos},1000);
  }
});*/

Template.toggle_button.events({
  'click #toggle_switch input': function(e){
    var newValue = $(e.target).val();
    var oldValue = Session.get("isCity");
    if(newValue != oldValue){
      Session.setPersistent('isCity', newValue);
      setPlaceInfo(newValue);
    }
  }
});

Template.toggle_button.helpers({
  CityChecked: function() {
    console.log(Session.get('isCity'));
    return (Session.get('isCity') == 1) ? 'checked' : '';
  },
  CampusChecked: function() {
    return (Session.get('isCity') == 0) ? 'checked' : '';
  },
});

Template.form.onCreated(function(){
  this.subscribe("safetyevents");
  this.subscribe("markers");
});


Template.form.events({ //filter map data on form submit
    "change #university": function(evt) {
      var newValue = $(evt.target).val();
      //console.log(newValue);
      var oldValue = Session.get("university");
      if (newValue != oldValue) {
        // value changed
       Session.setPersistent('university', newValue);
       location.reload();
      }
    },
     /*"change #isCity": function(evt) {
      var newValue = $(evt.target).val();
      var oldValue = Session.get("isCity");
      if (newValue != oldValue) {
        // value changed
       Session.setPersistent('isCity', newValue);
       //location.reload();
       //console.log(newValue);
       setPlaceInfo(newValue);
      }
    },*/
    "change #severity": function(evt) {
         var newValue = $(evt.target).val();
         var oldValue = Session.get("severity");
         if (newValue != oldValue) {
             // value changed, let's do something
             Session.setPersistent('severity', newValue);
             location.reload();
         }
     },
     "change #crimeCategory": function(evt) {
       var newValue = $(evt.target).val();
       var oldValue = Session.get("crimeCategory");
       if(newValue != oldValue) {
         Session.setPersistent('crimeCategory',newValue);
         location.reload();
       }
     },
    'click .reset': function (e) {
            Markers.find({"userid": Meteor.userId()}).forEach(function(doc){
            Markers.remove({_id:doc._id });
        });
        location.reload();
}

});

 Template.form.rendered=function(){
    markerClusters = L.markerClusterGroup();
    $("#daterange").ionRangeSlider({
    type: "double",
    min: +moment().subtract(3, "years").format("X"),
    max: +moment().format("X"),
    from: +moment().subtract(6, "months").format("X"),
    to:+moment().format("X"),
    onFinish: function (data) {//fired when the date range slider is moved to a new position
    var fromDate="'"+moment.unix(data.from).format("MM/DD/YYYY")+"'";
     var toDate="'"+moment.unix(data.to).format("MM/DD/YYYY")+"'";
     Session.set('fromDate', fromDate);
     Session.set('toDate', toDate);
     //console.log(Session.get("isCity"));
     var severity=Session.get('severity');
     var crimeCategory=Session.get('crimeCategory');
     if(crimeCategory != "Any"){
            if (severity== 10){
              var results = SafetyEvents.find({
                  "Date_Time_Reported": {
                      $gte: new Date(fromDate),
                      $lte: new Date(toDate)
                    },
                    "Is_City":+(Session.get('isCity')),
                    "Nature_Classification": {
                      $regex: crimeCategory
                    }
                  });
                }
              else{
                  var results = SafetyEvents.find({
                    "Date_Time_Reported": {
                      $gte: new Date(fromDate),
                      $lte: new Date(toDate)
                    },
                    "Is_City":+(Session.get('isCity')),
                    "Severity": +severity,
                    "Nature_Classification": {
                      $regex: crimeCategory
                    }
                  });
                }
      }else{
        if (severity== 10){
          var results = SafetyEvents.find({
              "Date_Time_Reported": {
                  $gte: new Date(fromDate),
                  $lte: new Date(toDate)
                },
                "Is_City":+(Session.get('isCity'))
              });
            }
          else{
              var results = SafetyEvents.find({
                "Date_Time_Reported": {
                  $gte: new Date(fromDate),
                  $lte: new Date(toDate)
                },
                "Is_City":+(Session.get('isCity')),
                "Severity": +severity
              });
            }
      }
        if (typeof eventMarker == 'undefined') {
            eventMarker=[];
            triggeredEvents=[];
        }


        /*for(i=0;i<eventMarker.length;i++){
            map.removeLayer(eventMarker[i]);
        }*/
        if(map.hasLayer(markerClusters)){
          map.removeLayer(markerClusters);
        }
        triggeredEvents=[];
        triggeredTips=[];
        var tipsset = [];
        i=0;
        results.forEach(function(obj) { //add markers to map for each result
            //break if events not within marker area
            var withinSubscription=0;
            var eventmarkers = Markers.find({"userid": Meteor.userId()});
            //console.log(obj.Nature_Classification);
            eventmarkers.forEach(function(doc) {
            if (doc.layerType =='circle'){
                if (getDistanceFromLatLonInKm(obj.Lat,obj.Lon,doc.latlng.lat,doc.latlng.lng) < doc.radius/1000) //check if the point is within each of the markers
                   withinSubscription=1;
            }
            else
            {
                if(isInPolygon(obj.Lat,obj.Lon,doc.latlngs))
                    withinSubscription =1;
            }
            })
            if(withinSubscription==1)
            {
                triggeredEvents.push(obj);
                var tipsCategory = obj.Nature_Classification.split(" ");
                if(tipsCategory[0].indexOf(',') > 0){
                  tipsCategory = obj.Nature_Classification.split(",");
                }
                var tips = SafetyTips.find({
                  "DescriptionCategory": {
                    $regex: tipsCategory[0]
                  }
                });
                tips.forEach(function(tipItem){
                  if($.inArray(tipItem.DescriptionCategory,tipsset) == -1){
                    triggeredTips.push(tipItem);
                    tipsset.push(tipItem.DescriptionCategory);
                  }
                  /*console.log($.inArray(tipItem,triggeredTips));
                  if($.inArray(tipItem,triggeredTips) == -1){
                    triggeredTips.push(tipItem);
                  }
                  console.log(triggeredTips);*/
                })
                if(obj.Severity==2)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: highIcon,riseOnHover:true,opacity:0.8});
                else if(obj.Severity==1)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: mediumIcon,riseOnHover:true,opacity:0.8});
                else if(obj.Severity==0)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: lowIcon,riseOnHover:true,opacity:0.8});

                eventMarker[i].eventId = obj.ReportID;//pass the event id
                markerClusters.addLayer(eventMarker[i]);
                map.addLayer(markerClusters);
                //map.addLayer(eventMarker[i]);

                markerClusters.on('clustermouseover', function (a) {
                                // a.layer is actually a cluster
                               // console.log('cluster ' + a.layer.getAllChildMarkers());
                              //  markers = a.layer.getAllChildMarkers();
                              //  console.log(markers.length);
                                  var popup = L.popup()
                                      .setLatLng(a.layer.getLatLng())
                                      .setContent(a.layer._childCount +' Locations(click to Zoom)')
                                      .openOn(map);


                            });





                    i++;
                }
        })
        triggeredEventsDep.changed();
        triggeredTipsDep.changed();
    },
    prettify: function (num) {
          return moment(num, "X").format("MMM Do YYYY");
    }

});

};

Template.form.helpers({
   citySelected: function () {
     return (Session.get('isCity') == 1) ? 'selected' : '';
   },
   campusSelected: function () {
     return (Session.get('isCity') == 0) ? 'selected' : '';
   },
   anySelected: function () {
     return (Session.get('severity') == 10) ? 'selected' : '';
   },
   lowSelected: function () {
     return (Session.get('severity') == 0) ? 'selected' : '';
   },
   mediumSelected: function () {
     return (Session.get('severity') == 1) ? 'selected' : '';
   },
   highSelected: function () {
     return (Session.get('severity') == 2) ? 'selected' : '';
   },
   getTips: function () {
     //return SafetyTips.find();
     triggeredTipsDep.depend();
     return triggeredTips;
   },
   getoptions: function () {
     var options = [];
     var tips = SafetyTips.find().fetch();
     var anyoption = new Array();
     anyoption["crimeCategory"] = "Any";
     options.push(anyoption);
     for(var i in tips){
       var option = new Array();
       option["crimeCategory"] = tips[i].DescriptionCategory;
       options.push(option);
     }
     return options;
   },
   animateselected:function (){
     return (Session.get('crimeCategory') == this.crimeCategory)? 'selected' : '';
   },
   getPlaces: function () {
     return getPlaceInfo();
   },
   placeSelected: function () {
     return (Session.get('university') == this.placeIndex)? 'selected' : '';
   },


});

Template.map.rendered = function() {
    $('.datetimepicker').each(function() {
        $(this).datetimepicker();
    });
     //Session.set('severity',10);
    L.Icon.Default.imagePath = '/public';
    var LeafIcon = L.Icon.extend({
        options: {
         //   shadowUrl: 'marker_shadow.png',
            iconSize:     [15, 15],
            shadowSize:   [50, 64],
            iconAnchor:   [10, 10],
            shadowAnchor: [4, 62],
            popupAnchor:  [0, 0]
        }
    });
    highIcon = new LeafIcon({iconUrl: 'high.png'});
     mediumIcon = new LeafIcon({iconUrl: 'medium.png'});
    lowIcon = new LeafIcon({iconUrl: 'low.png'});
     if(Session.get('university')==0)
    {
            map = L.map('map', {
                doubleClickZoom: false
            }).setView([43.0391534, -76.1351158], 14);
    }
    else if(Session.get('university')==1)
    {
         map = L.map('map', {
                doubleClickZoom: false
            }).setView([33.7925195,-84.3239989], 14);

    }
    else if(Session.get('university')==2)
    {
         map = L.map('map', {
                doubleClickZoom: false
            }).setView([29.7173941,-95.4018312], 14);

    }
     else if(Session.get('university')==3)
    {
            map = L.map('map', {
                doubleClickZoom: false
            }).setView([33.7756178,-84.396285], 14);
    }
     else if(Session.get('university')==4)
    {
            map = L.map('map', {
                doubleClickZoom: false
            }).setView([43.0008093,-78.7889697], 14);
    }
      else if(Session.get('university')==5)
    {
            map = L.map('map', {
                doubleClickZoom: false
            }).setView([40.7686793,-73.9647192], 14);
    }

    var tiles = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

    var drawnItems = L.featureGroup().addTo(map);

    map.addControl(new L.Control.Draw({
        draw: {
            polyline: false,
            polygon: true,
            rectangle: false,
            marker:false
        },
        edit: {
            featureGroup: drawnItems,
            edit: false,
            remove: false
        }
    }));

    map.on('draw:created', function(event) {
        var layer = event.layer;
        //console.log(event.layer);
        //console.log(event.layerType);
        var feature = {
            userid: Meteor.userId(),
            options: event.layer.options,
            layerType: event.layerType
        };
        switch (event.layerType) {
            case 'marker':
                feature.latlng = event.layer._latlng;
                break;
            case 'circle':
                feature.latlng = event.layer._latlng;
                feature.radius = event.layer._mRadius;
                break;
            case 'polygon':
                feature.latlngs = event.layer._latlngs;
                break;
        }
        //console.log(feature);
        //map.addLayer(layer);
        //console.log(Meteor.userId());
        //console.log(hello());
        containerNode = document.createElement('div');
      //  Blaze.render(Template.circlesavemenu, containerNode); //pass the data into the eventComments template
      //  layer.bindPopup(containerNode).openPopup();
        Session.set("circle_latlng",layer._latlng);
        Session.set("circle_radius",layer._radius);
        if(Meteor.userId()){
          Markers.insert(feature);
        }else{
          LocalMarkers.insert(feature);
        }
    });

    map.on('draw:deleted', function(event) {
        //console.log(event);
        //console.log(event.layers._layers);
        for (var l in event.layers._layers) {
            //console.log(l);
            Markers.remove({
                _id: l
            });
        }
    });

    var query = Markers.find({"userid": Meteor.userId()});
    query.observe({
        added: function(doc) {
            //console.log(doc);
            switch (doc.layerType) {
                case 'marker':
                    var marker = L.marker(doc.latlng);
                    marker._leaflet_id = doc._id;
                    marker.addTo(drawnItems);
                    break;
                case 'circle':
                    var circle = L.circle(doc.latlng, doc.radius);
                    circle._leaflet_id = doc._id;
                    circle.addTo(drawnItems);
                    break;
                case 'polygon':
                    var polygon = L.polygon(doc.latlngs);
                    polygon._leaflet_id = doc._id;
                    polygon.addTo(drawnItems);
                    break;
            }
        },
        removed: function(oldDocument) {
            layers = map._layers;
            var key, val;
            for (key in layers) {
                val = layers[key];
                if (val._latlng) {
                    if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
                        map.removeLayer(val);
                    }
                }
            }
        }
    });

    var query_local = LocalMarkers.find({"userid": null});
    query_local.observe({
      added: function(doc) {
          //console.log(doc);
          switch (doc.layerType) {
              case 'marker':
                  var marker = L.marker(doc.latlng);
                  marker._leaflet_id = doc._id;
                  marker.addTo(drawnItems);
                  break;
              case 'circle':
                  var circle = L.circle(doc.latlng, doc.radius);
                  circle._leaflet_id = doc._id;
                  circle.addTo(drawnItems);
                  break;
              case 'polygon':
                  var polygon = L.polygon(doc.latlngs);
                  polygon._leaflet_id = doc._id;
                  polygon.addTo(drawnItems);
                  break;
          }
      },
      removed: function(oldDocument) {
          layers = map._layers;
          var key, val;
          for (key in layers) {
              val = layers[key];
              if (val._latlng) {
                  if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
                      map.removeLayer(val);
                  }
              }
          }
      }

    });
};

Tracker.autorun(function(){
  var test = Session.get("circle_latlng");
  var radius = Session.get("circle_radius");
  //console.log(test);
});



function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = (lat2-lat1)*(Math.PI/180)  // deg2rad
      var dLon = (lon2-lon1)*(Math.PI/180)
      var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*(Math.PI/180)) * Math.cos(lat2*Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in km
      return d;
    }


function isInPolygon(lat,lon, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html


    var x = lat, y = lon;

    var inside = false;
    for (var i = 1, j = vs.length -1; i < vs.length; j = i++) {

        var xi = vs[i].lat, yi = vs[i].lng;
        var xj = vs[j].lat, yj = vs[j].lng;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}
