function setQualityLevel( level )
{
    //if not mobile
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 2;

    switch( level )
    {
        case 1:
            setQuality_TerrainResDependant( 7 );
            renderer.antialias      = false;
            subsampleFactor         = 2;
            renderer.setPixelRatio( 1 );
            break;
        case 2:

            setQuality_TerrainResDependant( 8 );
            renderer.antialias      = false;
            subsampleFactor         = 2;
            renderer.setPixelRatio( 1 );
            break;
        case 3:
            setQuality_TerrainResDependant( 9 );
            renderer.antialias      = false;
            subsampleFactor         = 1;
            renderer.setPixelRatio( 1 );
            break;
        case 4:
            setQuality_TerrainResDependant( 10 );
            renderer.antialias      = true;
            subsampleFactor         = 1;
            renderer.setPixelRatio( 1 );
            break;
        case 5:
            setQuality_TerrainResDependant( 11 );
            renderer.antialias      = true;
            subsampleFactor         = 1;
            renderer.setPixelRatio( 1 );
            break;
        case 6:
            setQuality_TerrainResDependant( 12 );
            renderer.antialias      = true;
            subsampleFactor         = 1;
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
    TERRAIN_RESOLUTION = terrainRes;

    //  Water Plane is initially created at 512x512
    WATER_SCALE_FACTOR = Math.pow( 2, ( terrainRes - 7 ) + 1 );
    if ( waterMesh != null )
    {
        scene.remove( waterMesh );
        initWater();
    }

    camera.far = Math.pow( 2, terrainRes + 1 );

	controls.maxDistance = Math.pow(2, terrainRes);
	controls.update();

    switch ( terrainRes )
    {
        case 7:
            scene.fog.density = 0.003;
		    TERRAIN_OFFSET = 50;
            break;
        case 8:
            scene.fog.density = 0.002;
			TERRAIN_OFFSET = 100;
            break;
        case 9:
            scene.fog.density = 0.001;
			TERRAIN_OFFSET = 200;
            break;
        case 10:
            scene.fog.density = 0.0008;
            TERRAIN_OFFSET = 400;
            break;
        case 11:
            scene.fog.density = 0.0005;
            TERRAIN_OFFSET = 800;
            break;
        case 12:
            scene.fog.density = 0.0002;
            TERRAIN_OFFSET = 1200;
            break;
    }
}