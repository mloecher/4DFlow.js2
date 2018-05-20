FLOW.Websocket = function(space) {

    var self = this;
    
    this.receive_to = null;
    this.header_store = null;

    this.ws = new WebSocket("ws://localhost:8118/ws"); 
    this.ws.binaryType = "arraybuffer";

    this.ws.onmessage = function(e) {
        self.receive(e, space)
    };

}

FLOW.Websocket.prototype.receive = function(evt, scene) {

    if (typeof(evt.data) === 'string') {

        var header = JSON.parse(evt.data);
        console.log(header)
        if (header.type === 'new_isosurface') {
            this.receive_to = 'vert';
        } else if (header.type === 'new_plane') {
            space.planes.add_plane(header);
        } else if (header.type === 'paths') {
            this.receive_to = 'path';
            this.header_store = header;
        }

    } else {

        if (this.receive_to === 'vert') {
            space.surface.vert_array = new Float32Array(evt.data);
            this.receive_to = 'poly';
        } else if (this.receive_to === 'poly') {
            space.surface.poly_array = new Uint32Array(evt.data);
            space.surface.update_surface();
            space.surface.update_opacity();
            this.receive_to = null;
        } else if (this.receive_to === 'path') {
            space.paths.path_array = new Float32Array(evt.data);
            space.paths.draw_lines(this.header_store.steps);
            this.receive_to = null;
        }

    }
    
}

FLOW.Websocket.prototype.request = function(data) {
    
    var self = this;

    if (this.ws.readyState == 1) {
        console.log("Ready send")
        this.ws.send(data);
    } else {
        console.log("Not ready send")
        this.ws.onopen = function() {
            self.ws.send(data);
        }
    }
    
}