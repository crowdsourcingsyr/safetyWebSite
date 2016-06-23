Markers = new Mongo.Collection('markers');
SafetyEvents = new Mongo.Collection('safetyevents');
Comments = new Mongo.Collection("eventcomments");


if (Meteor.isClient) {

 //   Meteor.subscribe('queuemap', function() {});
    Meteor.subscribe('markers', {
        onReady: function(){
      
    }
});
    Meteor.subscribe('eventcomments', {
        onReady: function(){
      
    }
});
    Meteor.subscribe('safetyevents', {
        onReady: function() {
            var data_array = [0, 0, 0];
            heat = L.heatLayer(data_array, {
                radius: 20,
                blur: 15,
                max: 1,
                gradient: {
                    0: 'orange',
                    1: 'red'
                }
            });
            map.addLayer(heat);


            triggeredEvents= []
            SafetyEvents.find().forEach(function(obj) {//assuming that safetyevents takes longer to load than markers. When the number of users becomes larger than number of events, this will have to be changed. Currently meteor has no way to trigger event when all data subsciptions are loaded
            var results = Markers.find();
            results.forEach(function(doc) { 
                console.log(doc.layerType);
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
      
        })
        dataLoading = false; //to prevent tracker.autorun being called when data is loading to client collection
        
        }

    });


    Template.form.events({ //filter map data on form submit
        'submit form': function(event) {
            event.preventDefault();
            var startDate = event.target.start_date.value;
            var endDate = event.target.end_date.value;
            var severity = parseInt(event.target.severity.value);
            var i = 0;
            var data_array = [0, 0, 0];

            if (severity == 10)
                var results = SafetyEvents.find({
                    "Date_Time_Reported": {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                });
            else
                var results = SafetyEvents.find({
                    "Date_Time_Reported": {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    },
                    "Severity": severity
                });
            if (typeof eventMarker == 'undefined') {
                eventMarker=[];
            }
            for(i=0;i<eventMarker.length;i++)
                map.removeLayer(eventMarker[i]);
            
            results.forEach(function(obj) { //update the query based on filtering params
                data_array[i] = [obj.Lat, obj.Lon, .7];
                //eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: greenIcon}).addTo(map).bindPopup("<b>Type:</b> "+obj.Nature_Classification+"<br>"+"<b>Location:</b>"+obj.General_Location);
               eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: greenIcon}).addTo(map);
               containerNode = document.createElement('div'); // wrapping node for bindPopup;
                  // Which template to use for the popup? Some data for it, and attach it to the containerNode
                 var commentsJSON = {
                    comment: []
                };

                 Comments.find({}, {sort: {count:-1}, limit:5}).forEach(function(obj){
                         commentsJSON.comment.push({ 
                           "content"       : obj.message 
                    });
                 })
               /*  dataContext = {comment: [
                { content: 'David' },
                { content: 'Shaune' }
              ]};*/
              
                  Blaze.renderWithData(Template.eventComments, commentsJSON, containerNode);
                  // Finally bind the containerNode to the popup
                  eventMarker[i].bindPopup(containerNode).openPopup();


                i++;
            })
          /*  map.removeLayer(heat);


            heat = L.heatLayer(data_array, {
                radius: 20,
                blur: 15,
                max: 1,
                gradient: {
                    0: 'orange',
                    1: 'red'
                }
            });
            map.addLayer(heat);*/
        },
        "change #university": function(evt) {
          var newValue = $(evt.target).val();
          console.log(newValue);
          var oldValue = Session.get("university");
          if (newValue != oldValue) {
            // value changed, let's do something
           Session.setPersistent('university', newValue);
           location.reload();
          }
          
        },
        'click .reset': function (e) {
            //  e.preventDefault();
            
             Markers.find({}).forEach(function(doc){
                Markers.remove({_id:doc._id });
            });
            location.reload();
    }
    });
    Template.map.rendered = function() {
        $('.datetimepicker').each(function() {
            $(this).datetimepicker();
        });
        L.Icon.Default.imagePath = '/public';
        var LeafIcon = L.Icon.extend({
            options: {
             //   shadowUrl: 'marker_shadow.png',
                iconSize:     [38, 50],
                shadowSize:   [50, 64],
                iconAnchor:   [22, 94],
                shadowAnchor: [4, 62],
                popupAnchor:  [-3, -76]
            }
        });
        greenIcon = new LeafIcon({iconUrl: 'green.png'});
        console.log(Session.get('university'));
        if(Session.get('university')==1)
        {
             map = L.map('map', {
                    doubleClickZoom: false
                }).setView([34.068921, -118.4451811], 14);

        }
        else
        {
                map = L.map('map', {
                    doubleClickZoom: false
                }).setView([43.0391534, -76.1351158], 14);
        }

        var tiles = L.tileLayer.provider('MapQuestOpen.OSM').addTo(map);

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
            console.log(event.layer);
            console.log(event.layerType);
            console.log(drawnItems);
            var feature = {
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
            console.log(feature);
            Markers.insert(feature);
        });

        map.on('draw:deleted', function(event) {
            console.log(event);
            console.log(event.layers._layers);
            for (var l in event.layers._layers) {
                console.log(l);
                Markers.remove({
                    _id: l
                });
            }
        });

        var query = Markers.find();
        query.observe({
            added: function(document) {
                console.log(document);
                switch (document.layerType) {
                    case 'marker':
                        var marker = L.marker(document.latlng);
                        marker._leaflet_id = document._id;
                        marker.addTo(drawnItems);
                        break;
                    case 'circle':
                        var circle = L.circle(document.latlng, document.radius);
                        circle._leaflet_id = document._id;
                        circle.addTo(drawnItems);
                        break;
                    case 'polygon':
                        var polygon = L.polygon(document.latlngs);
                        polygon._leaflet_id = document._id;
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
    Template.eventtable.onCreated(function(){
         this.subscribe("safetyevents");
          this.subscribe("markers");
    });
    Template.eventtable.helpers({
        'getData': function() { 
           return triggeredEvents;
        }
    });
     Template.form.helpers({
        syracuseSelected: function () {
          return (Session.get('university') == 0) ? 'selected' : '';
        },
        uclaSelected: function () {
          return (Session.get('university') == 1) ? 'selected' : '';
        }
    });

    Template.eventRow.events({
      'click': function(e) {
        if (typeof eventMarker == 'undefined') {
                eventMarker=[];
            }
        for(i=0;i<eventMarker.length;i++)
                map.removeLayer(eventMarker[i]);
                eventMarker[0] =  L.marker([this.Lat, this.Lon], {icon: greenIcon}).addTo(map).bindPopup("<b>Type:</b> "+this.Nature_Classification+"<br>"+"<b>Location:</b>"+this.General_Location+"<br>{{>eventComments}}");
        //$('.eventRow').removeClass('highlight');
        //$(e.currentTarget).addClass('highlight');
      }
    });
    Handlebars.registerHelper('getRowClass', function(Severity) {
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
    }});

   
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
};