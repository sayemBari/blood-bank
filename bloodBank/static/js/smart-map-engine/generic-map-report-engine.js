/**
 * Created by Sayem on 09 July, 2019
 * @author Sayem
 */

function InitiateGenericMapReportEngine() {
    this.markers = [];
    this.bounds = new google.maps.LatLngBounds();
    this.mapCenter = {};
}

InitiateGenericMapReportEngine.prototype = {
    calculateMapCenter: function (lats, lngs) {
        // sort the arrays low to high/by ascending order
        var self = this;
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
        self.mapCenter = {
            lat: parseFloat(cLat.toFixed(6)),
            lng: parseFloat(cLng.toFixed(6))
        };
    },
    initiateMap: function () {
        var self = this;
        let $mapCanvas = $("#map-canvas");
        return new google.maps.Map($mapCanvas[0], {
            zoomControl: true,
            center: Object.keys(self.mapCenter).length ? self.mapCenter : {lat: 1.3733, lng: 32.2903}
        });
    },
    prepareContentInfoWindowDOM: function (data_info) {
        var self = this;
        let listItemOpeningTag = '<li style="list-style-type: none">';
        let listItemClosingTag = '</li>';
        let _color = "#" + data_info["marker_color"].toString();
        let infoHtml = '<div style="color: ' + _color + ';">';
        for (let key in data_info) {
            if (key === "location" || key === "marker_color") {
                continue;
            }
            infoHtml += '<strong>' + key + ': ' + '</strong>' + data_info[key] + '<br/>';
        }
        infoHtml += '</div><br/>';
        return listItemOpeningTag + infoHtml + listItemClosingTag;
    },
    createMarkerPinSVG: function (marker_color) {
        let markerColor = "#" + marker_color;
        return '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="29.999998" height="45.34824" style="width:25px;height:35px;" viewBox="0 0 29.999998 45.34824" xml:space="preserve"><metadata id="metadata41"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs id="defs39" /> <g transform="matrix(0.09719243,0,0,0.09719243,-7.6741234,0)" style="fill:' + markerColor + '; fill-opacity:1"><path d="m 233.292,0 c -85.1,0 -154.334,69.234 -154.334,154.333 0,34.275 21.887,90.155 66.908,170.834 31.846,57.063 63.168,104.643 64.484,106.64 l 22.942,34.775 22.941,-34.774 c 1.317,-1.998 32.641,-49.577 64.483,-106.64 45.023,-80.68 66.908,-136.559 66.908,-170.834 C 387.625,69.234 318.391,0 233.292,0 z m 0,233.291 c -44.182,0 -80,-35.817 -80,-80 0,-44.183 35.818,-80 80,-80 44.182,0 80,35.817 80,80 0,44.183 -35.819,80 -80,80 z" /></g></svg>';
    },
    createMarkerForPoint: function (data_info) {
        return new google.maps.Marker({
            position: new google.maps.LatLng(
                parseFloat(data_info["location"]["latitude"]).toFixed(6),
                parseFloat(data_info["location"]["longitude"]).toFixed(6)
            ),
            icon: {
                path: "m 233.292,0 c -85.1,0 -154.334,69.234 -154.334,154.333 0,34.275 21.887,90.155 66.908,170.834 31.846,57.063 63.168,104.643 64.484,106.64 l 22.942,34.775 22.941,-34.774 c 1.317,-1.998 32.641,-49.577 64.483,-106.64 45.023,-80.68 66.908,-136.559 66.908,-170.834 C 387.625,69.234 318.391,0 233.292,0 z m 0,233.291 c -44.182,0 -80,-35.817 -80,-80 0,-44.183 35.818,-80 80,-80 44.182,0 80,35.817 80,80 0,44.183 -35.819,80 -80,80 z",
                fillColor: "#" + data_info["marker_color"],
                fillOpacity: 1,
                scaledSize: new google.maps.Size(20, 30),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(12, 12),
                scale: .07
            },
            infoWindowContent: this.prepareContentInfoWindowDOM(data_info)
            // icon: {
            //     url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=0|" + marker_color
            // }
        });
    },
    createBoundsForMarkers: function () {
        var self = this;
        for (let idx = 0; idx < self.markers.length; idx++) {
            self.bounds.extend(self.markers[idx].getPosition());
        }
    },
    serializeListValues: function (val) {
        if (val !== undefined && val !== '') {
            return $.makeArray(val).join(',');
        }
        return val;
    },
    prepareParameters: function () {
        var self = this;
        let _field_labels = [];
        let _params = {};
        let _form_group = $(".form-group");
        for (let i = 0; i < _form_group.length; i++) {
            _field_labels.push($(_form_group[i]).find("label").attr("for"));
        }
        for (let i = 0; i < _field_labels.length; i++) {
            let _param_elem_val = $("#id_" + _field_labels[i]).val();
            _params[_field_labels[i]] = _param_elem_val !== null || _param_elem_val !== undefined || _param_elem_val !== "" ? self.serializeListValues(_param_elem_val) : null;
        }
        return _params;
    },
    prepareMarkerLegends: function (map_instance, legend_item) {
        var self = this;
        let _table_html = ``;
        for (let idx = 0; idx < legend_item.length; idx++) {
            _table_html += `<tr><td>` + self.createMarkerPinSVG(legend_item[idx]["color"]) + `</td><td style="padding-left: 5px;"><strong>` + legend_item[idx]["name"] + `</strong></td></tr>`;
        }
        let _legend_html = `<div id="legend" style="max-height: 250px; overflow-y: auto; opacity: 0.8; padding: 10px; margin: 10px; border: 2px solid #000;"><table style=" font-size: small; font-family: Roboto;"><tbody>` + _table_html + `</tbody></table></div>`;
        map_instance.controls[google.maps.ControlPosition.RIGHT_TOP].push($(_legend_html)[0]);
    },
    prepareMarkerClusterIconInlineSVG: function (color) {
        let encoded = window.btoa(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-100 -100 200 200"><defs><g id="a" transform="rotate(45)"><path d="M0 47A47 47 0 0 0 47 0L62 0A62 62 0 0 1 0 62Z" fill-opacity="0.7"/><path d="M0 67A67 67 0 0 0 67 0L81 0A81 81 0 0 1 0 81Z" fill-opacity="0.5"/><path d="M0 86A86 86 0 0 0 86 0L100 0A100 100 0 0 1 0 100Z" fill-opacity="0.3"/></g></defs><g fill="` + color + `"><circle r="42"/><use xlink:href="#a"/><g transform="rotate(120)"><use xlink:href="#a"/></g><g transform="rotate(240)"><use xlink:href="#a"/></g></g></svg>`);
        return 'data:image/svg+xml;base64,' + encoded;
    },
    prepareMarkerClusters: function (map_instance, markers) {
        return new MarkerClusterer(map_instance, markers, {
            styles: [
                {
                    url: this.prepareMarkerClusterIconInlineSVG("blue"),
                    height: 72,
                    width: 72,
                    textColor: '#ffffff',
                    textSize: 14
                }
            ],
            gridSize: 60,
            minimumClusterSize: 2
        });
    },
    prepareClusteredInfoWindow: function (cluster, mapInstance) {
        let clusterInfoWindowText = "";
        for (let idx = 0; idx < cluster.getMarkers().length; idx++) {
            clusterInfoWindowText += cluster.getMarkers()[idx].infoWindowContent;
        }
        let prevZoom = cluster.getMarkerClusterer().prevZoom_;
        if (cluster.getMarkerClusterer().isZoomOnClick()) {
            mapInstance.fitBounds(cluster.getBounds());
        }
        let currentZoom = cluster.getMarkerClusterer().prevZoom_;
        if (prevZoom === currentZoom) {
            let infowindow = new google.maps.InfoWindow({
                content: clusterInfoWindowText
            });
            infowindow.close();
            infowindow.setPosition(cluster.getCenter());
            infowindow.open(mapInstance);
        }
    },
    prepareMapReport: function (map_data, legend_items) {
        var self = this;
        let $mapReportWidget = $("#map-canvas");
        $mapReportWidget.html(
            "<div><h1>Loading...</h1><div class='alert alert-info' style='text-align: center;'>Please, wait for a moment.</div></div>"
        );

        if (map_data === null || map_data === undefined || map_data.length === 0) {
            self.initiateMap().setZoom(7);
            $("#totalItems").html(`<strong style="font-size: small;">Total items found: </strong>` + `<strong style="font-size: small;">0</strong>`);
        } else {
            let lats = [];
            let lngs = [];
            map_data.map(function (eachData) {
                self.markers.push(self.createMarkerForPoint(eachData));
                lats.push(eachData["location"]["latitude"]);
                lngs.push(eachData["location"]["longitude"]);
            });

            self.createBoundsForMarkers();
            self.calculateMapCenter(lats, lngs);
            let mapInstance = self.initiateMap();
            $("#totalItems").html(`<strong style="font-size: small;">Total items found: </strong><strong style="font-size: small;">` + map_data.length + `</strong>`);
            mapInstance.fitBounds(self.bounds);

            //remove one zoom level to ensure no marker is on the edge.
            mapInstance.setZoom(mapInstance.getZoom() - 1);

            // set a minimum zoom
            // if you got only 1 marker or all markers are on the same address map will be zoomed too much.
            if (mapInstance.getZoom() > 15) {
                mapInstance.setZoom(15);
            }
            self.markers.map(function (eachMarkerInstance) {
                eachMarkerInstance.setMap(mapInstance);
                eachMarkerInstance.addListener("click", function () {
                    new google.maps.InfoWindow({
                        content: this.infoWindowContent
                    }).open(mapInstance, this);
                });
            });

            self.prepareMarkerLegends(mapInstance, legend_items);
            let markerClusters = self.prepareMarkerClusters(mapInstance, self.markers);
            google.maps.event.addListener(markerClusters, "clusterclick", function (cluster) {
                self.prepareClusteredInfoWindow(cluster, mapInstance);
            });
        }
    },
    initiateAjaxRequest: function () {
        var self = this;
        $(".load-map-button").html("Please wait...Updating Report").css({
            backgroundColor: "#a91c3b"
        });

        $.ajax({
            url: "?format=json",
            type: "POST",
            data: self.prepareParameters(),
            dataType: "json",
            success: function (result) {
                $(".load-map-button").html("Update Map").css({
                    backgroundColor: "#00a99d"
                });
                if ($.find("#map-canvas").length) {
                    self.prepareMapReport(result["map_data"], result["legend_items"]);
                }
            },
            error: function (result) {
                console.log("Couldn't prepare the map report!!! Error: " + result.toString());
            }
        });

    },
    initiateSelect2Fields: function () {
        var self = this;
        let _add_all_select2s = $(".add_all").parent().parent().select();
        let select2_ids = [];
        for (let i = 0; i < _add_all_select2s.length; i++) {
            select2_ids.push("#id_" + $(_add_all_select2s[i]).find("label").attr("for"));
        }
        let _select2_val_fact = true;
        for (let i = 0; i < select2_ids.length; i++) {

            if ($(select2_ids[i]).val() !== null && $(select2_ids[i]).val() !== "") {
                continue;
            }
            _select2_val_fact &= false;
        }
        if (_select2_val_fact) {
            self.initiateAjaxRequest();
        } else {
            setTimeout(function () {
                self.initiateSelect2Fields();
            }, 2000);
        }
    }
};
$(function () {
    $(".datetimepicker").each(function () {
        initializeDateTimePicker($(this));
    });
    if ($.find(".pick-multiple-date").length) {
        pickMultipleDate();
    }
    if ($.find(".date-range-picker").length) {
        initiateDateRangePicker();
    }
    loadBWSelect2Fields();

    var gmre_instance = new InitiateGenericMapReportEngine();
    gmre_instance.initiateMap().setZoom(7);
    $("#totalItems").html(`<strong style="font-size: small;">Total items found: </strong>` + `<strong style="font-size: small;">0</strong>`);
    if ($.find(".add_all").length) {
        $(".add_all").each(function () {
            if ($(this).is(":not(:checked)") && $(this).is(":visible")) {
                $(this).prop("checked", true).change();
            }
        });
        gmre_instance.initiateSelect2Fields();
    } else {
        gmre_instance.initiateAjaxRequest();
    }

    $(".load-map-button").off("click").on("click", function (event) {
        event.stopImmediatePropagation();
        new InitiateGenericMapReportEngine().initiateAjaxRequest();
    });
});