FLOW.Controls = function(object, camera, domElement) {
    this.domElement = (domElement !== undefined) ? domElement : document;

    is_mouse_down = false;
    mouse_button = -1;
    mouse_state = -1;

    this.object = object;
    this.camera = camera;

    cam_zoom0 = camera.position.x;
    zoom_ratio = 1.0;

    zoom_del = 0;
    rotx = 0;
    roty = 0;

    mouse_move_r0 = new THREE.Vector2();
    mouse_move_r1 = new THREE.Vector2();
    mouse_move_dr = new THREE.Vector2();

    mouse_pan_r0 = new THREE.Vector2();
    mouse_pan_r1 = new THREE.Vector2();
    mouse_pan_dr = new THREE.Vector2();

    mouse_rot_r0 = new THREE.Vector2();
    mouse_rot_r1 = new THREE.Vector2();
    mouse_rot_dr = new THREE.Vector2();

    function mousewheel(event) {
        event.preventDefault();
        event.stopPropagation();

        var delta = 0;

        delta = event.deltaY;

        // Different browsers report lines or pixels
        if (event.deltaMode === 0) {
            delta /= 40; // Assuming 40 pixels per line
        }

        zoom_del += delta * zoom_ratio;
    }

    function mousedown(event) {

        event.preventDefault();
        event.stopPropagation();

        is_mouse_down = true;
        mouse_button = event.button;
        mouse_state = mouse_button;
        if (mouse_button === 0 && event.shiftKey) {
            mouse_state = 1; // pretend its the mouse
        } else if (mouse_button === 0 && event.ctrlKey) {
            mouse_state = 10;
        }

        if (mouse_state === 0) {
            mouse_move_r0.x = event.clientX;
            mouse_move_r0.y = event.clientY;
        } else if (mouse_state === 1) {
            mouse_pan_r0.x = event.clientX;
            mouse_pan_r0.y = event.clientY;
        } else if (mouse_state === 2) {
            var objects = [];
            var raycaster = new THREE.Raycaster();
            var vector = new THREE.Vector3();
            vector.set(((event.clientX - (window.innerWidth - space.width)) / space.width) * 2 - 1, -(event.clientY / space.height) * 2 + 1, 0.5);
            vector.unproject(camera);
            raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());

            objects.push(object.getObjectByName('surface'));
            var intersects = raycaster.intersectObjects(objects);

            console.log(intersects);
                // var particleMaterial = new THREE.SpriteMaterial( {

            //         color: 0xff0000,

            //     } );
            if (intersects.length > 0) {
                // console.log(intersects[0])
                // var particle = new THREE.Sprite( particleMaterial );
                // particle.position.copy( intersects[ 0 ].point );
                // particle.scale.x = particle.scale.y = 16;
                var undo = new THREE.Matrix4();
                undo.getInverse(object.matrixWorld);
                    // particle.position.applyMatrix4(undo)
                    // object.add( particle );
                var request = {};

                intersects[0].point.applyMatrix4(undo);
                    // console.log(undo.elements)
                    // var undo2 = new THREE.Matrix4()
                    // undo2.extractRotation(undo)
                    // console.log(undo2.elements)
                    // intersects[0].face.normal.applyMatrix4(undo2)

                var dir = intersects[0].face.normal;
                var origin = intersects[0].point;
                var length = 4;
                var hex = 0xff00ff;

                var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, 1.5, 1.5);
                object.add(arrowHelper);

                request.type = "plane point";
                request.pos = [intersects[0].point.x, intersects[0].point.y, intersects[0].point.z];
                request.norm = [intersects[0].face.normal.x, intersects[0].face.normal.y, intersects[0].face.normal.z];
                
                var pad = "000";
                var id_num = (pad+space.planes.plane_id.toString()).slice(-pad.length);

                console.log('id_num for new plane: ' + id_num);

                request.id_num = id_num;

                var json_string = JSON.stringify(request);
                ws_conn.request(json_string);

                request.type = "paths_from_plane";
                request.id_num = id_num;

                var json_string = JSON.stringify(request);
                ws_conn.request(json_string);
            }


        } else if (mouse_state === 10) {
            mouse_rot_r0.x = event.clientX;
            mouse_rot_r0.y = event.clientY;
        }

    }

    function mousemove(event) {

        event.preventDefault();
        event.stopPropagation();
        if (is_mouse_down) {
            if (mouse_state === 0) {
                mouse_move_dr.x = mouse_move_r0.x - event.clientX;
                mouse_move_dr.y = mouse_move_r0.y - event.clientY;
            } else if (mouse_state == 1) {
                mouse_pan_dr.x = mouse_pan_r0.x - event.clientX;
                mouse_pan_dr.y = mouse_pan_r0.y - event.clientY;
            } else if (mouse_state == 10) {
                mouse_rot_dr.x = mouse_rot_r0.x - event.clientX;
                mouse_rot_dr.y = mouse_rot_r0.y - event.clientY;
            }
        }
    }

    function mouseup(event) {

        event.preventDefault();
        event.stopPropagation();

        if (mouse_state === 0) {
            mouse_move_r1.x += mouse_move_dr.x;
            mouse_move_r1.y += mouse_move_dr.y;

            mouse_move_dr.x = 0;
            mouse_move_dr.y = 0;
        } else if (mouse_state == 1) {
            mouse_pan_r1.x += mouse_pan_dr.x;
            mouse_pan_r1.y += mouse_pan_dr.y;

            mouse_pan_dr.x = 0;
            mouse_pan_dr.y = 0;
        } else if (mouse_state == 10) {
            mouse_rot_r1.x += mouse_rot_dr.x;
            mouse_rot_r1.y += mouse_rot_dr.y;

            mouse_rot_dr.x = 0;
            mouse_rot_dr.y = 0;
        }

        mouse_button = -1;
        mouse_state = -1;


        is_mouse_down = false;
    }

    this.update = function() {

        this.camera.position.x = cam_zoom0 + zoom_del * 10;

        if (this.camera.position.x < 15) {
            this.camera.position.x = 16;
        }

        zoom_ratio = this.camera.position.x / cam_zoom0;

        this.object.rotation.z = (mouse_move_dr.x + mouse_move_r1.x) * 0.003;
        this.object.rotation.y = (mouse_move_dr.y + mouse_move_r1.y) * 0.003;

        this.object.position.y = (mouse_pan_dr.x + mouse_pan_r1.x) * 0.25 * zoom_ratio;
        this.object.position.z = -(mouse_pan_dr.y + mouse_pan_r1.y) * 0.25 * zoom_ratio;

        this.object.rotation.x = (mouse_rot_dr.x + mouse_rot_r1.x) * 0.003;


    };

    this.domElement.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    }, false);

    this.domElement.addEventListener('mousedown', mousedown, false);
    this.domElement.addEventListener('mousemove', mousemove, false);
    this.domElement.addEventListener('mouseup', mouseup, false);

    this.domElement.addEventListener('wheel', mousewheel, false);
    // this.domElement.addEventListener('DOMMouseScroll', mousewheel, false);
};