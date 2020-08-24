/**
 * Created by Sayem on 21 May, 2019
 * @author Sayem
 */

function GenerateMapPolygons(coords) {
    // required private variables
    this._changedPlotWiseCoords = {};
    this._plotWiseCoords = coords ? JSON.parse(coords.replace(/&quot;/g, '"')) : null;
}

GenerateMapPolygons.prototype = {
    calculatePolygonCenter: function (polygons) {
        let lats = [];
        let lngs = [];
        var vertices;
        for (let idx = 0; idx < polygons.length; idx++) {
            vertices = polygons[idx].getPath();

            // put all latitudes and longitudes in arrays
            for (let i = 0; i < vertices.length; i++) {
                lngs.push(vertices.getAt(i).lng());
                lats.push(vertices.getAt(i).lat());
            }
        }

        // sort the arrays low to high/by ascending order
        lats.sort();
        lngs.sort();

        // get the min and max of each
        let lowX = lats[0];
        let highX = lats[lats.length - 1];
        let lowY = lngs[0];
        let highY = lngs[lngs.length - 1];

        // center of the polygon is the starting point plus the midpoint
        let cLat = lowX + ((highX - lowX) / 2);
        let cLng = lowY + ((highY - lowY) / 2);
        return {
            centerLat: parseFloat(cLat.toFixed(6)),
            centerLng: parseFloat(cLng.toFixed(6))
        };
    },
    calculateZoomLevel: function (polygons) {
        let bounds = new google.maps.LatLngBounds();
        var path;
        for (let idx = 0; idx < polygons.length; idx++) {
            path = polygons[idx].getPath();
            for (let i = 0; i < path.length; i++) {
                bounds.extend(path.getAt(i));
            }
        }
        return bounds;
    },
    getChangedPlotWisePolygonCoords: function (e, polygon) {
        var _changedCoord;
        this._changedPlotWiseCoords[polygon.plotTsyncId] = [];
        for (let i = 0; i < polygon.getPath().length; i++) {
            _changedCoord = polygon.getPath().getAt(i).toUrlValue(6).split(",");
            this._changedPlotWiseCoords[polygon.plotTsyncId].push({
                "latitude": parseFloat(_changedCoord[0]),
                "longitude": parseFloat(_changedCoord[1])
            });
        }
    },
    initiateMap: function (center) {
        return new google.maps.Map($("#map-canvas")[0], {
            center: {
                lat: center ? center.centerLat : parseFloat(centerLat),
                lng: center ? center.centerLng : parseFloat(centerLng)
            },
            // scaleControl: true,
            // fullscreenControl: true
        });
    },
    setContentInfoWindow: function (e, infoWindow, polygon) {
        infoWindow.setContent(
            "<div>" + "<span style='font-weight: bold;'>Plot Name:</span>" + " " + polygon.plotName + "</div>"
        );
        infoWindow.setPosition(e.latLng);
    },
    constructPlotWisePolygon: function () {
        if (this._plotWiseCoords) {
            let _polygonInstances = [];

            for (let plotTsyncId in this._plotWiseCoords) {
                // Construct each plot wise polygon.
                _polygonInstances.push(
                    new google.maps.Polygon({
                        paths: this._plotWiseCoords[plotTsyncId]["coords"],
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#FF0000",
                        fillOpacity: 0.35,
                        draggable: false,
                        editable: true,
                        plotTsyncId: plotTsyncId,
                        plotName: this._plotWiseCoords[plotTsyncId]["name"]
                    })
                );
            }

            let ct = this.calculatePolygonCenter(_polygonInstances);
            let _zoom_level = this.calculateZoomLevel(_polygonInstances);
            let map = this.initiateMap(ct);

            map.fitBounds(_zoom_level);

            let infoWindow = new google.maps.InfoWindow({
                size: new google.maps.Size(150, 50)
            });

            for (let idx = 0; idx < _polygonInstances.length; idx++) {
                var self = this;
                google.maps.event.addListener(_polygonInstances[idx].getPath(), "set_at", function (e) {
                    self.getChangedPlotWisePolygonCoords(e, _polygonInstances[idx]);
                });
                google.maps.event.addListener(_polygonInstances[idx].getPath(), "insert_at", function (e) {
                    self.getChangedPlotWisePolygonCoords(e, _polygonInstances[idx]);
                });
                google.maps.event.addListener(_polygonInstances[idx], 'mouseover', function (e) {
                    infoWindow.close();
                    self.setContentInfoWindow(e, infoWindow, _polygonInstances[idx]);
                    infoWindow.open(map);
                });
                google.maps.event.addListener(_polygonInstances[idx], 'mouseout', function (e) {
                    infoWindow.close();
                });
            }

            for (let idx = 0; idx < _polygonInstances.length; idx++) {
                _polygonInstances[idx].setMap(map);
            }
        }
    }
};