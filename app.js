document.addEventListener('DOMContentLoaded', function() {
  // Create a Leaflet map instance
  var map = L.map('map').setView([54.5, -3], 6);

  // Add a tile layer
  var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  // Define the ESRI REST API URL
  var esriUrl = "https://environment.data.gov.uk/arcgis/rest/services/NE/SitesOfSpecialScientificInterestEngland/FeatureServer/0/query";
  var esriParams = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    f: "geojson"
  });

  // Fetch data from the ESRI REST API
  fetch(`${esriUrl}?${esriParams.toString()}`)
    .then(response => response.json())
    .then(data => {
      console.log('Data fetched:', data); // Debugging statement

      // Add GeoJSON layer to the map
      var esriLayer = L.geoJSON(data, {
        style: {
          color: 'blue',
          weight: 2,
          fillOpacity: 0.2
        }
      });

      console.log('Layer created:', esriLayer); // Debugging statement

      // Add layer control to toggle the layer
      var overlayMaps = {
        "SSSI Layer": esriLayer
      };

      L.control.layers(null, overlayMaps).addTo(map);

      // Add the layer to the map by default
      esriLayer.addTo(map);

      // Fit the map to the ESRI layer bounds
      map.fitBounds(esriLayer.getBounds());
    })
    .catch(error => console.error('Error loading ESRI data:', error));
});
