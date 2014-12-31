function setup_ui() {

    $("#menu").mmenu({
        classes: "mm-custom"
    });

    // $("#menu").trigger("open.mm");
    // space.resize();

    var menu_toggle = false;
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
            'max': [1]
        }
    });

    $("#slider2").noUiSlider({
        start: [1.0],
        range: {
            'min': [0],
            'max': [1]
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
        space.surface.update_opacity($('#slider2').val());
    });

}