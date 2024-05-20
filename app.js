```javascript
// Create a Leaflet map instance
var map = L.map('map').setView([54.5, -3], 6);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);

// Create a WFS layer
var wfsLayer = L.GeoJSON.WFS("https://data.gov.uk/data/wfs", {
  showExisting: true,
  typeNS: "gov.uk",
  typeName: "statistical-gis-boundaries"
}).addTo(map);

// Style the WFS layer
wfsLayer.setStyle({
  color: 'blue',
  weight: 2,
  fillOpacity: 0.2
});

```
