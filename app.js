// Initialize the map
var map = L.map('map').setView([51.505, -0.09], 6);

// Add a base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Layer to hold SSSI data
var sssiLayer = L.geoJSON(null, {
    style: { color: 'blue', weight: 2, opacity: 0.6 }
}).addTo(map);

// Load SSSI data from WFS using AllOrigins proxy
var proxyUrl = 'https://api.allorigins.win/get?url=';
var wfsUrl = 'https://environment.data.gov.uk/spatialdata/sites-of-special-scientific-interest-england/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=sssi&outputFormat=application/json&srsName=EPSG:4326';
var encodedUrl = encodeURIComponent(wfsUrl);

$.ajax({
    url: proxyUrl + encodedUrl,
    success: function(response) {
        var data = JSON.parse(response.contents);
        sssiLayer.addData(data);
        console.log("SSSI Data Loaded: ", data);
        if (data.features && data.features.length > 0) {
            console.log("First Feature Properties: ", data.features[0].properties);
        } else {
            console.warn("No features found in the SSSI data.");
        }
    },
    error: function(xhr, status, error) {
        console.error("Failed to load SSSI data:", error);
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
    console.log("Drawn Geometry: ", drawnGeometry);

    var intersections = [];

    sssiLayer.eachLayer(function (layer) {
        var sssiGeometry = layer.toGeoJSON();
        if (turf.booleanIntersects(drawnGeometry, sssiGeometry)) {
            intersections.push(sssiGeometry.properties.name); // Adjust the property name as needed
        }
    });

    if (intersections.length > 0) {
        alert('Intersections found with the following SSSI sites: \n' + intersections.join(', '));
    } else {
        alert('No intersections found.');
    }
}
