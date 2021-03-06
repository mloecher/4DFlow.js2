FLOW.Surface = function() {
    // This will move to a surface object
    this.vert_array = undefined;
    this.poly_array = undefined;

    this.all_objects = new THREE.Object3D();
    this.all_objects.name = "all surfaces";
};

FLOW.Surface.prototype.update_surface = function() {
    var old_mesh = this.all_objects.getObjectByName("surface");
    if (old_mesh) {
        console.log("free");
        old_mesh.geometry.dispose();
        old_mesh.material.dispose();
        this.all_objects.remove(old_mesh);
    }
    old_mesh = null;

    var vertices = [];
    var faces = [];

    for (var i = 0; i < this.vert_array.length; i += 3) {
        var v = new THREE.Vector3(this.vert_array[i], this.vert_array[i + 1], this.vert_array[i + 2]);
        vertices.push(v);
    }

    for (var i = 0; i < this.poly_array.length; i += 3) {
        var f = new THREE.Face3(this.poly_array[i], this.poly_array[i + 1], this.poly_array[i + 2]);
        faces.push(f);
    }

    var geo = new THREE.Geometry();
    geo.faces = faces;
    geo.vertices = vertices;

    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    geo.computeFaceNormals();
    geo.computeVertexNormals();

    // TODO: Add check for transparency checkbox
    var surface_material = new THREE.MeshLambertMaterial({
        // side: THREE.FrontSide,
        side: THREE.DoubleSide,
        color: 0xBBBBBB,
        ambient: 0xBBBBBB,
        transparent: true,
        // blending: THREE.NoBlending,
        opacity: 1.0,
        depthTest: true,
        depthWrite: true,
    });

    var mesh = new THREE.Mesh(geo, surface_material);
    mesh.name = 'surface';

    this.all_objects.add(mesh);
};

FLOW.Surface.prototype.update_opacity = function() {

    var mesh = this.all_objects.getObjectByName("surface");

    if ($('#trans_check').prop('checked')) {
        mesh.material.opacity = $('#slider2').val();
        // mesh.material.depthTest = false;
        mesh.material.depthWrite = false;
    } else {
        mesh.material.opacity = 1.0;
        // mesh.material.depthTest = true;
        mesh.material.depthWrite = true;
    }


    console.log(mesh.material);
};
