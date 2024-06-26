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
  simplifyFactor: 0.5,
  onEachFeature: function (feature, layer) {
    layer.on('click', function () {
      var properties = feature.properties;
      var details = "SSSI Name: " + properties.sssi_name + "<br>";
      alert(details);
    });
  }
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
    layer.on('click', function () {
      var properties = feature.properties;
      var details = Object.keys(properties).map(function (k) {
        return k + ": " + properties[k];
      }).join("<br />");
      alert(details);
    });
  }
});

// Load Listed Buildings GeoJSON data
fetch('https://services-eu1.arcgis.com/ZOdPfBS3aqqDYPUQ/arcgis/rest/services/National_Heritage_List_for_England_NHLE_v02_VIEW/FeatureServer/3/query?outFields=*&where=1%3D1&f=geojson')
  .then(response => response.json())
  .then(data => listedBuildingsLayer.addData(data));

// Add WFS layer for Flood Zone 2
var floodZone2Layer = L.WFS({
  url: 'https://environment.data.gov.uk/spatialdata/flood-map-for-planning-rivers-and-sea-flood-zone-2/wfs',
  typeName: 'Flood_Map_for_Planning_Rivers_and_Sea_Flood_Zone_2',
  crs: L.CRS.EPSG4326,
  maxFeatures: 1000,
  style: {
    color: '#0000ff',
    weight: 2
  },
  onEachFeature: function (feature, layer) {
    layer.bindPopup(Object.keys(feature.properties).map(function (k) {
      return k + ": " + feature.properties[k];
    }).join("<br />"));
  }
});

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
    if (!map.hasLayer(floodZone2Layer)) {
      map.addLayer(floodZone2Layer);
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
    if (map.hasLayer(floodZone2Layer)) {
      map.removeLayer(floodZone2Layer);
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
  "Listed Buildings": listedBuildingsLayer,
  "Flood Zone 2": floodZone2Layer
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
      if (properties.sssi_name) {
        sssiInfo.innerHTML += "SSSI Name: " + properties.sssi_name + "<br>";
      }
    }
  });

  // Check intersection with Conservation Areas Layer
  conservationAreasLayer.eachLayer(function (featureLayer) {
    if (layer.getBounds().intersects(featureLayer.getBounds())) {
      intersects = true;
      var properties = featureLayer.feature.properties;
      for (var key in properties) {
        sssiInfo.innerHTML += key + ": " + properties[key] + "<br>";
      }
    }
  });

  // Check intersection with Listed Buildings Layer
  listedBuildingsLayer.eachLayer(function (featureLayer) {
    if (layer.getBounds().intersects(featureLayer.getBounds())) {
      intersects = true;
      var properties = featureLayer.feature.properties;
      for (var key in properties) {
        sssiInfo.innerHTML += key + ": " + properties[key] + "<br>";
      }
    }
  });

  // Check intersection with Flood Zone 2 Layer
  floodZone2Layer.eachLayer(function (featureLayer) {
    if (layer.getBounds().intersects(featureLayer.getBounds())) {
      intersects = true;
      var properties = featureLayer.feature.properties;
      for (var key in properties) {
        sssiInfo.innerHTML += key + ": " + properties[key] + "<br>";
      }
    }
  });

  if (intersects) {
    alert('The drawn shape intersects with one or more layers. See details in the SSSI Info box.');
  } else {
    alert('The drawn shape does not intersect with any SSSI, Conservation Area, Listed Building, or Flood Zone 2.');
  }
});

// Clear drawn items
document.getElementById('clear-drawn-items').onclick = function() {
  drawnItems.clearLayers();
  document.getElementById('sssi-info').innerHTML = '';
};

// Click event to show details of the clicked asset
function showDetails(e) {
  var layer = e.target;
  var properties = layer.feature.properties;
  var details = Object.keys(properties).map(function (k) {
    return k + ": " + properties[k];
  }).join("<br />");
  alert(details);
}

// Add click event listeners to each layer
sssiLayer.on('click', showDetails);
conservationAreasLayer.on('click', showDetails);
listedBuildingsLayer.on('click', showDetails);
floodZone2Layer.on('click', showDetails);
