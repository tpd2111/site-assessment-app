// Wait until the DOM is fully loaded
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
    outputFormat: 'application/json'
  });

  // Fetch WFS data and add to map
  fetch(`${wfsUrl}?${wfsParams.toString()}`)
    .then(response => response.json())
    .then(data => {
      var wfsLayer = L.geoJSON(data, {
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
