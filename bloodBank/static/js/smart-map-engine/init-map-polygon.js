/**
 * Created by Sayem on 21 May, 2019
 * @author Sayem
 */

function message(message) {
    let notification = new NotificationFx({
        message: message,
        layout: 'growl',
        effect: 'slide',
        type: 'notice', // notice, warning or error
        ttl: 6000,
        onClose: function () {
        }
    });
    // show the notification
    notification.show();
}

$(function () {
    let gmp = new GenerateMapPolygons(plotWiseCoords);
    if (plotWiseCoords) {
        gmp.constructPlotWisePolygon();
    } else {
        $("#map-canvas").html(
            "<div style='width: 100%; margin: 0 auto; overflow: unset'><h1>Map could not be loaded. Plot data missing!!!</h1></div>"
        );
    }

    $("#update-map").off("click").on("click", function (event) {
        let updateMapBtn = this;
        event.stopImmediatePropagation();
        let _changedPlotWiseLocations = gmp._changedPlotWiseCoords;
        if (Object.keys(_changedPlotWiseLocations).length > 0) {
            $(updateMapBtn).html("Updating ...");
            $.ajax({
                url: '/api/plot-mapping/',
                type: 'POST',
                data: {"data":JSON.stringify(_changedPlotWiseLocations)},
                dataType: 'json',
                success: function (result) {
                    $(updateMapBtn).html("Update Map");
                    message(result.message);
                    gmp._changedPlotWiseCoords = {};
                },
                error: function (error) {
                    $(updateMapBtn).html("Update Map");
                    message(error.message);
                    gmp._changedPlotWiseCoords = {};
                }
            });
        }
    });
});