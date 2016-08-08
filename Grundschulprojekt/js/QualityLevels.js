function setQualityLevel( level )
{
    //if not mobile
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 2;

    switch( level )
    {
        case 1:
            setQuality_TerrainResDependant( 8 );
            renderer.antialias      = true;
            renderer.setPixelRatio( 1 );
            break;
        case 2:
            setQuality_TerrainResDependant( 9 );
            renderer.antialias      = true;
            renderer.setPixelRatio( 1 );
            break;
        case 3:
            setQuality_TerrainResDependant( 10 );
            renderer.antialias      = true;
            renderer.setPixelRatio( 1 );
            break;
        case 4:
            setQuality_TerrainResDependant( 11 );
            renderer.antialias      = true;
            renderer.setPixelRatio( 1 );
            break;
        case 5:
            setQuality_TerrainResDependant( 12 );
            renderer.antialias      = true;
            renderer.setPixelRatio( 1 );
            break;
        case "htcone":
            setQuality_TerrainResDependant( 10 );
            renderer.antialias      = false;
            controls.rotateSpeed    = 0.5;
            controls.zoomSpeed      = 0.5;
            renderer.setPixelRatio( 1 / 2 );
            break;

            
    }
}

function setQuality_TerrainResDependant( terrainRes )
{	
	var dim = Math.pow(2, terrainRes);
	waterMesh.scale.set(1/2, 1, 1/2); //test
	camera.far = dim * 2;
	controls.maxDistance = Math.pow(2, terrainRes - 1);
	
    switch ( terrainRes )
    {
        case 7:
		    TERRAIN_OFFSET = 50;
            break;
        case 8:
			TERRAIN_OFFSET = 100;
            break;
        case 9:
			TERRAIN_OFFSET = 200;
            break;
        case 10:
            TERRAIN_OFFSET = 400;
            break;
        case 11:
            TERRAIN_OFFSET = 800;
            break;
        case 12:
            TERRAIN_OFFSET = 1200;
            break;
    }
	
	console.log("New TerrainOffset: " + TERRAIN_OFFSET);
}