<script>
  // Initialize the map
  var map = L.map('map').setView([54.5, -3], 6);

  // Add OpenStreetMap layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
    where: "1=1"
  });

  // Only load SSSI data at zoom level 10 or higher
  map.on('zoomend', function() {
    if (map.getZoom() >= 10) {
      if (!map.hasLayer(sssiLayer)) {
        map.addLayer(sssiLayer);
      }
    } else {
      if (map.hasLayer(sssiLayer)) {
        map.removeLayer(sssiLayer);
      }
    }
  });

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

    // Check for intersection with SSSI layer
    var intersects = false;
    sssiLayer.eachFeature(function (featureLayer) {
      if (layer.getBounds().intersects(featureLayer.getBounds())) {
        intersects = true;
      }
    });

    if (intersects) {
      alert('The drawn shape intersects with an SSSI area.');
    } else {
      alert('The drawn shape does not intersect with any SSSI area.');
    }
  });
</script>
