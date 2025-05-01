const map = L.map('map').setView([40.7128, -74.006], 10);

// Load basemap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

// Load CSV pollution data
let pollutionData = {};

Papa.parse("nyc_bike_pollution.csv", {
  download: true,
  header: true,
  complete: function(results) {
    results.data.forEach(row => {
      pollutionData[row.CD] = parseFloat(row.PM25_Value);
    });

    // Load GeoJSON after CSV is parsed
    fetch("nyc_districts.geojson")
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          style: feature => {
            const cd = feature.properties.BoroCD.toString().padStart(3, '0');
            const pm = pollutionData[cd];
            return {
              fillColor: getColor(pm),
              weight: 1,
              opacity: 1,
              color: 'white',
              fillOpacity: 0.7
            };
          },
          onEachFeature: (feature, layer) => {
            const cd = String(feature.properties.BoroCD).padStart(3, '0');
            const pm = pollutionData[cd];
            layer.bindTooltip(`CD ${cd}<br>PM2.5: ${pm ? pm.toFixed(1) : "N/A"}`);
          }
        }).addTo(map);
      });
  }
});

// Color scale for PM2.5
function getColor(d) {
  return d > 18 ? '#800026' :
         d > 16 ? '#BD0026' :
         d > 14 ? '#E31A1C' :
         d > 12 ? '#FC4E2A' :
         d > 10 ? '#FD8D3C' :
         d > 8  ? '#FEB24C' :
         d > 6  ? '#FED976' :
                  '#FFEDA0';
}
