Markers = new Mongo.Collection('markers');
Comments = new Mongo.Collection("eventcomments");
SafetyEvents = new Mongo.Collection('safetyevents');
EventToComment = new Mongo.Collection("eventtocomment");



if (Meteor.isServer) {
  Meteor.startup(function() {
        // code to run on server at startup
       // Queue.setInterval('deleteAllMarkers', 'Markers.remove({})', 86400000); // once a day 
        //Queue.run();
        process.env.MAIL_URL = "smtp://postmaster@sandbox962d7590278c4911a7b7b0576075af29.mailgun.org:0cbf4f365a928efe929653b2b7c08b54@smtp.mailgun.org:587";

    });

    // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });
 
  // Generates: GET, POST on /api/safetyevents and GET, PUT, DELETE on
  // /api/safetyevents/:id for the Items collection
  Api.addCollection(SafetyEvents, {
    excludedEndpoints: ['getAll', 'put'],
        routeOptions: {
          authRequired: false
        },
        endpoints: {
            post:  {//how to send post to this API=>curl localhost:3000/api/safetyevents// -d "Lat=24.45" -d "Lon=43.56"

               action: function () {
               var name = this.bodyParams.title;
                console.log ("Entity: " + name);
                
              if (getDistanceFromLatLonInKm(this.bodyParams.Lon,this.bodyParams.Lat,Markers.find().fetch()[0].Lat,Markers.find().fetch()[0].Lon) < Markers.find().fetch()[0].radius/1000)
                   {
                    Email.send({
                      to: "danushkabandara@gmail.com",
                      from: "danushkabandara@gmail.com",
                      subject: "Example Email",
                      text: "The contents of our email in plain text."
                    });
                return true
                  }
                }
            }
        }

     });
     Meteor.publish('markers', function() {
                return Markers.find({});
        });
   Meteor.publish('eventcomments', function() {
        return Comments.find({});
    });
    Meteor.publish('eventtocomment', function() {
        return EventToComment.find({});
    });
    Meteor.publish('safetyevents', function() {
        return SafetyEvents.find({});
    });
}
