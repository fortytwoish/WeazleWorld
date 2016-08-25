//  GLOBALS
isInMenu           = true;
preventRaycastOnce = false;
TERRAIN_OFFSET     = 0;
TERRAIN_RESOLUTION = 0;
WATER_SCALE_FACTOR = 1;

//  CONSTANTS
const DEFAULT_QUALITY    = 2;
const PAUSE_IN_MENU      = true;
const WATERLEVEL         = 0;
const WATERCOLOR         = 0x55AAAA;
const WINDOW_CLEAR_COLOR = 0x4FABEE;
const FOG_COLOR          = 0x4FABFF;
const SUN_POSITION       = new THREE.Vector3( 0.4, 0.75, 0.5 ).normalize();
const LIGHTSTR           = 0.95;
const LIGHTCOL           = 0xFFEEFF;
const OPPOSITE_LIGHTSTR  = 0.6;
const OPPOSITE_LIGHTCOL  = 0xDDDDEE;
const VILLAGE_DIMENSIONS = new THREE.Vector3( 20, 20, WATERLEVEL + 4 );
const STATUE_DIMENSIONS  = new THREE.Vector3( 5, 5, 5 );
const STATUE_WOOD_MAT    = new THREE.MeshPhongMaterial( { color: 0x7F6343, shininess:   2,                     side: THREE.DoubleSide } );
const STATUE_BRONZE_MAT  = new THREE.MeshPhongMaterial( { color: 0x70431C, shininess: 150, specular: 0x70431C, side: THREE.DoubleSide } );
const STATUE_SILVER_MAT  = new THREE.MeshPhongMaterial( { color: 0x999999, shininess: 250, specular: 0x999999, side: THREE.DoubleSide } );
const STATUE_GOLD_MAT    = new THREE.MeshPhongMaterial( { color: 0x9A7D31, shininess: 350, specular: 0x9A7D31, side: THREE.DoubleSide } );


//  LOCALS
var camera,
    scene,
    renderer,
    islandMesh,
    waterMesh,
    test_statues                 = [],
    subsampleFactor              = 1,
    canClickObjects              = true,
    minigame_rock                = null,
    minigame_rock_outline        = null,
    minigame_water               = null,
    minigame_water_outline       = null,
    minigame_palm                = null,
    minigame_palm_leaves         = null,
    minigame_palm_outline        = null,
    minigame_palm_leaves_outline = null;

clickable_objects = [];
waterCreated = false;

function main()
{
    init();
    animate();
}

function init()
{
    clock = new THREE.Clock( true );

    //------------------------------------------------------//
    //                  RENDERER                            //
    //------------------------------------------------------//
    initRenderer();

    //------------------------------------------------------//
    //                  SCENE                               //
    //------------------------------------------------------//
    scene     = new THREE.Scene();
    scene.fog = new THREE.FogExp2( FOG_COLOR, 0.001 );

    //------------------------------------------------------//
    //                  CAMERA                              //
    //------------------------------------------------------//
    camera            = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000000 );
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 35;
    camera.lookAt( new THREE.Vector3( 0, 50, 0 ) );

    //------------------------------------------------------//
    //                  CAMERA CONTROLS                     //
    //------------------------------------------------------//
    controls                 = new THREE.OrbitControls( camera, renderer.domElement );

    controls.minDistance     = 10;
    controls.maxDistance     = Math.pow(2, TERRAIN_RESOLUTION - 1);

    controls.minPolarAngle   = degreeToRad( 5 );     //  | (0)   |/  (~15)    |_ (90) 
    controls.maxPolarAngle   = degreeToRad( 85 );

    controls.enableDamping   = false; //TODO: Enable this for touchscreens

    controls.enablePan       = true;

    controls.rotateSpeed     = 1;
    controls.autoRotateSpeed = 1;
    controls.zoomSpeed       = 1;

    controls.target          = new THREE.Vector3( 0, 10, 0 );

    //  Set default terrain gen & render quality
    setQualityLevel( DEFAULT_QUALITY );
    
    initWater();

    initIsland();

    //initWeazles();

    initStatueSegments();

    initStatueParticleSystem();

    initMinigameNodes();

    initLighting();

    //------------------------------------------------------//
    //                  -> SCENE                            //
    //------------------------------------------------------//
    scene.add( islandMesh );

    scene.add( statueParticleSystem );

    scene.add( directionalLight );
    scene.add( directionalLight2 );

    //------------------------------------------------------//
    //                  -> HTML                             //
    //------------------------------------------------------//
    var container = document.getElementById( "mainGame" );
    container.appendChild( renderer.domElement );

    stats = new Stats();
    document.body.appendChild( stats.dom );

    //------------------------------------------------------//
    //                  EVENT BINDING                       //
    //------------------------------------------------------//
    document.addEventListener( 'click'     , onDocumentMouseClick, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'keydown'   , onkeydown           , false );
    window  .addEventListener( 'resize'    , onWindowResize      , false );

    //  Call a window resize to ensure everything fits
    onWindowResize();
}

function initRenderer()
{
    renderer                    = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( WINDOW_CLEAR_COLOR );
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.Type     = THREE.BasicShadowMap;
}

function initWater()
{
    var textureLoader = new THREE.TextureLoader();

    textureLoader.load( 'img/waternormals.jpg', function ( loadedTexture ) //Called when the texture has finished loading
    {
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;

        water = new THREE.Water( renderer, camera, scene,
        {
            //  Optional Parameters
            textureWidth: 1024,
            textureHeight: 1024,
            waterNormals: loadedTexture,
            alpha: 0.9,
            waterColor: WATERCOLOR,
            distortionScale: 15
        } );

        var planeGeom = new THREE.PlaneBufferGeometry( 128 * WATER_SCALE_FACTOR, 128 * WATER_SCALE_FACTOR, 1, 1 );

        waterMesh = new THREE.Mesh( planeGeom, water.material );
        waterMesh.rotation.x = -Math.PI * 0.5;
        waterMesh.add( water );

        scene.add( waterMesh );

        waterCreated = true;
    } );
}

function initIsland()
{
    var islandGeom              = GenerateIsland( TERRAIN_RESOLUTION, WATERLEVEL );
    var islandMat               = new THREE.MeshPhongMaterial(
                                {
                                    map: GenerateMaterial( islandGeom, SUN_POSITION )
                                } );
    islandMat.shading           = THREE.FlatShading;
    islandMesh                  = new THREE.Mesh( islandGeom, islandMat );
    islandMesh.receiveShadow    = true;
}

function initWeazles()
{
    Weazle_init();

    weazles = [];
}

function initStatueSegments()
{
    var loader = new THREE.OBJLoader();

    loadStatueSegment( loader, 'Models/Statue_Bottom.obj', 1 );
    loadStatueSegment( loader, 'Models/Statue_Mid.obj'   , 2 );
    loadStatueSegment( loader, 'Models/Statue_Top.obj'   , 3 );
}

function loadStatueSegment( loader, path, index )
{
    loader.load( path, function ( object )
    {
        object.traverse( function ( child )
        {
            if ( child instanceof THREE.Mesh )
            {
                var mesh = new THREE.Mesh( child.geometry, new THREE.MeshBasicMaterial() );
                mesh.scale.set( 1 / 20, 1 / 20, 1 / 20 );
                mesh.position.y     = 4;
                mesh.castShadow     = true;
                mesh.receiveShadow  = true;
                test_statues[index] = mesh;
            }

        } );

    } );
}

function initStatueParticleSystem()
{

    // The number of particles in a particle system is not easily changed.
    particleCount = 100;

    // Particles are just individual vertices in a geometry
    // Create the geometry that will hold all of the vertices
    particles = new THREE.Geometry();

    // Create the vertices and add them to the particles geometry
    for ( var p = 0; p < particleCount; p++ )
    {
        //  Random point on the statue's circle
        var angle = Math.random() * Math.PI * 2;
        var x = Math.random() * Math.cos( angle ) * 5;
        var y = 0;
        var z = Math.random() * Math.sin( angle ) * 5;

        // Create the vertex
        var particle = new THREE.Vector3( x, y, z );

        // Add the vertex to the geometry
        particles.vertices.push( particle );
    }

    // Create the material that will be used to render each vertex of the geometry
    particleMaterial = new THREE.PointsMaterial(
            {
                color: 0xffffff,
                size:  5,
                map: THREE.ImageUtils.loadTexture( "img/smoke_puff.png" ),
                //blending: THREE.AdditiveBlending,
                transparent: true,
                alphaTest: 0.5
            } );

    // Create the particle system
    statueParticleSystem = new THREE.Points( particles, particleMaterial );
    //statueParticleSystem.sortParticles = true;
}

function resetParticles()
{

}

function initMinigameNodes()
{
    var loader = new THREE.OBJLoader();

    minigame_rock_geom                = new THREE.Mesh(),
    minigame_rock_outline_geom        = new THREE.Mesh(),
    minigame_water_geom               = new THREE.Mesh(),
    minigame_water_outline_geom       = new THREE.Mesh(),
    minigame_palm_geom                = new THREE.Mesh(),
    minigame_palm_outline_geom        = new THREE.Mesh(),
    minigame_palm_leaves_geom         = new THREE.Mesh(),
    minigame_palm_leaves_outline_geom = new THREE.Mesh();

    //  Init the models
    //  1. Rock
    loadNodeSegment( loader, 'Models/rock.obj',                minigame_rock_geom );
    loadNodeSegment( loader, 'Models/rock_outline.obj',        minigame_rock_outline_geom );
    //  2. Water
    loadNodeSegment( loader, 'Models/rock.obj',                minigame_water_geom );
    loadNodeSegment( loader, 'Models/rock_outline.obj',        minigame_water_outline_geom );
    //  3. palm
    loadNodeSegment( loader, 'Models/palm_trunk.obj',           minigame_palm_geom );
    loadNodeSegment( loader, 'Models/palm_trunk_outline.obj',   minigame_palm_outline_geom );
    loadNodeSegment( loader, 'Models/palm_leaves.obj',          minigame_palm_leaves_geom );
    loadNodeSegment( loader, 'Models/palm_leaves_outline.obj',  minigame_palm_leaves_outline_geom );
}

function loadNodeSegment( loader, path, targetGeom )
{
    loader.load( path, function ( object )
    {
        object.traverse( function ( child )
        {
            if ( child instanceof THREE.Mesh )
            {
                targetGeom.geometry = child.geometry;
                if ( targetGeom == minigame_palm_geom )
                {
                    targetGeom.material = child.material;

                    new THREE.TextureLoader().load( 'img/palm_bark.png', function ( loadedTexture )
                    {
                        targetGeom.material.map = loadedTexture;
                        nodeLoaded();
                    } );
                }
                else if(targetGeom == minigame_palm_leaves_geom)
                {
                    targetGeom.material = child.material;

                    new THREE.TextureLoader().load( 'img/palm leafs.png', function ( loadedTexture )
                    {
                        targetGeom.material.map = loadedTexture;
                        nodeLoaded();
                    } );
                }
                nodeLoaded();
            }
        } );
    } );
}

var nodesLoaded = 0;
var nodesToLoad = 10;
function nodeLoaded()
{
    if ( ++nodesLoaded == nodesToLoad )
    {
        OnAllMinigameNodesLoaded();
    }
}

function OnAllMinigameNodesLoaded()
{
    var outlineMat = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );

    //  Generate meshes
    minigame_rock                        = new THREE.Mesh( minigame_rock_geom.geometry,                new THREE.MeshPhongMaterial( { color: 0x888888 } ) );
    minigame_rock_outline                = new THREE.Mesh( minigame_rock_outline_geom.geometry,        outlineMat );
                                         
    minigame_water                       = new THREE.Mesh( minigame_water_geom.geometry,               new THREE.MeshPhongMaterial( { color: 0x0000FF } ) );
    minigame_water_outline               = new THREE.Mesh( minigame_water_outline_geom.geometry,       outlineMat );
                                         
    minigame_palm                        = new THREE.Mesh( minigame_palm_geom.geometry,                minigame_palm_geom.material);//new THREE.MeshPhongMaterial( { color: 0x888811 } ) );
    minigame_palm_leaves                 = new THREE.Mesh( minigame_palm_leaves_geom.geometry,         minigame_palm_leaves_geom.material);//new THREE.MeshPhongMaterial( { color: 0x00CC00 } ) );
    minigame_palm_outline                = new THREE.Mesh( minigame_palm_outline_geom.geometry,        outlineMat );
    minigame_palm_leaves_outline         = new THREE.Mesh( minigame_palm_leaves_outline_geom.geometry, outlineMat );

    minigame_water_outline.visible       = false;
    minigame_palm_outline.visible        = false;
    minigame_palm_leaves_outline.visible = false;

    placeMinigameNodes();

}

function placeMinigameNodes()
{
    
    //  Generate map coordinates for each minigame
    nodeCoordinates = [];
    var halfDim = dim / 2;

    for ( var i = 0; i < 3; i++ )
    {
        do
        {
            var xpos = randBetween( -halfDim * 0.5, (halfDim - 1) * 0.5 );
            var zpos = randBetween( -halfDim * 0.5, (halfDim - 1) * 0.5 );
            var ypos = field[Math.round( middle.x + zpos )][Math.round( middle.y + xpos )];
        }
        while ( ypos < WATERLEVEL || ypos > BEACH_HEIGHT || Math.abs( xpos * zpos ) < VILLAGE_DIMENSIONS.x * VILLAGE_DIMENSIONS.y );

        //  TODO: Check for overlapping
        //  TODO: Check for distance to middle and border

        nodeCoordinates.push( new THREE.Vector3( xpos, ypos, zpos ) );
    }

    var rock_height  = 0;
    var water_height = 0;
    var palm_height  = -1;

    minigame_rock.position.x  = minigame_rock_outline.position.x  = nodeCoordinates[0].x;
    minigame_rock.position.y  = minigame_rock_outline.position.y  = nodeCoordinates[0].y + rock_height;
    minigame_rock.position.z  = minigame_rock_outline.position.z  = nodeCoordinates[0].z;

    minigame_water.position.x = minigame_water_outline.position.x = nodeCoordinates[1].x;
    minigame_water.position.y = minigame_water_outline.position.y = nodeCoordinates[1].y + water_height;
    minigame_water.position.z = minigame_water_outline.position.z = nodeCoordinates[1].z;

    minigame_palm.position.x  = minigame_palm_outline.position.x  = minigame_palm_leaves.position.x = minigame_palm_leaves_outline.position.x = nodeCoordinates[2].x;
    minigame_palm.position.y  = minigame_palm_outline.position.y  = minigame_palm_leaves.position.y = minigame_palm_leaves_outline.position.y = nodeCoordinates[2].y + palm_height;
    minigame_palm.position.z  = minigame_palm_outline.position.z  = minigame_palm_leaves.position.z = minigame_palm_leaves_outline.position.z = nodeCoordinates[2].z;

    scene.add( minigame_rock );
    scene.add( minigame_rock_outline );
    scene.add( minigame_water );
    scene.add( minigame_water_outline );
    scene.add( minigame_palm );
    scene.add( minigame_palm_outline );
    scene.add( minigame_palm_leaves );
    scene.add( minigame_palm_leaves_outline );

    OnMinigameAvailabilityChanged( 1, true );
}

function onWeazleLoadingFinished()
{
    for ( var i = 0; i < 10; i++ )
    {
        weazles[i] = new Weazle();
        scene.add( weazles[i].mesh );
    }
}

function initLighting()
{
    directionalLight = new THREE.DirectionalLight( LIGHTCOL, LIGHTSTR );
    directionalLight.position.set( SUN_POSITION.x * 11, SUN_POSITION.y * 11, SUN_POSITION.z * 11 );    

    //  Opposing sun light (fake light reflected from water to lighten shadows)
    directionalLight2 = new THREE.DirectionalLight( OPPOSITE_LIGHTCOL, OPPOSITE_LIGHTSTR );
    directionalLight2.position.set( -SUN_POSITION.x, SUN_POSITION.y, -SUN_POSITION.z );

    directionalLight.shadowCameraRight    = 6;
    directionalLight.shadowCameraLeft     = -6;
    directionalLight.shadowCameraTop      = 12;
    directionalLight.shadowCameraBottom   = 2;
    directionalLight.shadowCameraFar      = 16;
    directionalLight.shadowCameraNear     = -2.5;
    directionalLight.castShadow           = true;
    //scene.add( new THREE.CameraHelper( directionalLight.shadow.camera ) );
}

//  Caution: Mostly debug stuff still
function animate()
{
    stats.begin();

    deltaTime = clock.getDelta();

    var camFieldX = Math.round( middle.x + camera.position.z );
    var camFieldY = Math.round( middle.y + camera.position.x );

    //  Prevent camera collision
    if ( camFieldX >= 0 && camFieldX < field.length && camFieldY >= 0 && camFieldY < field.length )
    {
        var terrainAtCameraPos = field[camFieldX][camFieldY ];

        if ( camera.position.y <= terrainAtCameraPos )
        {
            camera.position.y = terrainAtCameraPos;
        }
    }

    if ( controls.autoRotate )
    {
        controls.update();
    }

    var col = Math.round( 255 * ( Math.sin( Date.now() / 250 ) / 4 + 0.75 ) );

    if ( minigame_rock_outline && minigame_rock_outline.visible )
    {
        minigame_rock_outline.material.color = new THREE.Color( "rgb(" + col + ", 0, 0)" );
    }
    if ( minigame_water_outline && minigame_water_outline.visible )
    {
        minigame_water_outline.material.color = new THREE.Color( "rgb(" + col + ", 0, 0)" );
    }
    if ( minigame_palm_outline && minigame_palm_outline.visible )
    {
        minigame_palm_outline.material.color = new THREE.Color( "rgb(" + col + ", 0, 0)" );
    }
    if ( minigame_palm_leaves_outline && minigame_palm_leaves_outline.visible )
    {
        minigame_palm_leaves_outline.material.color = new THREE.Color( "rgb(" + col + ", 0, 0)" );
    }

    if (!isInMenu)
    {
        
    }
    else
    {
        //SET THESE TO AUTOMATICALLY ROTATE, FOR EXAMPLE WHEN VIEWING STATUE
        //controls.autoRotate = true;
    }
           
    //  continue render loop

    if ( waterCreated )
    {
        water.material.uniforms.time.value += 0.005;
        water.render();
    }
    
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.end();
}

//------------------------------------------------------//
//                  EVENT HANDLING                      //
//------------------------------------------------------//
$( function ()
{
    
    $(".blockRaycast").mousedown(function ()
    {
        preventRaycastOnce = true;
    } );

	$("#newMapButton").click(function()
	{
		var terrainRes = parseInt(prompt("Which resolution? (7-12)"));

        if (terrainRes != null && terrainRes >= 7 && terrainRes <= 12)
        {
            click_MapGenStart( terrainRes );
		}
		else
		{
			//	Cancel was pressed
		}
	} );

    $( "#menuButton" ).click( function ()
    {
        openMenu();
    } );

    //Test, to be replaced by clicks on the island's objects
    $( "#minigameButton" ).click( function ()
    {
        var minigameID = prompt("Which minigame? (1-3)");

        if ( minigameID != null )
        {
            startMinigame( minigameID );
        }
    });

    $("#showMessageBoxButton").click(function () {
        click_MessageBox();
    });

    $( "#messageBoxButton" ).click( function ()
    {
        click_MessageBoxWeiter();
    } );

    $( "#exitStatueButton" ).click( function ()
    {
        ExitShowStatue();
    } );
});

//TODO: Find a better method to go fullscreen
function onWindowResize()
{
    var scrollbarSize = 7;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio / subsampleFactor);
    renderer.setSize( window.innerWidth - scrollbarSize, window.innerHeight - scrollbarSize );

    resizeSplashScreen();
    resizeMenu();
}

var raycaster = new THREE.Raycaster();
var mouse     = new THREE.Vector2();

function onDocumentTouchStart( event )
{

    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseClick( event );

}

function onDocumentMouseClick( event )
{
    if (preventRaycastOnce)
    {
        preventRaycastOnce = false;
        return;
    }

    if ( !controls.enabled || !canClickObjects )
    {
        return;
    }

    event.preventDefault();

    mouse.x =  ( event.clientX / renderer.domElement.clientWidth  ) * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(clickable_objects);

    if ( intersects.length > 0 )
    {
        if ( intersects[0].object == minigame_rock )
        {
            startMinigame( 1 );
        }
        else if ( intersects[0].object == minigame_water )
        {
            startMinigame( 2 );
        }
        else if ( intersects[0].object == minigame_palm || intersects[0].object == minigame_palm_leaves  )
        {
            startMinigame( 3 );
        }
        else if ( arrayContains(test_statues, intersects[0].object) )
        {
            //$( "#exitStatueButton" ).show();
            setTimeout( function ()
            {
                ShowStatue();
            }, 250 );
            
        }


    }

}

function onkeydown( event )
{
    if(event.key == "r")
    {
        if ( controls.autoRotate )
        {
            controls.autoRotate = false;
        }
        else
        {
            controls.autoRotate = true;
        }
    }
    else if ( event.key == "s" )
    {
        if ( directionalLight.castShadow )
        {
            directionalLight.castShadow = false;
        }
        else
        {
            directionalLight.castShadow = true;
        }
    }
    else if ( event.key == "1" )
    {
        subsampleFactor = 1;
	    onWindowResize();
    }
    else if ( event.key == "2" )
    {
        subsampleFactor = 2;
	    onWindowResize();
    }
    else if ( event.key == "3" )
    {
        subsampleFactor = 4;
	    onWindowResize();
    }
    else if ( event.key == "4" )
    {
        subsampleFactor = 8;
	    onWindowResize();
    }
    else if ( event.key == "5" )
    {
        subsampleFactor = 16;
	    onWindowResize();
    }
    else if ( event.key == "ArrowUp" )
    {
        minigame_palm_outline.position.z += 0.1;
        //directionalLight.shadow.camera.top++;
        //directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "ArrowLeft" )
    {
        minigame_palm_outline.position.x -= 0.1;
        //directionalLight.shadow.camera.right--;
        //directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "ArrowDown" )
    {
        minigame_palm_outline.position.z -= 0.1;
        //directionalLight.shadow.camera.top--;
        //directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "ArrowRight" )
    {
        minigame_palm_outline.position.x += 0.1;
        //directionalLight.shadow.camera.right++;
        //directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "+" )
    {
        directionalLight.shadow.camera.far++;
        directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "-" )
    {
        directionalLight.shadow.camera.far--;
        directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "8" )
    {
        directionalLight.shadow.camera.bottom--;
        directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "4" )
    {
        directionalLight.shadow.camera.left++;
        directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "5" )
    {
        directionalLight.shadow.camera.bottom++;
        directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "6" )
    {
        directionalLight.shadow.camera.left--;
        directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "ü" )
    {
        directionalLight.shadow.camera.near--;
        directionalLight.shadow.camera.updateProjectionMatrix();
    }
    else if ( event.key == "ä" )
    {
        directionalLight.shadow.camera.near++;
        directionalLight.shadow.camera.updateProjectionMatrix();
    }

    //  directionalLight.shadow.camera.right    = 10;
    //  directionalLight.shadow.camera.left = -10;
    //  directionalLight.shadow.camera.top = 20;
    //  directionalLight.shadow.camera.bottom = -5;
    //  directionalLight.shadow.camera.far = 30;
}

//------------------------------------------------------//
//             INTERFACE IMPLEMENTATION                 //
//------------------------------------------------------//
function OnStatueModelChanged( minigameID )
{
    //  Prevent clicking of any additional minigames
    canClickObjects = false;

    //  Change existing statue segment's material
    var minigameWon    = getMinigameState( minigameID, 2 );
    var minigamePlayed = getMinigameState( minigameID, 1 );

    var segmentMat     = minigameWon == 1
                        ? STATUE_WOOD_MAT
                        : minigameWon == 2
                        ? STATUE_BRONZE_MAT
                        : minigameWon == 3
                        ? STATUE_SILVER_MAT
                        : STATUE_GOLD_MAT;

    //  Show message
    if ( showTutorials )
    {
        switch ( minigamePlayed )
        {
            case 1:
                showMessageBox( getFirstSegmentBuiltText( minigameID ),
                                segmentBuiltEndText,
                                function () { changeStatueModel( test_statues[minigameID], segmentMat ) } );
                break;
            case 4:
                showMessageBox( getLastSegmentBuiltText( minigameID ),
                                segmentBuiltEndText,
                                function () { changeStatueModel( test_statues[minigameID], segmentMat ) } );
                break;
            default:
                showMessageBox( getNextSegmentBuiltText( minigameID ),
                                segmentBuiltEndText,
                                function () { changeStatueModel( test_statues[minigameID], segmentMat ) } );
                break;
        }
    }
    else
    {
        changeStatueModel( test_statues[minigameID], segmentMat );
    }

}

function changeStatueModel( mesh, segmentMat )
{
    controls.enabled     = false;

    oldRad           = spherical.radius;
    oldRotateSpeed   = controls.autoRotateSpeed;

    targetRad        = 30;
    targetRotateSpd  = 5;
    zoomInTime       = 1500;
    zoomOutTime      = 2000;
    segmentBuildTime = 2000;
    timeUntilZoomOut = 2000;
    particleTime     = 5000;

    controls.autoRotate  = true;

    ShowStatue( function()
    {
        var verts = statueParticleSystem.geometry.vertices;

        // (Re-)set the particles for the segment to be built
        particleMaterial.opacity = 1;
        if( mesh == test_statues[1] )
        {
            for ( var i = 0; i < particleCount; i++ )
            {
                //  Random point on the statue's circle
                var angle  = Math.random() * Math.PI * 2;
                verts[i].x = Math.random() * Math.cos( angle ) * 6;
                verts[i].y = -16 + Math.random() * 2;
                verts[i].z = Math.random() * Math.sin( angle ) * 6;
            }
        }
        else if ( mesh == test_statues[2] )
        {
            for ( var i = 0; i < particleCount; i++ )
            {
                //  Random point on the statue's circle
                var angle  = Math.random() * Math.PI * 2;
                verts[i].x = Math.random() * Math.cos( angle ) * 3;
                verts[i].y = -14 + Math.random() * 6;
                verts[i].z = Math.random() * Math.sin( angle ) * 3;
            }
        }
        else if ( mesh == test_statues[3] )
        {
            for ( var i = 0; i < particleCount; i++ )
            {
                //  Random point on the statue's circle
                var angle  = Math.random() * Math.PI * 2;
                verts[i].x = Math.random() * Math.cos( angle ) * 2;
                verts[i].y = -8 + Math.random() * 6;
                verts[i].z = Math.random() * Math.sin( angle ) * 2;
            }
        }
        statueParticleSystem.geometry.verticesNeedUpdate = true;

        //----------------------//
        //1. BUILD UP PARTICLES //
        //----------------------//
        var alreadyDone = 0;
        $( { n: 0 } ).animate( { n: particleCount }, {
            duration: zoomInTime + segmentBuildTime,
            step: function ( now, fx )
            {
                for ( var i = alreadyDone; i < now; i++ )
                {
                    verts[i].y += 20;
                }
                alreadyDone = i;

                statueParticleSystem.geometry.verticesNeedUpdate = true;
            }
        } );

        setTimeout( function ()
        {
            //----------------------//
            // 2. RELEASE PARTICLES //
            //----------------------//
            var directions = [];
            for ( var i = 0; i < particleCount; i++ )
            {
                directions.push( new THREE.Vector2( randBetween( -1, 1 ), randBetween( -1, 1 ) ).normalize() );
            }
            $( { n: 1 } ).animate( { n: 10 }, {
                duration: particleTime,
                step: function ( now, fx )
                {
                    for ( var i = 0; i < particleCount; i++ )
                    {
                        verts[i].x += (directions[i].x / Math.pow( 2, now ));
                        verts[i].z += (directions[i].y / Math.pow( 2, now ));
                    }
                    particleMaterial.opacity = 1 / now;

                    statueParticleSystem.geometry.verticesNeedUpdate = true;
                }
            } );
            //----------------------//
            //   2. BUILD SEGMENT   //
            //----------------------//
            if ( segmentMat == STATUE_WOOD_MAT )
            {
                scene.add( mesh );
                clickable_objects.push( mesh );
            }
            mesh.material = segmentMat;
            
        }, segmentBuildTime );
    } );

    //----------------------//
    //    1. ROTATE IN      //
    //----------------------//
    $( { n: 0 } ).animate( { n: targetRotateSpd }, {
        duration: zoomInTime,
        step: function ( now, fx )
        {
            controls.autoRotateSpeed = now;
        }
    } );

    setTimeout( function ()
    {
        //----------------------//
        //     3. ZOOM OUT      //
        //----------------------//
        $( { n: targetRad } ).animate( { n: oldRad }, {
            duration: zoomOutTime,
            step: function ( now, fx )
            {
                controls.update( now );
            }
        } );
        //----------------------//
        //    3. ROTATE OUT     //
        //----------------------//
        $( { n: targetRotateSpd } ).animate( { n: 0 }, {
            duration: zoomInTime,
            step: function ( now, fx )
            {
                controls.autoRotateSpeed = now;
            },
            complete: function()
            {
                controls.autoRotateSpeed = oldRotateSpeed;
                controls.autoRotate      = false;
                controls.enabled         = true;
                canClickObjects          = true;
            }
        } );
    }, (zoomInTime + segmentBuildTime + timeUntilZoomOut ) );
}

function ShowStatue( completeFctn )
{
    oldRad              = spherical.radius;
    oldRotateSpeed      = controls.autoRotateSpeed;

    targetRad           = 30;
    targetRotateSpd     = 5;
    var zoomInTime      = 1500;

    controls.autoRotate = true;

    //----------------------//
    //     1.  ZOOM IN      //
    //----------------------//
    $( { n: oldRad } ).animate( { n: targetRad }, {
        duration: zoomInTime,
        step: function ( now, fx )
        {
            controls.update( now );
        }
        ,complete: function()
        {
            if(completeFctn)
            {
                completeFctn();
            }
        }
    } );
    //----------------------//
    //    1. ROTATE IN      //
    //----------------------//
    $( { n: 0 } ).animate( { n: targetRotateSpd }, {
        duration: zoomInTime,
        step: function ( now, fx )
        {
            controls.autoRotateSpeed = now;
        }
    } );

    controls.enabled = false;
}

function ExitShowStatue()
{
    var zoomOutTime = 1000;

    //----------------------//
    //       ZOOM OUT       //
    //----------------------//
    $( { n: targetRad } ).animate( { n: oldRad }, {
        duration: zoomOutTime,
        step: function ( now, fx )
        {
            controls.update( now );
        }
    } );
    //----------------------//
    //      ROTATE OUT      //
    //----------------------//
    $( { n: targetRotateSpd } ).animate( { n: 0 }, {
        duration: zoomInTime,
        step: function ( now, fx )
        {
            controls.autoRotateSpeed = now;
        },
        complete: function ()
        {
            controls.autoRotateSpeed = oldRotateSpeed;
            controls.autoRotate      = false;
            controls.enabled         = true;
        }
    } );
}

function OnStatueStateChanged()
{
    // Reference:
    // { 1:"NOT_STARTED", 2:"IN_CONSTRUCTION", 3:"CONSTRUCTED"};
    var currentStatueState = getStatueState();

    if( currentStatueState == "NOT_STARTED" )
    {
        if ( test_statue != null )
        {
            scene.remove( test_statue );
        }

        test_statue = null;
    }
}

function OnMinigameAvailabilityChanged( minigameID, isAvailable )
{
    if ( isAvailable )
    {
        console.log( "minigame " + minigameID + " is now available." );
        switch ( minigameID )
        {
            case 1:
                clickable_objects.push( minigame_rock );
                minigame_rock_outline.visible  = true;
                break;
            case 2:
                clickable_objects.push( minigame_water );
                minigame_water_outline.visible = true;
                break;
            case 3:
                clickable_objects.push( minigame_palm );
                clickable_objects.push( minigame_palm_leaves );
                minigame_palm_outline.visible        = true;
                minigame_palm_leaves_outline.visible = true;
                break;
        }
    }
    else
    {
        console.log( "minigame " + minigameID + " is no longer available." );
        switch ( minigameID )
        {
            case 1:
                clickable_objects.splice( minigame_rock, 1 );
                minigame_rock_outline.visible  = false;
                break;
            case 2:
                clickable_objects.splice( minigame_water, 1 );
                minigame_water_outline.visible = false;
                break;
            case 3:
                clickable_objects.splice( minigame_palm );
                clickable_objects.splice( minigame_palm_leaves_outline );
                minigame_palm_outline.visible        = false;
                minigame_palm_leaves_outline.visible = false;
                break;
        }
    }

}

main();