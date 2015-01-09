FLOW.Planes = function() {
    this.plane_id = 1;

    this.all_objects = new THREE.Object3D();
    this.all_objects.name = "all paths";
};

FLOW.Planes.prototype.add_plane = function(request) {
    var geometry = new THREE.PlaneGeometry( 20, 20);
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );

    plane.applyMatrix(new THREE.Matrix4().makeRotationX(request.rx));
    plane.applyMatrix(new THREE.Matrix4().makeRotationZ(request.rz));
    plane.applyMatrix(new THREE.Matrix4().makeTranslation(request.cpos[0], request.cpos[1], request.cpos[2]));
    
    var pad = "000";
    var id_num = (pad+this.plane_id.toString()).slice(-pad.length);

    var values = {};
    values['id_num'] = id_num;
    values['name'] = 'CutPlane ' + id_num;
    values['vis'] = true;
    values['report'] = true;

    editableGrid.insertAfter(editableGrid.getRowCount(), this.plane_id, values); 

    console.log(values)

    this.all_objects.add( plane );
    plane.name = id_num;

    this.plane_id++;
};

FLOW.Planes.prototype.grid_changed = function(rowIdx, colIdx, oldValue, newValue, row) {

    var id_num = row.cells[0].innerText;

    // console.log(this.all_objects.getObjectByName(id_num))

    if (colIdx === 2) {
        this.all_objects.getObjectByName(id_num).visible = newValue;
    }
    

    // console.log(rowIdx)
    // console.log(colIdx)
    // console.log(oldValue)
    // console.log(newValue)
    // console.log(row)
    // console.log(row.cells[0].innerText)

}

FLOW.Planes.prototype.test = function(val) {

    console.log('hey there planes test')
    console.log(val)

}