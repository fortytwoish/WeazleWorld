storage = window.localStorage;

qualityInitialized = false;

currentQuality = 1;

function loadQualityLevel()
{

    if (typeof (storage) !== "undefined" && !isNaN(storage.quality))
    {
        console.log( "Setting quality to loaded level: " + storage.quality );
        setQualityLevel( parseInt(storage.quality) );
    }
    else
    {
        alert("No web storage!");
        console.log("No web storage. Setting quality to " + DEFAULT_QUALITY);
        setQualityLevel(DEFAULT_QUALITY);
    }
}

function setQualityLevel(level)
{

    level = parseInt(level);

    if (typeof (storage) !== "undefined")
    {
        storage.quality = level;
    }

    currentQuality = level;

    //if not mobile
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 2;

    switch( level )
    {
        case 1:
            setQuality_TerrainResDependant( 7 );
            renderer.antialias      = false;
            subsampleFactor         = 2;
            GRASS_DENSITY           = 4;
            break;
        case 2:
            setQuality_TerrainResDependant( 8 );
            renderer.antialias      = false;
            subsampleFactor         = 2;
            GRASS_DENSITY           = 3;
            break;
        case 3:
            setQuality_TerrainResDependant( 9 );
            renderer.antialias      = false;
            subsampleFactor         = 1;
            GRASS_DENSITY           = 2;
            break;
        case 4:
            setQuality_TerrainResDependant( 10 );
            renderer.antialias      = true;
            subsampleFactor         = 1;
            GRASS_DENSITY           = 1;
            break;
        case 5:
            setQuality_TerrainResDependant( 11 );
            renderer.antialias      = true;
            subsampleFactor         = 1;
            GRASS_DENSITY           = 1;
            break;
        case 6:
            setQuality_TerrainResDependant( 12 );
            renderer.antialias      = true;
            subsampleFactor         = 1;
            GRASS_DENSITY           = 1;
            break;
        case "htcone":
            setQuality_TerrainResDependant( 10 );
            renderer.antialias      = false;
            controls.rotateSpeed    = 0.5;
            controls.zoomSpeed      = 0.5;
            subsampleFactor         = 2;
            GRASS_DENSITY           = 5;
            break;
    }

    renderer.setPixelRatio( window.devicePixelRatio / subsampleFactor );
}

const global_fog_scale = 0.9;

function setQuality_TerrainResDependant( terrainRes )
{

    console.log("Updating terrain: " + terrainRes);

    TERRAIN_RESOLUTION = terrainRes;

    camera.far = Math.pow( 2, terrainRes + 1 );
    camera.updateProjectionMatrix();

	controls.maxDistance = Math.pow(2, terrainRes - 1);
	controls.update();

    switch ( terrainRes )
    {
        case 7:
            scene.fog.density = 0.003 * global_fog_scale;
		    TERRAIN_OFFSET = 50;
            break;
        case 8:
            scene.fog.density = 0.002 * global_fog_scale;
			TERRAIN_OFFSET = 100;
            break;
        case 9:
            scene.fog.density = 0.001 * global_fog_scale;
			TERRAIN_OFFSET = 200;
            break;
        case 10:
            scene.fog.density = 0.0008 * global_fog_scale;
            TERRAIN_OFFSET = 400;
            break;
        case 11:
            scene.fog.density = 0.0005 * global_fog_scale;
            TERRAIN_OFFSET = 800;
            break;
        case 12:
            scene.fog.density = 0.0002 * global_fog_scale;
            TERRAIN_OFFSET = 1200;
            break;
	}

    if (qualityInitialized)
    {
        console.log("Re-initializing level...");

        //  Water Plane is initially created at 512x512
        WATER_SCALE_FACTOR = Math.pow(2, (terrainRes - 7) + 1);
        if (waterMesh != null) {
            scene.remove(waterMesh);
            scene.remove(waterMesh2);
            initWater();
        }

        gameState = GAME_STATES.START;

        if (terrainRes != null && terrainRes >= 7 && terrainRes <= 12)
        {

            //  Reset necessary objects
            scene.remove(islandMesh);

            //  Create new objects

            //      ISLAND
            var islandGeom = GenerateIsland(terrainRes, WATERLEVEL);

            var islandMat = new THREE.MeshPhongMaterial({ map: GenerateMaterial(islandGeom, SUN_POSITION) });
            islandMat.shading = THREE.FlatShading;

            initIslandDecoration(GRASS_DENSITY);
            placeMinigameNodes();

            islandMesh = new THREE.Mesh(islandGeom, islandMat);
            scene.add(islandMesh);

            renderOnce();
        }
    }

    qualityInitialized = true;
}