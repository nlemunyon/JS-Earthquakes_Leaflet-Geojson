// Store the URL for the GeoJSON data
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Add a Leaflet tile layer for streets
let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Add a Leaflet tile layer for topography
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="http://viewfinderpanoramas.org">SRTM</a> | ' +
        'Map style: &copy; <a href="https://opentopomap.org/">OpenTopoMap</a> ' +
        '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a Leaflet map object
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [streets] // Start with streets layer as default
});

// Define basemaps as streets and topo
let baseMaps = {
    "Streets": streets,
    "Topography": topo
};

// Define the earthquake layergroup and tectonic plate layergroups for the map
let earthquake_data = new L.LayerGroup();
let tectonics = new L.LayerGroup();

// Define the overlays and link the layergroups to separate overlays
let overlays = {
    "Earthquakes": earthquake_data,
    "Tectonic Plates": tectonics
};

// Add a control layer and pass in baseMaps and overlays
L.control.layers(baseMaps, overlays).addTo(myMap);

// This styleInfo function will dictate the styling for all of the earthquake points on the map
function styleInfo(feature) {
    return {
        color: chooseColor(feature.geometry.coordinates[2]),
        radius: chooseRadius(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2])
    };
}

// Define a function to choose the fillColor of the earthquake based on earthquake depth
function chooseColor(depth) {
    if (depth <= 10) return "red";
    else if (depth > 10 && depth <= 25) return "orange";
    else if (depth > 25 && depth <= 40) return "yellow";
    else if (depth > 40 && depth <= 55) return "pink";
    else if (depth > 55 && depth <= 70) return "blue";
    else return "green";
}

// Define a function to determine the radius of each earthquake marker
function chooseRadius(magnitude) {
    return magnitude * 5;
}

// Fetch the earthquake JSON data with d3
d3.json(url).then(function (data) {
    L.geoJson(data, {
        pointToLayer: function (feature, latlon) {
            return L.circleMarker(latlon).bindPopup(
                "Magnitude: " + feature.properties.mag + "<br>" +
                "Latitude: " + latlon.lat + "<br>" +
                "Longitude: " + latlon.lng + "<br>" +
                "Depth: " + feature.geometry.coordinates[2] + " km"
            );
        },
        style: styleInfo
    }).addTo(earthquake_data);
    earthquake_data.addTo(myMap);

    // Fetch the tectonic plate data and draw purple lines over the plates
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) {
        L.geoJson(data, {
            color: "purple",
            weight: 3
        }).addTo(tectonics);
        tectonics.addTo(myMap);
    });
});

// Create the legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function (myMap) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Depth Color Legend</h4>";
    div.innerHTML += '<div class="legend-item"><i style="background: red"></i><span>(Depth &lt; 10 km)</span></div>';
    div.innerHTML += '<div class="legend-item"><i style="background: orange"></i><span>(10 km &le; Depth &lt; 25 km)</span></div>';
    div.innerHTML += '<div class="legend-item"><i style="background: yellow"></i><span>(25 km &le; Depth &lt; 40 km)</span></div>';
    div.innerHTML += '<div class="legend-item"><i style="background: pink"></i><span>(40 km &le; Depth &lt; 55 km)</span></div>';
    div.innerHTML += '<div class="legend-item"><i style="background: blue"></i><span>(55 km &le; Depth &lt; 70 km)</span></div>';
    div.innerHTML += '<div class="legend-item"><i style="background: green"></i><span>(Depth &ge; 70 km)</span></div>';

    return div;
};
legend.addTo(myMap);