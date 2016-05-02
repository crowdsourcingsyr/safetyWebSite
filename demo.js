Markers = new Mongo.Collection('markers');
QueueMap = new Mongo.Collection('queuemap');
SafetyEvents = new Mongo.Collection('safetyevents');

if (Meteor.isClient) {
    Meteor.subscribe('queuemap', function() {});
    Meteor.subscribe('markers', function() {});
    Meteor.subscribe('safetyevents', {
        onReady: function() {
            var i = 0;
            data_array = [0, 0, 0];
            SafetyEvents.find().forEach(function(obj) { //traverse the collection and add to heatmap layer
                data_array[i] = [obj.Lat, obj.Lon, .3];
                i++;
            })

            heat = L.heatLayer(data_array, {
                radius: 20,
                blur: 15,
                max: 1,
                gradient: {
                    0: 'orange',
                    1: 'red'
                }
            }).addTo(map);
        }
    });

    Template.map.rendered = function() {
        L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

        map = L.map('map', {
            doubleClickZoom: false
        }).setView([43.0391534, -76.1351158], 15);

        var tiles = L.tileLayer.provider('MapQuestOpen.OSM').addTo(map);

        var drawnItems = L.featureGroup().addTo(map);

        map.addControl(new L.Control.Draw({
            draw: {
                polyline: false,
                polygon: false,
                rectangle: false
            },
            edit: {
                featureGroup: drawnItems,
                edit: false,
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

    $(function() {
        $(document).ready(function() {
            $('#map').css({
                height: $(window).height() + 'px'
            });
        });
        $(window).resize(function() {
            $('#map').css({
                height: $(window).height() + 'px'
            });
        });
    });
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
        Queue.setInterval('deleteAllMarkers', 'Markers.remove({})', 86400000); /* once a day */
        Queue.run();
    });
    Meteor.publish('markers', function() {
        return Markers.find({});
    });
    Meteor.publish('queuemap', function() {
        return QueueMap.find({});
    });
    Meteor.publish('safetyevents', function() {
        return SafetyEvents.find({});
    });
}
