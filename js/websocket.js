FLOW.Websocket = function(space) {

    var self = this;
    
    this.receive_to = null;

    this.ws = new WebSocket("ws://localhost:8888/ws"); 
    this.ws.binaryType = "arraybuffer";

    this.ws.onmessage = function(e) {
        self.receive(e, space)
    };

}

FLOW.Websocket.prototype.receive = function(evt, scene) {

    if (typeof(evt.data) === 'string') {

        var header = JSON.parse(evt.data);
        if (header.type === 'new_isosurface') {
            this.receive_to = 'vert';
        }

    } else {

        if (this.receive_to === 'vert') {
            space.vert_array = new Float32Array(evt.data);
            this.receive_to = 'poly';
        } else if (this.receive_to === 'poly') {
            space.poly_array = new Uint32Array(evt.data);
            space.update_surface();
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