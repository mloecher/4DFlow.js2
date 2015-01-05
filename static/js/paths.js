FLOW.Paths = function() {
    this.path_array = undefined;

    this.all_objects = new THREE.Object3D();
    this.all_objects.name = "all paths";
};

FLOW.Paths.prototype.draw_lines = function(n_steps) {

    var material = new THREE.LineBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: .5,
    });

    n_lines = this.path_array.length/3/n_steps;
    var offset = 0;
    for (var j = 0; j < n_lines; j += 1) {
        offset = j*3*n_steps
        var vertices = [];
        for (var i = 0; i < 3*n_steps; i += 3) {
            var v = new THREE.Vector3(this.path_array[offset+i], this.path_array[offset+i + 1], this.path_array[offset+i + 2]);
            vertices.push(v);
        }
        var geo = new THREE.Geometry();
        geo.vertices = vertices;
        var line = new THREE.Line(geo, material);
        this.all_objects.add(line);
    }

    

    


}