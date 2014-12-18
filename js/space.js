FLOW.Space = function() {
    this.scene = new THREE.Scene();

    console.log(this.scene)

    this.vert_array = undefined;
    this.poly_array = undefined;

    var container = document.getElementById('content');
    document.body.appendChild(container);

    this.renderer = new THREE.WebGLRenderer({
        antialias: true, // to get smoother output
    });
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera( 30, container.offsetWidth / container.offsetHeight, 0.1, 10000 );
    this.camera.position.set(600, 0, 0);
    this.camera.lookAt(this.scene.position);
    this.camera.rotation.x = -90 * Math.PI / 180;

    var light = new THREE.AmbientLight(0x555555);
    this.scene.add(light);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.x = 100;
    directionalLight.position.y = -50;
    directionalLight.position.z = -50;
    this.scene.add(directionalLight);

    this.all_objects = new THREE.Object3D();

    this.controls = new FLOW.Controls(this.all_objects, this.camera);

    this.scene.add(this.all_objects)
}

FLOW.Space.prototype.render = function() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
}

FLOW.Space.prototype.update_surface = function() {
    if (this.all_objects.children[2]) {
        this.all_objects.children[2].geometry.dispose();
        this.all_objects.children[2].material.dispose();
        this.all_objects.remove(this.all_objects.children[2]);
    }

    var surface_material = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0x999999,
        ambient: 0x999999,
        // transparent: true,
        // opacity: 0.9,
        // depthWrite: true,
    });

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

    var mesh = new THREE.Mesh(geo, surface_material);

    this.all_objects.add(mesh);
}