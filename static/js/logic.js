
var url_ref = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"

d3.json(url_ref, function(data) {
    console.log(data.features);
    makeFeatures(data.features);
    
});



function makeFeatures(earthquake_data) {

    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place);
    }

    var quake_spots = L.geoJSON(earthquake_data, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3> Location: " + feature.properties.place + "</h3><hr><p>"
            + "Magnitude: " + feature.properties.mag + "<br> Depth: "
            + feature.geometry.coordinates[2])
        },
        pointToLayer: function(feature, latlng) {
            return new L.circle(latlng, {
                fillOpacity:0.85,
                fillColor: marker_color(feature.geometry.coordinates[2]),
                radius: (feature.properties.mag) * 50000,
                stroke: true,
                color: "#000000",
                weight: 1
            })
        }


    });
    map_maker(quake_spots);
}

function marker_color(depth) {
    if (depth >= 90) {
        return "#FF0000";
    }
    else if (depth >= 70) {
        return "#FF3c00";
    }
    else if (depth >= 50) {
        return "#FF8000";
    }
    else if (depth >= 30) {
        return "#FFbf00";
    }
    else if (depth >= 10) {
        return "#FFFF00";
    }
    else {
        return "#BFFF00"
    }
}

function map_maker(quake_spots) {

    
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

    var overlay_maps = {
        Earthquakes: quake_spots
    };

    var earthquake_map = L.map("map", {
        center: [0,0],
        zoom: 2,
        layers: [light_map, quake_spots]
    });

    L.control.layers(base_maps, overlay_maps, {
        collapsed: false
    }).addTo(earthquake_map);


    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            color_ranges = [-10, 10, 30, 50, 70, 90],
            labels = [];
    
        for (var i = 0; i < color_ranges.length; i++) {
            div.innerHTML +=
                '<i style="background:' + marker_color(color_ranges[i] + 1) + '"></i> ' +
                color_ranges[i] + (color_ranges[i + 1] ? '&ndash;' + color_ranges[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(earthquake_map);

}