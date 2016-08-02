function setQualityLevel( level )
{
    //if not mobile
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 2;

    switch( level )
    {
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            setTerrainRes( 12 );
            renderer.antialias      = true;
            renderer.setPixelRatio( 1 );
            break;
        case "htcone":
            setTerrainRes( 10 );
            renderer.antialias      = false;
            controls.rotateSpeed    = 0.5;
            controls.zoomSpeed      = 0.5;
            renderer.setPixelRatio( 1 / 2 );
            break;

            
    }
}

function setTerrainRes( level )
{
    TERRAIN_RESOLUTION = level;

    switch ( level )
    {
        case 7:
            break;
        case 8:
            break;
        case 9:
            break;
        case 10:
            TERRAIN_OFFSET          = 600;
            RAFT_DIMENSIONS         = new THREE.Vector3( 5, 5, 1 );
            scene.fog               = new THREE.FogExp2( FOG_COLOR, 0.0004 );
            //camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2048 ); can be made dependant on water terrain size
            controls.maxDistance    = 300;
            //var waterGeom = new THREE.PlaneBufferGeometry( 16384, 16384, 1, 1 ); can be made dependant on camera draw distance
            break;
        case 11:
            TERRAIN_OFFSET = 800;
            break;
        case 12:
            TERRAIN_OFFSET          = 1200;
            RAFT_DIMENSIONS         = new THREE.Vector3( 20, 20, 5 );
            scene.fog               = new THREE.FogExp2( FOG_COLOR, 0.0004 ); //?
            camera                  = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 4096 );
            controls.maxDistance    = 600;
            break;


    }
}