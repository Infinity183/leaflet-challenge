// We'll be pulling from this map for our earthquake data.
var url_ref = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Let's use d3.json to convert the JSON data into an object.
d3.json(url_ref, function(data) {
    console.log(data.features);
    // We'll plug the object into a new function.
    makeFeatures(data.features);
});

function makeFeatures(earthquake_data) {

    // We'll list all of the places on here.
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place);
    }

    // We'll create our array of earthquakes as quake_spots.
    var quake_spots = L.geoJSON(earthquake_data, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3> Location: " + feature.properties.place + "</h3><hr><p>"
            + "Magnitude: " + feature.properties.mag + "<br> Depth: "
            + feature.geometry.coordinates[2])
        },
        // We want to create circles to represent each earthquake.
        // We'll use pointToLayer to make that happen.
        // latlng will refer to the basic coordinates of each.
        pointToLayer: function(feature, latlng) {
            return new L.circle(latlng, {
                fillOpacity:0.85,
                fillColor: marker_color(feature.geometry.coordinates[2]),
                // It needs to be large enough to see from afar!
                radius: (feature.properties.mag) * 15000,
                stroke: true,
                color: "#000000",
                weight: 1
            })
        }

    });
    // With the earthquake markers coded, we need to put them on a map.
    map_maker(quake_spots);
}

// The colors are going to be based on depth.
function marker_color(depth) {
    if (depth >= 90) {
        return "#FF0000";
    }
    else if (depth >= 80) {
        return "#FF3c00";
    }
    else if (depth >= 70) {
        return "#FF8000";
    }
    else if (depth >= 60) {
        return "#FFbf00";
    }
    else if (depth >= 50) {
        return "#FFFF00";
    }
    else if (depth >= 50) {
        return "#BFFF00";
    }
    else if (depth >= 40) {
        return "#80FF00";
    }
    else if (depth >= 30) {
        return "#40FF00";
    }
    else if (depth >= 20) {
        return "#00FF00";
    }
    else if (depth >= 10) {
        return "#00FF40";
    }

    else {
        return "#00FF80"
    }
}

function map_maker(quake_spots) {

    // There will be both a light map and dark map.    
    var light_map = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });

    var dark_map = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });
    
    var base_maps = {
        "Light Map": light_map,
        "Dark Map": dark_map
    };

    // We need to overlay the quake_spots data onto our base maps.
    var overlay_maps = {
        Earthquakes: quake_spots
    };

    // You'll be able to see the whole world by default here.
    var earthquake_map = L.map("map", {
        center: [0,0],
        zoom: 2,
        layers: [light_map, quake_spots]
    });

    L.control.layers(base_maps, overlay_maps, {
        collapsed: false
    }).addTo(earthquake_map);

    // Our legend needs to be made.
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            // color_ranges corresponds to the marker_color thresholds.
            color_ranges = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
    
        // We'll create our legend items by looping through these.
        for (var i = 0; i < color_ranges.length; i++) {
            div.innerHTML +=
                '<i style="background:' + marker_color(color_ranges[i] + 1) + '"></i> ' +
                color_ranges[i] + (color_ranges[i + 1] ? '&ndash;' + color_ranges[i + 1] + '<br>' : '+');
        }
        return div;
    };
    
    // Finally, we'll add the legend to our earthquake map.
    legend.addTo(earthquake_map);
}