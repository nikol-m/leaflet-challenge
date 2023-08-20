// Store API endpoint as URL
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(url).then(function (data) {
    // Once we receive a response, then perform the createFeatures function
    createFeatures(data.features);
});

// Create the createFeatures function to make popups for each entry
function createFeatures(response) {
    // Create a popup that displays the location, magnitude, depth, and time of each earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h2>" + feature.properties.place + "</h2>" 
        + "<hr>" + "Magnitude: " + feature.properties.mag + "<br>" + "Depth: "
        + feature.geometry.coordinates[2] + "<br>" + "Time: " 
        + Date(feature.properties.time));
    }
    // Create a function to modify each point to be a circle, with size determined by 
    // magnitude and color determined by depth
    function createCircle(feature, latlng) {
        let options = {
            radius: 10,
            color: "black",
            weight: 1.0,
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            fillOpacity: .75,
            radius: feature.properties.mag * 4
        }
        return L.circleMarker(latlng, options);
    }
    // Run this onEachFeature function and createCircle function on each item in array
    let earthquakes = L.geoJSON(response, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircle
    });
    // Send the earthquakes layer to the createMap function defined below
    createMap(earthquakes);
}

// Create function to create map of earthquake entries
function createMap(earthquakes) {
    // Define base layers
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let baseMap = {
        "Street Map": streetmap
    };

    // Add earthquakes as overlay map
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create map using base layers and overlay
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });
    // Create layer control and add to map
    L.control.layers(baseMap, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legend to show depths and add to bottom right of map
    let legend = L.control({
        position: "bottomright"
    });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "legend");
        depths = [-10, 10, 30, 50, 70, 90];
        labels = [];
        div.innerHTML += "<h3 align='right'>Depth</h3>";
        for (i = 0; i < depths.length; i++) {
            labels.push('<ul style="background-color:' + chooseColor(depths[i] + 1) + '"> <span>' + depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '' : '+') + '</span></ul>');
        }
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };
    legend.addTo(myMap);
};

// Create function to determine circle color based on depth of earthquake, 
// used in createCircle function above
function chooseColor(depth) {
    if (depth > 90) return "red";
    else if (depth > 70) return "orangered";
    else if (depth > 50) return "darkorange";
    else if (depth > 30) return "orange";
    else if (depth > 10) return "yellow";
    else return "lime";
};


