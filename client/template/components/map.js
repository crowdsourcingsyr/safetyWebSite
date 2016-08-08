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
      else if(Session.get('university')==5)
    {
            map = L.map('map', {
                doubleClickZoom: false
            }).setView([40.7686793,-73.9647192], 14);
    }

    var tiles = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

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
        //console.log(event.layer);
        //console.log(event.layerType);
        console.log(drawnItems);
        var feature = {
            userid: Meteor.userId(),
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
        //console.log(feature);
        console.log("feature");
        //map.addLayer(layer);
        console.log(Meteor.userId());
        //console.log(hello());
        containerNode = document.createElement('div');
        Blaze.render(Template.circlesavemenu, containerNode); //pass the data into the eventComments template
        layer.bindPopup(containerNode).openPopup();
        Session.set("circle_latlng",layer._latlng);
        Session.set("circle_radius",layer._radius);
        if(Meteor.userId()){
          Markers.insert(feature);
        }else{
          LocalMarkers.insert(feature);
        }
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

    var query = Markers.find({"userid": Meteor.userId()});
    query.observe({
        added: function(doc) {
            console.log(doc);
            switch (doc.layerType) {
                case 'marker':
                    var marker = L.marker(doc.latlng);
                    marker._leaflet_id = doc._id;
                    marker.addTo(drawnItems);
                    break;
                case 'circle':
                    var circle = L.circle(doc.latlng, doc.radius);
                    circle._leaflet_id = doc._id;
                    circle.addTo(drawnItems);
                    break;
                case 'polygon':
                    var polygon = L.polygon(doc.latlngs);
                    polygon._leaflet_id = doc._id;
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

    var query_local = LocalMarkers.find({"userid": null});
    query_local.observe({
      added: function(doc) {
          console.log(doc);
          switch (doc.layerType) {
              case 'marker':
                  var marker = L.marker(doc.latlng);
                  marker._leaflet_id = doc._id;
                  marker.addTo(drawnItems);
                  break;
              case 'circle':
                  var circle = L.circle(doc.latlng, doc.radius);
                  circle._leaflet_id = doc._id;
                  circle.addTo(drawnItems);
                  break;
              case 'polygon':
                  var polygon = L.polygon(doc.latlngs);
                  polygon._leaflet_id = doc._id;
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

Tracker.autorun(function(){
  var test = Session.get("circle_latlng");
  var radius = Session.get("circle_radius");
  console.log(test);
});
