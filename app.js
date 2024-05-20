// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create a Leaflet map instance
  var map = L.map('map').setView([54.5, -3], 6);

  // Add a tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  // Create a WFS layer
  var wfsLayer = new L.WFS({
    url: "https://environment.data.gov.uk/spatialdata/sites-of-special-scientific-interest-england/wfs",
    typeNS: "gov.uk",
    typeName: "statistical-gis-boundaries",
    crs: L.CRS.EPSG4326, // Ensure the correct CRS
    showExisting: true
  });

  wfsLayer.once('load', function() {
    map.fitBounds(wfsLayer.getBounds());
  });

  // Add the WFS layer to the map
  wfsLayer.addTo(map);

  // Style the WFS layer
  wfsLayer.setStyle({
    color: 'blue',
    weight: 2,
    fillOpacity: 0.2
  });
});
