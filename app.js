document.addEventListener('DOMContentLoaded', function() {
  // Create a Leaflet map instance
  var map = L.map('map').setView([54.5, -3], 6);

  // Add a tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  // Define WFS parameters
  var wfsUrl = "https://environment.data.gov.uk/spatialdata/sites-of-special-scientific-interest-england/wfs";
  var wfsParams = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: 'gov.uk:statistical-gis-boundaries',
    outputFormat: 'text/xml; subtype=gml/3.1.1'
  });

  // Fetch WFS data and add to map
  fetch(`${wfsUrl}?${wfsParams.toString()}`)
    .then(response => response.text())
    .then(text => {
      // Parse XML
      var parser = new DOMParser();
      var xml = parser.parseFromString(text, 'text/xml');

      // Convert GML to GeoJSON using OpenLayers
      var format = new ol.format.WFS();
      var features = format.readFeatures(xml);
      var geojsonFormat = new ol.format.GeoJSON();
      var geojson = geojsonFormat.writeFeaturesObject(features);

      // Add GeoJSON layer to the map
      var wfsLayer = L.geoJSON(geojson, {
        style: {
          color: 'blue',
          weight: 2,
          fillOpacity: 0.2
        }
      }).addTo(map);

      // Fit the map to the WFS layer bounds
      map.fitBounds(wfsLayer.getBounds());
    })
    .catch(error => console.error('Error loading WFS data:', error));
});
