FLOW.Space = function() {
    var self = this;

    this.scene = new THREE.Scene();

    this.container = document.getElementById('content');
    document.body.appendChild(this.container);

    this.renderer = new THREE.WebGLRenderer({
        antialias: true, // to get smoother output
    });
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.setClearColor(0x111111, 1);
    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera( 30, this.container.offsetWidth / this.container.offsetHeight, 0.1, 5000 );
    this.camera.position.set(600, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    this.camera.rotation.x = -90 * Math.PI / 180;

    // Lights
    var light = new THREE.AmbientLight(0x555555);
    this.scene.add(light);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.x = 100;
    directionalLight.position.y = -50;
    directionalLight.position.z = -50;
    this.scene.add(directionalLight);

    // Global containter, this is what we control with the mouse
    this.all_objects = new THREE.Object3D();
    this.surface = new FLOW.Surface();
    this.all_objects.add(this.surface.all_objects);
    this.planes = new FLOW.Planes();
    

    // Add mouse controls
    this.controls = new FLOW.Controls(this.all_objects, this.camera, this.renderer.domElement);


    this.scene.add(this.all_objects);

    this.resize();
    window.addEventListener('resize', function(){self.resize();}, false);
};

FLOW.Space.prototype.resize = function() {

    var width = this.container.offsetWidth;
    var height = window.innerHeight;

    if ($('#menu').hasClass('mm-opened')) {
        width = width-340;
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    this.width = width;
    this.height = height;
};

FLOW.Space.prototype.render = function() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
};

FLOW.Space.prototype.add_plane = function(request) {
    var geometry = new THREE.PlaneGeometry( 20, 20);
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    
    // plane.rotation.x = request.rx
    // plane.rotation.z = request.rz

    plane.applyMatrix(new THREE.Matrix4().makeRotationX(request.rx));
    plane.applyMatrix(new THREE.Matrix4().makeRotationZ(request.rz));
    // rot_axis = new THREE.Vector3(request.rot_axis[0],request.rot_axis[1],request.rot_axis[2]);
    // plane.applyMatrix(new THREE.Matrix4().makeRotationAxis(rot_axis, request.rot_angle));

    // // This should be replaced with centering on the python side
    // var scale = -3.5;
    // var xpos = request.pos[0] + scale*request.norm[0];
    // var ypos = request.pos[1] + scale*request.norm[1];
    // var zpos = request.pos[2] + scale*request.norm[2];
    plane.applyMatrix(new THREE.Matrix4().makeTranslation(request.cpos[0], request.cpos[1], request.cpos[2]));
    
    console.log(plane)
    
    this.all_objects.add( plane );
;
}