Markers = new Mongo.Collection('markers');
//QueueMap = new Mongo.Collection('queuemap');
SafetyEvents = new Mongo.Collection('safetyevents');

if (Meteor.isClient) {

 //   Meteor.subscribe('queuemap', function() {});
    Meteor.subscribe('markers', {
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

            if (getDistanceFromLatLonInKm(obj.Lat,obj.Lon,doc.latlng.lat,doc.latlng.lng) < doc.radius/1000) //check if the point is within each of the markers
                    triggeredEvents.push(obj);

          })
      
        })
        dataLoading = false; //to prevent tracker.autorun being called when data is loading to client collection
        
        }

    });
    Meteor.startup(function() {
        dataLoading = true;
       
	   

        sAlert.config({
            effect: '',
            position: 'top-right',
            timeout: 5000,
            html: false,
            onRouteClose: true,
            stack: true,
            offset: 0, // in px - will be added to first alert (bottom or top - depends of the position in config)
            beep: false,
            onClose: _.noop
        });
        Tracker.autorun(function() {
            SafetyEvents.find().observeChanges({
                added: function(id, doc) {
                    if (!dataLoading) {
                        var alertTriggered = false;
                        console.log(doc.Lat);
                        Markers.find().forEach(function(obj) {
                            if ((doc.Lat - obj.latlng.lat) ^ 2 + (doc.Lon - obj.latlng.lng) ^ 2 < obj.latlng.radius ^ 2) //check if the point is within each of the markers
                                alertTriggered = true;
                        })
                        if (alertTriggered)
                            sAlert.info('Crime Event Occured At 120 E Colvin');
                    }
                }
            });

        });


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
            marker=[];
            for(i=0;i<marker.length;i++)
                map.removeLayer(marker[i]);
            
            results.forEach(function(obj) { //update the query based on filtering params
                data_array[i] = [obj.Lat, obj.Lon, .7];
                marker[i] =  L.marker([obj.Lat, obj.Lon], {icon: greenIcon}).addTo(map).bindPopup("<b>Type:</b> "+obj.Nature_Classification+"<br>"+"<b>Location:</b>"+obj.General_Location);
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
                iconSize:     [38, 95],
                shadowSize:   [50, 64],
                iconAnchor:   [22, 94],
                shadowAnchor: [4, 62],
                popupAnchor:  [-3, -76]
            }
        });
        greenIcon = new LeafIcon({iconUrl: 'green.png'}),
        map = L.map('map', {
            doubleClickZoom: false
        }).setView([43.0391534, -76.1351158], 14);

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
                edit: true,
                remove: true
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
}

if (Meteor.isServer) {
  /* Meteor.startup(function() {
        // code to run on server at startup
        Queue.setInterval('deleteAllMarkers', 'Markers.remove({})', 86400000); // once a day 
        Queue.run();
    });*/


    // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  // Generates: GET, POST on /api/safetyevents and GET, PUT, DELETE on
  // /api/safetyevents/:id for the Items collection
  Api.addCollection(SafetyEvents);
    Meteor.publish('markers', function() {
        return Markers.find({});
    });
 /*   Meteor.publish('queuemap', function() {
        return QueueMap.find({});
    });*/
    Meteor.publish('safetyevents', function() {
        return SafetyEvents.find({});
    });
}
