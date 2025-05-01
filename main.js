const map = L.map('map').setView([40.7128, -74.006], 10);

// Add base map tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

// Store PM2.5 data from CSV
let pollutionData = {};

// Load CSV using PapaParse
Papa.parse("nyc_bike_pollution.csv", {
  download: true,
  header: true,
  complete: function(results) {
    results.data.forEach(row => {
      pollutionData[row.CD] = parseFloat(row.PM25_Value);
    });

    // Load GeoJSON map data after CSV is parsed
    fetch("nyc_districts.geojson")
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          style: feature => {
            const cd = String(feature.properties.BoroCD).padStart(3, '0');
            const pm = pollutionData[cd];

            return {
              fillColor: getColor(pm),
              weight: 1,
              color: 'white',
              fillOpacity: isNaN(pm) ? 0.2 : 0.7,
              opacity: 1
            };
          },
          onEachFeature: (feature, layer) => {
            const cd = String(feature.properties.BoroCD).padStart(3, '0');
            const pm = pollutionData[cd];

            layer.bindTooltip(
              `CD ${cd}<br>PM2.5: ${isNaN(pm) ? "No data" : pm.toFixed(1)}`
            );
          }
        }).addTo(map);
      });
  }
});

// Color scale function
function getColor(d) {
  return isNaN(d) ? '#ccc' :
         d > 18 ? '#800026' :
         d > 16 ? '#BD0026' :
         d > 14 ? '#E31A1C' :
         d > 12 ? '#FC4E2A' :
         d > 10 ? '#FD8D3C' :
         d > 8  ? '#FEB24C' :
         d > 6  ? '#FED976' :
                  '#FFEDA0';
}
