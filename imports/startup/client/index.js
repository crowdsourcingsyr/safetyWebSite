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
                            sAlert.info('Crime Event Occured At '+doc.General_Location);
                    }
                }
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

