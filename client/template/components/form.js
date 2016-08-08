Template.form.events({ //filter map data on form submit
    "change #university": function(evt) {
      var newValue = $(evt.target).val();
      console.log(newValue);
      var oldValue = Session.get("university");
      if (newValue != oldValue) {
        // value changed
       Session.setPersistent('university', newValue);
       location.reload();
      }
    },
     "change #isCity": function(evt) {
      var newValue = $(evt.target).val();
      console.log(newValue);
      var oldValue = Session.get("isCity");
      if (newValue != oldValue) {
        // value changed
       Session.setPersistent('isCity', newValue);
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
                     },
                     "Is_City":{$eq:0}
                 });
             } else {
                 var results = SafetyEvents.find({
                     "Date_Time_Reported": {
                         $gte: new Date(fromDate),
                         $lte: new Date(toDate)
                     },
                      "Is_City":{$eq:0},
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
                 /*eventMarker[i].addTo(map).on('mouseover', function(e) { //marker on click
                      console.log("hello==");

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
                 });*/
                 i++;
             })
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
    $("#daterange").ionRangeSlider({
          type: "double",
    min: +moment().subtract(3, "years").format("X"),
    max: +moment().format("X"),
    from: +moment().subtract(6, "months").format("X"),
    to:+moment().format("X"),
    onFinish: function (data) {//fired when the date range slider is moved to a new position
    markerClusters = L.markerClusterGroup();
    var fromDate="'"+moment.unix(data.from).format("MM/DD/YYYY")+"'";
     var toDate="'"+moment.unix(data.to).format("MM/DD/YYYY")+"'";
     Session.set('fromDate', fromDate);
     Session.set('toDate', toDate);
     console.log(Session.get("isCity"));
     var severity=Session.get('severity');
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


        if (typeof eventMarker == 'undefined') {
            eventMarker=[];
            triggeredEvents=[];
        }
        for(i=0;i<eventMarker.length;i++)
            map.removeLayer(eventMarker[i]);
        triggeredEvents=[];
        i=0;

        results.forEach(function(obj) { //add markers to map for each result
            //break if events not within marker area
            var withinSubscription=0;
              var eventmarkers = Markers.find({"userid": Meteor.userId()});
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
                if(obj.Severity==2)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: highIcon,riseOnHover:true,opacity:0.8});
                else if(obj.Severity==1)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: mediumIcon,riseOnHover:true,opacity:0.8});
                else if(obj.Severity==0)
                        eventMarker[i] =  L.marker([obj.Lat, obj.Lon], {icon: lowIcon,riseOnHover:true,opacity:0.8});

                eventMarker[i].eventId = obj.ReportID;//pass the event id
                markerClusters.addLayer(eventMarker[i]);
                map.addLayer(markerClusters);

                markerClusters.on('clustermouseover', function (a) {
                                // a.layer is actually a cluster
                               // console.log('cluster ' + a.layer.getAllChildMarkers());
                              //  markers = a.layer.getAllChildMarkers();
                            console.log('test');
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
    },
    prettify: function (num) {
          return moment(num, "X").format("MMM Do YYYY");
    }

});

};

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
   },
   uhunterSelected: function () {
     return (Session.get('university') == 5) ? 'selected' : '';
   },
   citySelected: function () {
     return (Session.get('isCity') == 1) ? 'selected' : '';
   },
   ampusSelected: function () {
     return (Session.get('isCity') == 0) ? 'selected' : '';
   },
   getTips: function () {
     return SafetyTips.find({"DescriptionCategory": "Sex Offense"});
   }

});
