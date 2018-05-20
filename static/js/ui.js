function setup_ui() {

    $("#menu").mmenu({
        classes: "mm-custom"
        }, {
            panelNodetype:   "ul, ol"
        });

    $("#menu").trigger("open.mm");
    space.resize();
    var menu_toggle = false;

    var menu_toggle = true;
    $("#menu-button").click(function() {
        console.log('click')
        if (menu_toggle) {
            $("#menu").trigger("open.mm").on("opened.mm", function() {
                space.resize();
            });
            menu_toggle = false;
        } else {
            $("#menu").trigger("close.mm").on("closed.mm", function() {
                space.resize();
            });
            menu_toggle = true;
        }
        space.resize()
    });

    $("#but1").click(function() {
        var request = {};
        request.type = "new isosurface";
        request.thresh = 0.15;
        var json_string = JSON.stringify(request);
        ws_conn.request(json_string);
    });

    $("#slider").noUiSlider({
        start: [0.21],
        range: {
            'min': [0],
            'max': [0.5]
        }
    });

    $("#slider2").noUiSlider({
        start: [.2],
        range: {
            'min': [0.0],
            'max': [0.4]
        }
    });

    $("#slider").Link('lower').to($('#input'));
    $("#slider2").Link('lower').to($('#input2'));

    $('#slider').on('set', function() {
        var request = {};
        request.type = "new isosurface";
        request.thresh = $('#slider').val();
        var json_string = JSON.stringify(request);
        ws_conn.request(json_string);

    });

    $('#slider2').on('set', function() {
        space.surface.update_opacity();
    });

    $('#trans_check').change(function() {
        space.surface.update_opacity();
    });

    editableGrid = new EditableGrid("DemoGridJSON", {

        tableLoaded: function() {

            // renderer for the action column
            this.setCellRenderer("action", new CellRenderer({render: function(cell, value) {
                var rowInd = cell.rowIndex;
                var rowId = editableGrid.getRowId(rowInd);

                var pad = "000";
                var id_num = (pad+rowId.toString()).slice(-pad.length);

                var clicker = "space.planes.test('star', " + rowId + ")";
                var button_im = "<i class=\"fa fa-star\"></i>"
                cell.innerHTML = "<a class=\"star\" id=\"star-" + id_num + "\" href=\"javascript:void(0)\" onclick=\"" + clicker + "\">" + button_im + "</a>";

                var clicker = "space.planes.test('delete', " + rowId + ")";
                var button_im = "<i class=\"fa fa-trash\"></i>"
                cell.innerHTML += "&nbsp;&nbsp;<a class=\"trash\" href=\"javascript:void(0)\" onclick=\"" + clicker + "\">" + button_im + "</a>";

                // This make sure the highlighted star stays highlighted
            }}));

            this.setHeaderRenderer("vis", new CellRenderer({render: function(cell, value) {
                var header_im = "<i class=\"fa fa-eye\"></i>";
                cell.getElementsByTagName("a")[0].innerHTML = header_im;
            }}));

            this.setHeaderRenderer("report", new CellRenderer({render: function(cell, value) {
                var header_im = "<i class=\"fa fa-line-chart\"></i>";
                cell.getElementsByTagName("a")[0].innerHTML = header_im;
            }}));

            // render the grid
            this.renderGrid("tablecontent", "testgrid");
        },

        modelChanged: function(rowIdx, colIdx, oldValue, newValue, row) { space.planes.grid_changed(rowIdx, colIdx, oldValue, newValue, row) }
    });
    editableGrid.loadJSON("grid2.json");

}
