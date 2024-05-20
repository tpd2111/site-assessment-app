// Initialize the map
var map = L.map('map').setView([51.505, -0.09], 6);

// Add a base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Layer to hold SSSI data
var sssiLayer = L.geoJSON(null, {
    style: { color: 'blue' }
}).addTo(map);

// Load SSSI data from WFS
var wfsUrl = 'https://environment.data.gov.uk/spatialdata/sites-of-special-scientific-interest-england/wfs';
$.ajax({
    url: wfsUrl,
    data: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'sssi',
        outputFormat: 'application/json',
        srsName: 'EPSG:4326'
    },
    success: function (data) {
        sssiLayer.addData(data);
    }
});

// Initialize the draw control
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: true,
        polyline: true,
        rectangle: false,
        circle: false,
        marker: false
    }
});
map.addControl(drawControl);

// Handle the created polygon or polyline and analyze intersections
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);

    // Analyze intersections
    analyzeIntersections(layer);
});

function analyzeIntersections(drawnLayer) {
    var drawnGeometry = drawnLayer.toGeoJSON();
    var intersections = [];

    sssiLayer.eachLayer(function (layer) {
        if (turf.booleanIntersects(drawnGeometry, layer.toGeoJSON())) {
            intersections.push(layer.feature.properties.name);
        }
    });

    if (intersections.length > 0) {
        alert('Intersections found with the following SSSI sites: \n' + intersections.join(', '));
    } else {
        alert('No intersections found.');
    }
}
