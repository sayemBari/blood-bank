/**
 * Created by Sayem on 12 June, 2019
 * @author Sayem
 */


function HighchartGraphEngine(graph_widget_id, graph_data) {
    this._graphData = graph_data;
    this._graphWidgetNodeId = graph_widget_id;
}

HighchartGraphEngine.prototype = {
    initiateColumnGraph: function () {
        Highcharts.chart("graph_widget_" + this._graphWidgetNodeId, {
            chart: {
                type: "column"
            },
            title: this._graphData["title"],
            xAxis: this._graphData["xAxis"],
            yAxis: this._graphData["yAxis"],
            tooltip: this._graphData["tooltip"],
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        color: "black"
                    }
                }
            },
            series: this._graphData["series"],
            boost: {
                useGPUTranslations: true
            },
            credits: {
                enabled: false
            }
        });
    },
    initiateLineColumnGraph: function () {
        Highcharts.chart("graph_widget_" + this._graphWidgetNodeId, {
            chart: {
                zoomType: "xy"
            },
            title: this._graphData["title"],
            xAxis: this._graphData["xAxis"],
            yAxis: this._graphData["yAxis"],
            tooltip: this._graphData["tooltip"],
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        color: "black"
                    }
                }
            },
            series: this._graphData["series"],
            boost: {
                useGPUTranslations: true
            },
            credits: {
                enabled: false
            }
        });
    }
};