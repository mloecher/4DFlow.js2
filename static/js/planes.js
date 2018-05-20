FLOW.Planes = function() {
    this.plane_id = 1;
    this.starred = null;

    this.all_objects = new THREE.Object3D();
    this.all_objects.name = "all paths";
};

FLOW.Planes.prototype.add_plane = function(request) {
    var geometry = new THREE.PlaneGeometry( 20, 20);


    var dummyRGBA = new Uint8Array(4 * 4 * 4);
    for(var i=0; i< 4 * 4; i++){
      // RGB from 0 to 255
      dummyRGBA[4*i] = dummyRGBA[4*i + 1] = dummyRGBA[4*i + 2] = 255*i/(4*4);
      // OPACITY
      dummyRGBA[4*i + 3] = 255;
    }

    dummyDataTex = new THREE.DataTexture( dummyRGBA, 4, 4, THREE.RGBAFormat );
    dummyDataTex.needsUpdate = true;

    //var material = new THREE.MeshBasicMaterial( {map: dummyDataTex, side: THREE.DoubleSide} );

    var material = new THREE.MeshBasicMaterial({color: 0xffc107, side: THREE.DoubleSide});

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

    plane.name = id_num;
    this.all_objects.add( plane );


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

FLOW.Planes.prototype.test = function(key, val) {
    console.log(key)
    console.log(val)

    var pad = "000";
    var id_num = (pad+val.toString()).slice(-pad.length);

    if (key === 'delete') {
        editableGrid.remove(editableGrid.getRowIndex(val));
        // console.log(editableGrid)
        // editableGrid.renderCharts();

        var to_delete = this.all_objects.getObjectByName(id_num);
        if (to_delete) {
            console.log("free");
            to_delete.geometry.dispose();
            to_delete.material.dispose();
            this.all_objects.remove(to_delete);
        }
        to_delete = null;

    } else if (key === 'star') {
        if (this.starred) {
            if (this.starred === id_num) {
                $("#star-" + this.starred).attr('class', 'star');
                this.all_objects.getObjectByName(this.starred).material.color = new THREE.Color( 0xffff00 );
                this.starred = null;
            } else {
                $("#star-" + this.starred).attr('class', 'star');
                this.all_objects.getObjectByName(this.starred).material.color = new THREE.Color( 0xffff00 );
                $("#star-" + id_num).attr('class', 'star-highlight');
                this.all_objects.getObjectByName(id_num).material.color = new THREE.Color( 0x00ff00 );
                this.starred = id_num;
            }
        } else {
            $("#star-" + id_num).attr('class', 'star-highlight');
            this.all_objects.getObjectByName(id_num).material.color = new THREE.Color( 0x00ff00 );
            this.starred = id_num;
        }

    }
}
