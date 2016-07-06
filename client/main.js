Markers = new Mongo.Collection('markers');
SafetyEvents = new Mongo.Collection('safetyevents');
Comments = new Mongo.Collection("eventcomments");
EventToComment = new Mongo.Collection("eventtocomment");


if (Meteor.isClient) {
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
           Session.set('fromDate', "'"+moment().subtract(6, "months").format("L")+"'");
            Session.set('toDate', "'"+moment().format("L")+"'");
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
        "change #severity": function(evt) {
             var newValue = $(evt.target).val();
             var oldValue = Session.get("severity");
             if (newValue != oldValue) {
                 // value changed, let's do something
                 Session.set('severity', newValue);
                 var fromDate = Session.get("fromDate");
                 var toDate = Session.get("toDate");
                 var severity = Session.get('severity');
                 if (severity == 10) {
                     var results = SafetyEvents.find({
                         "Date_Time_Reported": {
                             $gte: new Date(fromDate),
                             $lte: new Date(toDate)
                         }
                     });
                 } else {
                     var results = SafetyEvents.find({
                         "Date_Time_Reported": {
                             $gte: new Date(fromDate),
                             $lte: new Date(toDate)
                         },
                         "Severity": +severity
                     });
                 }
                 if (typeof eventMarker == 'undefined') {
                     eventMarker = [];
                 }
                 for (i = 0; i < eventMarker.length; i++)
                     map.removeLayer(eventMarker[i]);
                 results.forEach(function(obj) { //add markers to map for each result
                     if (obj.Severity == 2)
                         eventMarker[i] = L.marker([obj.Lat, obj.Lon], {
                             icon: highIcon,
                             riseOnHover: true,
                             opacity: 0.8
                         }).addTo(map);
                     else if (obj.Severity == 1)
                         eventMarker[i] = L.marker([obj.Lat, obj.Lon], {
                             icon: mediumIcon,
                             riseOnHover: true,
                             opacity: 0.8
                         }).addTo(map);
                     else if (obj.Severity == 0)
                         eventMarker[i] = L.marker([obj.Lat, obj.Lon], {
                             icon: lowIcon,
                             riseOnHover: true,
                             opacity: 0.8
                         }).addTo(map);

                     eventMarker[i].eventId = obj.ReportID; //pass the event id
                     eventMarker[i].addTo(map).on('mouseover', function(e) { //marker on click 

                         comments = EventToComment.find({
                             "event_id": e.target.eventId
                         }).fetch(); //search for comments that are connected to that event 
                         commentsJSON = {
                             comment: [],
                             event_id: 0,
                             Date_Time_Occurred: 0,
                             Nature_Classification: 0
                         };
                         for (j = 0; j < comments.length; j++) {
                             Comments.find({
                                 id: comments[j].comment_id
                             }, {
                                 sort: {
                                     count: -1
                                 },
                                 limit: 5
                             }).forEach(function(obj) { //pass the comments to datacontext i.e. commentsJSON
                                 commentsJSON.comment.push({
                                     "content": obj.message
                                 });
                             })
                         }
                         containerNode = document.createElement('div');
                         commentsJSON.event_id = e.target.eventId;
                         commentsJSON.Date_Time_Occurred = obj.Date_Time_Occurred;
                         commentsJSON.Nature_Classification = obj.Nature_Classification;
                         Blaze.renderWithData(Template.eventComments, commentsJSON, containerNode); //pass the data into the eventComments template
                         popup = this.bindPopup(containerNode);
                         popup.openPopup();
                         $("#comment").submit(function(e) { //comment form submit button handler
                             e.preventDefault();
                             commentId = Math.floor(Math.random() * 1000000);
                             Comments.insert({
                                 id: commentId,
                                 message: e.target.commentText.value
                             });
                             EventToComment.insert({
                                 event_id: e.target.event_id.value,
                                 comment_id: commentId
                             });
                         });
                     });
                     i++;
                 })
             }
         },
        'click .reset': function (e) {
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
         Session.set('severity',10);
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
        console.log(Session.get('university'));
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
     Template.form.rendered=function(){
        $("#daterange").ionRangeSlider({
              type: "double",
        min: +moment().subtract(3, "years").format("X"),
        max: +moment().format("X"),
        from: +moment().subtract(6, "months").format("X"),
        to:+moment().format("X"),
        onFinish: function (data) {

        var fromDate="'"+moment.unix(data.from).format("MM/DD/YYYY")+"'";
         var toDate="'"+moment.unix(data.to).format("MM/DD/YYYY")+"'";
         Session.set('fromDate', fromDate);
         Session.set('toDate', toDate);

         var severity=Session.get('severity'); 
         if (severity== 10){
                var results = SafetyEvents.find({
                    "Date_Time_Reported": {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                });
            }
            else{
                var results = SafetyEvents.find({
                    "Date_Time_Reported": {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    },
                    "Severity": +severity
                });
           }
            if (typeof eventMarker == 'undefined') {
                eventMarker=[];
            }
            for(i=0;i<eventMarker.length;i++)
                map.removeLayer(eventMarker[i]);
            results.forEach(function(obj) { //add markers to map for each result
                if(obj.Severity==2)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: highIcon,riseOnHover:true,opacity:0.8}).addTo(map);
                else if(obj.Severity==1)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: mediumIcon,riseOnHover:true,opacity:0.8}).addTo(map);
                else if(obj.Severity==0)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: lowIcon,riseOnHover:true,opacity:0.8}).addTo(map);
           
                eventMarker[i].eventId = obj.ReportID;//pass the event id
                eventMarker[i].addTo(map).on('mouseover', function(e) {//marker on click 
                    
                    comments=  EventToComment.find({ "event_id": e.target.eventId }).fetch();//search for comments that are connected to that event 
                    commentsJSON={comment: [],event_id:0, Date_Time_Occurred: 0, Nature_Classification:0};
                     for(j=0;j<comments.length;j++){
                        Comments.find({id:comments[j].comment_id}, {sort: {count:-1}, limit:5}).forEach(function(obj){//pass the comments to datacontext i.e. commentsJSON
                                commentsJSON.comment.push({ 
                                "content"       : obj.message 
                                });
                            })
                    }
                    containerNode = document.createElement('div'); 
                    commentsJSON.event_id=e.target.eventId;
                    commentsJSON.Date_Time_Occurred=obj.Date_Time_Occurred;
                    commentsJSON.Nature_Classification= obj.Nature_Classification;
                    Blaze.renderWithData(Template.eventComments, commentsJSON, containerNode);//pass the data into the eventComments template
                    popup = this.bindPopup(containerNode);
                    popup.openPopup();
                    $("#comment").submit(function(e){//comment form submit button handler
                        e.preventDefault();
                        commentId = Math.floor(Math.random()*1000000);
                        Comments.insert({
                                id: commentId,
                                message: e.target.commentText.value
                            });
                        EventToComment.insert({                            
                            event_id:e.target.event_id.value,
                            comment_id: commentId
                            });
                            });
                        });
                    i++;
            })
        },
        prettify: function (num) {
              return moment(num, "X").format("MMM Do YYYY");
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
        emorySelected: function () {
          return (Session.get('university') == 1) ? 'selected' : '';
        },
        riceSelected: function () {
          return (Session.get('university') == 2) ? 'selected' : '';
        },
         georgiatechSelected: function () {
          return (Session.get('university') == 3) ? 'selected' : '';
        },
         ubuffaloSelected: function () {
          return (Session.get('university') == 4) ? 'selected' : '';
        }
    });

    Template.eventRow.events({
      'click': function(e) {
        if (typeof eventMarker == 'undefined') {
                eventMarker=[];
            }
        for(i=0;i<eventMarker.length;i++)
                map.removeLayer(eventMarker[i]);
                eventMarker[0] =  L.marker([this.Lat, this.Lon], {icon: highIcon}).addTo(map).bindPopup("<b>Type:</b> "+this.Nature_Classification+"<br>"+"<b>Location:</b>"+this.General_Location+"<br>{{>eventComments}}");
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