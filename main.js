console.log("Main JS is connected");
 const map = L.map('map').setView([40.7128, -74.006], 10);
 
 // Load basemap
 // Add base map tiles
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 18,
 }).addTo(map);
 
 // Load CSV pollution data
 // Store PM2.5 data from CSV
 let pollutionData = {};
 
 // Load CSV using PapaParse
 Papa.parse("nyc_bike_pollution.csv", {
   download: true,
   header: true,
 @@ -17,36 +17,40 @@ Papa.parse("nyc_bike_pollution.csv", {
       pollutionData[row.CD] = parseFloat(row.PM25_Value);
     });
 
     // Load GeoJSON after CSV is parsed
     // Load GeoJSON map data after CSV is parsed
     fetch("nyc_districts.geojson")
       .then(res => res.json())
       .then(geojson => {
         L.geoJSON(geojson, {
           style: feature => {
             const cd = feature.properties.BoroCD.toString().padStart(3, '0');
             const cd = String(feature.properties.BoroCD).padStart(3, '0');
             const pm = pollutionData[cd];
 
             return {
               fillColor: getColor(pm),
               weight: 1,
               opacity: 1,
               color: 'white',
               fillOpacity: 0.7
               fillOpacity: isNaN(pm) ? 0.2 : 0.7,
               opacity: 1
             };
           },
           onEachFeature: (feature, layer) => {
             const cd = String(feature.properties.BoroCD).padStart(3, '0');
             const pm = pollutionData[cd];
             console.log("Matching CD:", cd, "→ PM2.5:", pm);
             layer.bindTooltip(`CD ${cd}<br>PM2.5: ${pm ? pm.toFixed(1) : "N/A"}`);
 
             layer.bindTooltip(
               `CD ${cd}<br>PM2.5: ${isNaN(pm) ? "No data" : pm.toFixed(1)}`
             );
           }
         }).addTo(map);
       });
   }
 });
 
 // Color scale for PM2.5
 // Color scale function
 function getColor(d) {
   return d > 18 ? '#800026' :
   return isNaN(d) ? '#ccc' :
          d > 18 ? '#800026' :
          d > 16 ? '#BD0026' :
          d > 14 ? '#E31A1C' :
          d > 12 ? '#FC4E2A' :
const boroughStats = {
  "Manhattan": { pm25: 7.83, bike: 2.3 },
  "Brooklyn": { pm25: 6.80, bike: 2.0 },
  "Queens": { pm25: 6.66, bike: 0.6 },
  "Bronx": { pm25: 7.06, bike: 0.4 },
  "Staten Island": { pm25: 6.14, bike: 0.2 }
};
function getColorPm25(d) {
  return d > 7.5 ? '#800026' :
         d > 7.0 ? '#BD0026' :
         d > 6.5 ? '#E31A1C' :
         d > 6.0 ? '#FC4E2A' :
                   '#FFEDA0';
}

function getColorBike(d) {
  return d > 2.0 ? '#084594' :
         d > 1.0 ? '#2171b5' :
         d > 0.5 ? '#4292c6' :
         d > 0.2 ? '#6baed6' :
                   '#c6dbef';
}
function stylePm25(feature) {
  const borough = feature.properties.boro_name;
  const value = boroughStats[borough]?.pm25;
  return {
    fillColor: getColorPm25(value),
    weight: 1,
    color: '#fff',
    fillOpacity: 0.7
  };
}

function styleBike(feature) {
  const borough = feature.properties.boro_name;
  const value = boroughStats[borough]?.bike;
  return {
    fillColor: getColorBike(value),
    weight: 1,
    color: '#fff',
    fillOpacity: 0.7
  };
}
let pm25Layer, bikeLayer;

fetch('nyc_districts.geojson')
  .then(res => res.json())
  .then(data => {
    pm25Layer = L.geoJson(data, {
      style: stylePm25,
      onEachFeature: function (feature, layer) {
        const name = feature.properties.boro_name;
        const val = boroughStats[name];
        if (val) {
          layer.bindPopup(`<strong>${name}</strong><br>PM2.5: ${val.pm25}<br>Bike %: ${val.bike}`);
        }
      }
    }).addTo(map);

    bikeLayer = L.geoJson(data, {
      style: styleBike,
      onEachFeature: function (feature, layer) {
        const name = feature.properties.boro_name;
        const val = boroughStats[name];
        if (val) {
          layer.bindPopup(`<strong>${name}</strong><br>Bike %: ${val.bike}<br>PM2.5: ${val.pm25}`);
        }
      }
    });

    // Add toggle control
    const baseLayers = {
      "Air Pollution (PM2.5)": pm25Layer,
      "Biking Commuters (%)": bikeLayer
    };
    L.control.layers(baseLayers).addTo(map);
  });
