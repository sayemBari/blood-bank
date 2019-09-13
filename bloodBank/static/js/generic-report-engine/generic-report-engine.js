/**
 * Created by Sayem on 29 April, 2019
 * @author Sayem
 */

function InitiateGenericReportEngine() {
}

InitiateGenericReportEngine.prototype = {
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
    prepareDataTable: function (t_data) {
        if ($.fn.DataTable.isDataTable($("#data-table-widget"))) {
            $("#data-table-widget").DataTable().destroy();
        }
        $("#data-table-widget").html(
            "<div><h1>Loading...</h1><div class='alert alert-info' style='text-align: center;'>Please, wait for a moment.</div></div>"
        );

        if (t_data === null || t_data === undefined || t_data.length === 0) {
            $("#data-table-widget").html(
                "<div class='alert alert-info' style='height: 100%; text-align: center;'>No data available. </div>"
            );
        } else {
            let tbody_data = "";
            let tfoot_data = "";
            let body_data = t_data["body"];
            let footer_data = "footer" in t_data ? t_data["footer"] : null;

            if (isArray(body_data)) {
                for (let i = 0; i < body_data.length; i++) {
                    let _each_row_data = '<tr>';
                    for (let j = 0; j < body_data[i].length; j++) {
                        _each_row_data += '<td>' + body_data[i][j] + '</td>';
                    }
                    tbody_data += _each_row_data + '</tr>';
                }
            }
            if (isArray(footer_data)) {
                tfoot_data += '<tr>';
                for (let i = 0; i < footer_data.length; i++) {
                    tfoot_data += '<th>' + footer_data[i] + '</th>';
                }
                tfoot_data += '</tr>';
            }
            let _table_data = '<thead>' + t_data["header"]["header_dom"] + '</thead>' + '<tbody>' + tbody_data + '</tbody>';
            if (footer_data !== null) {
                _table_data += '<tfoot>' + tfoot_data + '</tfoot>';
            }
            $("#data-table-widget").html(_table_data);

            $('#data-table-widget').DataTable({
                lengthChange: false,
                buttons: ['copy', 'excel', 'pdf', 'colvis'],
                scrollX: true,
                scrollY: "400px",
                scrollCollapse: true,
                pageLength: 25,
                paging: true,
                autoWidth: false,
                info: true,
                // order: [0, "asc"],
                aaSorting: [],
                columnDefs: [
                    {
                        // render: $.fn.dataTable.render.number('', '.', 2, ''),
                        targets: [2].concat(Array.from(t_data["header"]["nHeaderCols"]).keys())
                    }
                ]
            });
        }
    },
    prepareGraph: function (g_data) {
        if (g_data) {
            for (let i = 0; i < g_data.length; i++) {
                if (g_data[i]["chartType"] === "column") {
                    new HighchartGraphEngine(i.toString(), g_data[i]).initiateColumnGraph();
                } else if (g_data[i]["chartType"] === "line_column") {
                    new HighchartGraphEngine(i.toString(), g_data[i]).initiateLineColumnGraph();
                }
            }
        } else {
            for (let i = 0; i < $.find(".graph-widget").length; i++) {
                $("#graph_widget_" + i.toString()).html(
                    "<div style='width: 100%; margin: 0 auto; overflow: unset'><h1>No data to display.</h1></div>"
                );
            }
        }
    },
    initiateAjaxRequest: function () {
        var self = this;
        $("#update-report-btn").html("Please wait...Updating Report").css({
            backgroundColor: "#a91c3b"});

        $.ajax({
            url: "?format=json",
            type: "POST",
            data: self.prepareParameters(),
            dataType: "json",
            success: function (result) {
                $("#update-report-btn").html("Update Report").css({
                    backgroundColor: "#00a99d"});
                if ($.find("#data-table-widget").length) {
                    self.prepareDataTable(result["table"]);
                }
                if ($.find(".graph-widget").length) {
                    self.prepareGraph(result["graph"]);
                }
            },
            error: function (result) {
                console.log("Couldn't prepare the report as per data!!! Error: " + result.toString());
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
        let _select2_val_fact = false;
        for (let i = 0; i < select2_ids.length; i++) {
            if ($(select2_ids[i]).val() !== null && $(select2_ids[i]).val() !== "") {
                _select2_val_fact = true;
                continue;
            }
            _select2_val_fact = false;
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

function pickMultipleDate() {
    $(".pick-multiple-date").each(function () {
        $(this).datepicker({
            format: 'dd/mm/yyyy',
            multidate: true,
            closeOnDateSelect: true,
        });
    });
}

function initiateDateRangePicker() {
    $("input[class='date-range-picker']").daterangepicker({
        locale: {format: "DD/MM/YYYY"}
    });
}

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

    var gre_instance = new InitiateGenericReportEngine();
    if ($.find(".add_all").length) {
        $(".add_all").each(function () {
            if ($(this).is(":not(:checked)")) {
                $(this).prop("checked", true).change();
            }
        });
        gre_instance.initiateSelect2Fields();
    } else {
        gre_instance.initiateAjaxRequest();
    }

    $("#update-report-btn").off("click").on("click", function (event) {
        event.stopImmediatePropagation();
        new InitiateGenericReportEngine().initiateAjaxRequest();
    });
});