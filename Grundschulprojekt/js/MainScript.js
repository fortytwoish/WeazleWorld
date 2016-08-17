//  GLOBALS
isInMenu           = true;
preventRaycastOnce = false;
TERRAIN_OFFSET     = 0;
TERRAIN_RESOLUTION = 0;
WATER_SCALE_FACTOR = 1;

//  CONSTANTS
const DEFAULT_QUALITY    = 4;
const PAUSE_IN_MENU      = true;
const WATERLEVEL         = 0;
const WATERCOLOR         = 0x55AAAA;
const WINDOW_CLEAR_COLOR = 0x4FABEE;
const FOG_COLOR          = 0x4FABFF;
const SUN_POSITION       = new THREE.Vector3( 0.45, 1, 0.45 ).normalize();
const LIGHTSTR           = 0.8;
const OPPOSITE_LIGHTSTR  = 0.5;
const OPPOSITE_LIGHTCOL  = 0xDDDDFF;
const VILLAGE_DIMENSIONS = new THREE.Vector3( 20, 20, WATERLEVEL + 4 );
const STATUE_DIMENSIONS  = new THREE.Vector3( 10, 10, 10 );
const STATUE_SHRINK_DIM  = new THREE.Vector3( 2,  2,  1 );
const STATUE_GOLD_MAT    = new THREE.MeshPhongMaterial({color: 0xFF0000});
const STATUE_SILVER_MAT  = new THREE.MeshPhongMaterial({color: 0x00FF00});
const STATUE_BRONZE_MAT  = new THREE.MeshPhongMaterial({color: 0x0000FF});

//  LOCALS
var camera,
    scene,
    renderer,
    islandMesh,
    waterMesh,
    raftMesh,
    test_weazle,
    test_statues = [],
    subsampleFactor = 1;

waterCreated = false;

function main()
{
    init();
    animate();
}

function init()
{
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

    //  Set default terrain gen & render quality
    setQualityLevel( DEFAULT_QUALITY );
    
    //------------------------------------------------------//
    //                  WATER                               //
    //------------------------------------------------------//
    initWater();

    //------------------------------------------------------//
    //                  ISLAND                              //
    //------------------------------------------------------//
    initIsland();
    //------------------------------------------------------//
    //                  WEAZLES                             //
    //------------------------------------------------------//
    initWeazles();

    //------------------------------------------------------//
    //                  LIGHTING                            //
    //------------------------------------------------------//
    initLighting();

    //------------------------------------------------------//
    //                  -> SCENE                            //
    //------------------------------------------------------//
    scene.add( test_weazle );
    scene.add( islandMesh );

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
    document.addEventListener( 'mousedown' , onDocumentMouseDown , false );
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
    renderer.shadowMapType      = THREE.PCFSoftShadowMap;
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
    directionalLight = new THREE.DirectionalLight( 0xFFFFFF, LIGHTSTR );
    directionalLight.position.set( SUN_POSITION.x * 20, SUN_POSITION.y * 20, SUN_POSITION.z * 20 );
    directionalLight.castShadow = true;
    var shadowCamDist = 20;
    directionalLight.shadowCameraRight      = shadowCamDist;
    directionalLight.shadowCameraLeft       = -shadowCamDist;
    directionalLight.shadowCameraTop        = shadowCamDist;
    directionalLight.shadowCameraBottom     = -shadowCamDist;
    directionalLight.shadowCameraFar        = shadowCamDist * 2;
    directionalLight.shadowMapHeight        =
    directionalLight.shadowMapWidth         = 8192;
    scene.add( new THREE.CameraHelper( directionalLight.shadow.camera ) );

    //  Opposing sun light (fake light reflected from water to lighten shadows)
    directionalLight2 = new THREE.DirectionalLight( OPPOSITE_LIGHTCOL, OPPOSITE_LIGHTSTR );
    directionalLight2.position.set( -SUN_POSITION.x, SUN_POSITION.y, -SUN_POSITION.z );
}

//  Caution: Mostly debug stuff still
function animate()
{
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

    stats.begin();
    if (!isInMenu)
    {
        controls.autoRotate = false;    //Todo: Better way to handle autorotating while in menu
        /*  UPDATE SCENE HERE */

        for ( var i = 0; i < weazles.length; i++ )
        {
            weazles[i].moveRandomly();

        }
        
        

        camera.updateProjectionMatrix();

    }
    else
    {
        //SET THESE TO AUTOMATICALLY ROTATE, FOR EXAMPLE WHEN VIEWING STATUE
        controls.autoRotate = true;
    }
           
    //  continue render loop

    if ( waterCreated )
    {
        //waterPlane.position.y = WATERLEVEL - Math.sin( Date.now() / 1500 );
        water.material.uniforms.time.value += 0.005;
        water.render();
    }

    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
    stats.update();
    stats.end();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
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
    });
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
    onDocumentMouseDown( event );

}

function onDocumentMouseDown( event )
{
  
    if (preventRaycastOnce)
    {
        preventRaycastOnce = false;
        return;
    }

    event.preventDefault();

    mouse.x =  ( event.clientX / renderer.domElement.clientWidth  ) * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    objects = [ ];
    var intersects = raycaster.intersectObjects(objects);

    if ( intersects.length > 0 )
    {
        var color = Math.random() * 0xffffff;
        intersects[0].object.material.color.setHex( color );
        test_light.color.setHex( color );

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
}

//------------------------------------------------------//
//             INTERFACE IMPLEMENTATION                 //
//------------------------------------------------------//
function OnStatueModelChanged( minigameID )
{
    // Reference:
    // { MG1Done:0 , MG1Accuracy:0 , MG2Done:0 , MG2Accuracy:0 , MG3Done:0 , MG3Accuracy:0, ... };
    var currentStatueModel = getStatueModel();

    //  1. Remove existing statue segment at that position
    if ( test_statues[minigameID] != null )
    {
        scene.remove( test_statues[minigameID] );
    }

    //  2. Create new statue segment
    var segmentGeom            = new THREE.BoxGeometry( STATUE_DIMENSIONS.x, STATUE_DIMENSIONS.y, STATUE_DIMENSIONS.z );

    var minigameAcc = currentStatueModel[getStatueModelIndex(minigameID) + 1];

    var segmentMat  = minigameAcc <= (1 / 3)
                    ? STATUE_BRONZE_MAT
                    : minigameAcc <= (2 / 3)
                    ? STATUE_SILVER_MAT
                    : STATUE_GOLD_MAT;

    var segmentMesh = new THREE.Mesh( segmentGeom, segmentMat );
        segmentMesh.position.y = STATUE_DIMENSIONS.z * ( minigameID - 1 );

    test_statues[minigameID] = segmentMesh;
    scene.add( segmentMesh );
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

function OnMinigameAvailabilityChanged()
{
    
}

main();