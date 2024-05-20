// Initialize the map
var map = L.map('map').setView([54.5, -3], 6);

// Add OpenStreetMap layer
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add zoom level display
var zoomLevel = document.getElementById('zoom-level');
map.on('zoomend', function() {
  zoomLevel.innerHTML = 'Zoom Level: ' + map.getZoom();
});

// Add ESRI layer for SSSI
var sssiLayer = L.esri.featureLayer({
  url: 'https://environment.data.gov.uk/arcgis/rest/services/NE/SitesOfSpecialScientificInterestEngland/FeatureServer/0',
  simplifyFactor: 0.5
});

// Add GeoJSON layer for Conservation Areas
var conservationAreasLayer = L.geoJson(null, {
  style: function (feature) {
    return { color: "#ff0000" };
  },
  onEachFeature: function (feature, layer) {
    layer.bindPopup(Object.keys(feature.properties).map(function (k) {
      return k + ": " + feature.properties[k];
    }).join("<br />"));
  }
});

// Load Conservation Areas GeoJSON data
fetch('https://services-eu1.arcgis.com/ZOdPfBS3aqqDYPUQ/arcgis/rest/services/Conservation_Areas/FeatureServer/1/query?outFields=*&where=1%3D1&f=geojson')
  .then(response => response.json())
  .then(data => conservationAreasLayer.addData(data));

// Add GeoJSON layer for Listed Buildings
var listedBuildingsLayer = L.geoJson(null, {
  style: function (feature) {
    return { color: "#0000ff" };
  },
  onEachFeature: function (feature, layer) {
    layer.bindPopup(Object.keys(feature.properties).map(function (k) {
      return k + ": " + feature.properties[k];
    }).join("<br />"));
  }
});

// Load Listed Buildings GeoJSON data
fetch('https://services-eu1.arcgis.com/ZOdPfBS3aqqDYPUQ/arcgis/rest/services/National_Heritage_List_for_England_NHLE_v02_VIEW/FeatureServer/3/query?outFields=*&where=1%3D1&f=geojson')
  .then(response => response.json())
  .then(data => listedBuildingsLayer.addData(data));

// Only load layers at zoom level 12 or higher
map.on('zoomend', function() {
  if (map.getZoom() >= 12) {
    if (!map.hasLayer(sssiLayer)) {
      map.addLayer(sssiLayer);
    }
    if (!map.hasLayer(conservationAreasLayer)) {
      map.addLayer(conservationAreasLayer);
    }
    if (!map.hasLayer(listedBuildingsLayer)) {
      map.addLayer(listedBuildingsLayer);
    }
  } else {
    if (map.hasLayer(sssiLayer)) {
      map.removeLayer(sssiLayer);
    }
    if (map.hasLayer(conservationAreasLayer)) {
      map.removeLayer(conservationAreasLayer);
    }
    if (map.hasLayer(listedBuildingsLayer)) {
      map.removeLayer(listedBuildingsLayer);
    }
  }
});

// Add layer control
var baseLayers = {
  "OpenStreetMap": osmLayer
};
var overlays = {
  "SSSI Layer": sssiLayer,
  "Conservation Areas": conservationAreasLayer,
  "Listed Buildings": listedBuildingsLayer
};
L.control.layers(baseLayers, overlays).addTo(map);

// Add drawing controls
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
    rectangle: false
  }
});
map.addControl(drawControl);

// Handle created shapes
map.on(L.Draw.Event.CREATED, function (e) {
  var type = e.layerType,
      layer = e.layer;

  // Add the drawn layer to the map
  drawnItems.addLayer(layer);

  // Check for intersection with layers and display info
  var intersects = false;
  var sssiInfo = document.getElementById('sssi-info');
  sssiInfo.innerHTML = '';

  // Check intersection with SSSI Layer
  sssiLayer.eachFeature(function (featureLayer) {
    if (layer.getBounds().intersects(featureLayer.getBounds())) {
      intersects = true;
      var properties = featureLayer.feature.properties;
      for (var key in properties) {
        sssiInfo.innerHTML += key + ": "
