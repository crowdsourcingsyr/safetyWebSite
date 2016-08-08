
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
    Meteor.subscribe('safetytips',{
        onReady:function(){
        }
    });
    Meteor.subscribe('safetyevents', {
        onReady: function() {
            console.log("demo.js");
            console.log(map._layers);
            var data_array = [0, 0, 0];
            Session.set('fromDate', "'"+moment().subtract(6, "months").format("L")+"'");
            Session.set('toDate', "'"+moment().format("L")+"'");
            triggeredEvents= []
            triggeredEventsDep = new Tracker.Dependency();
            SafetyEvents.find({
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
        })
        dataLoading = false; //to prevent tracker.autorun being called when data is loading to client collection
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
}
