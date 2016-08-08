Template.eventtable.onCreated(function(){
     this.subscribe("safetyevents");
      this.subscribe("markers");
});

Template.eventtable.helpers({
    'getData': function() {
        triggeredEventsDep.depend();
       return triggeredEvents;
    }
});

Template.eventRow.events({
  'click': function(e) {
    if (typeof eventMarker == 'undefined') {
            eventMarker=[];
        }
    for(i=0;i<eventMarker.length;i++)
            map.removeLayer(eventMarker[i]);
    eventMarker[0] =  L.marker([this.Lat, this.Lon], {icon: highIcon})
                      .addTo(map)
                      .bindPopup("<b>Typeu:</b> "+this.Nature_Classification+"<br>"+"<b>Location:</b>"+this.General_Location+"<br>")
                      .openPopup();

    //$('.eventRow').removeClass('highlight');
    //$(e.currentTarget).addClass('highlight');
  }
});
