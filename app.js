// Initialize the map
var map = L.map('map').setView([52.3555, -1.1743], 6);

// Add OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load UK SSSI data from the ESRI REST service
var sssiLayer = L.esri.featureLayer({
    url: 'https://environment.data.gov.uk/arcgis/rest/services/NE/SitesOfSpecialScientificInterestEngland/FeatureServer/0',
    style: function() {
        return { color: 'red', weight: 2 };
    }
}).addTo(map);

// Add drawing functionality
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polyline: true,
        polygon: true,
        circle: false,
        marker: false,
        rectangle: true
    }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);

    // Check for intersection with SSSI layer
    sssiLayer.query().intersects(layer.toGeoJSON()).run(function(error, featureCollection){
        if (featureCollection.features.length > 0) {
            alert('The drawn shape intersects with a Site of Special Scientific Interest!');
        } else {
            alert('No intersection with any Site of Special Scientific Interest.');
        }
    });
});

// Add layer control
var baseLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
};

var overlays = {
    "SSSI Layer": sssiLayer,
    "Drawn Items": drawnItems
};

L.control.layers(baseLayers, overlays).addTo(map);
