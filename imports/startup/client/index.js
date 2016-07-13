 Meteor.startup(function() {

        dataLoading = true;
     
        Session.setPersistent('university', 0);
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



