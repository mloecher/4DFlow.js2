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
    this.all_objects.add(this.planes.all_objects);

    this.paths = new FLOW.Paths();
    this.all_objects.add(this.paths.all_objects);
    

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

