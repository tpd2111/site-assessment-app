// Initialize the map
var map = L.map('map').setView([52.3555, -1.1743], 6);

// Add OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load UK SSSI data from the GeoJSON file on S3
fetch('https://tpd2111bucket.s3.eu-north-1.amazonaws.com/SSSI_Impact_Risk_Zones_England_-3698026961114884751.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        var sssiLayer = L.geoJSON(data, {
            style: function() {
                return { color: 'red', weight: 2 };
            }
        }).addTo(map);

        // Add layer control
        var baseLayers = {
            "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        };

        var overlays = {
            "SSSI Layer": sssiLayer,
            "Drawn Items": drawnItems
        };

        L.control.layers(baseLayers, overlays).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

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
    var intersects = false;
    sssiLayer.eachLayer(function (sssiLayer) {
        if (layer.getBounds().intersects(sssiLayer.getBounds())) {
            intersects = true;
        }
    });

    if (intersects) {
        alert('The drawn shape intersects with a Site of Special Scientific Interest!');
    } else {
        alert('No intersection with any Site of Special Scientific Interest.');
    }
});
