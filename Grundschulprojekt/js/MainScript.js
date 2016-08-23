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
const SUN_POSITION       = new THREE.Vector3( 0.45, 1, 0.45 ).normalize();
const LIGHTSTR           = 0.8;
const OPPOSITE_LIGHTSTR  = 0.5;
const OPPOSITE_LIGHTCOL  = 0xDDDDFF;
const VILLAGE_DIMENSIONS = new THREE.Vector3( 20, 20, WATERLEVEL + 4 );
const STATUE_DIMENSIONS  = new THREE.Vector3( 5, 5, 5 );
const STATUE_GOLD_MAT    = new THREE.MeshPhongMaterial({color: 0xFF0000});
const STATUE_SILVER_MAT  = new THREE.MeshPhongMaterial({color: 0x00FF00});
const STATUE_BRONZE_MAT  = new THREE.MeshPhongMaterial({color: 0x0000FF});
const STATUE_WOOD_MAT    = new THREE.MeshPhongMaterial({color: 0x666666});


//  LOCALS
var camera,
    scene,
    renderer,
    islandMesh,
    waterMesh,
    test_statues = [],
    subsampleFactor = 1;

clickable_objects = [];
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

    controls.target          = new THREE.Vector3( 0, 10, 0 );

    //  Set default terrain gen & render quality
    setQualityLevel( DEFAULT_QUALITY );
    
    initWater();

    initIsland();

    initMinigameNodes();

    //initWeazles();

    initLighting();

    //------------------------------------------------------//
    //                  -> SCENE                            //
    //------------------------------------------------------//
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

function initMinigameNodes()
{
    //test
    //var material = new THREE.MeshNormalMaterial();

    //var sphereGeometry = new THREE.SphereGeometry( 50, 32, 16 );
    //var sphere = new THREE.Mesh( sphereGeometry, material );
    //sphere.position.set( -60, 55, 0 );
    //scene.add( sphere );

    //var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.BackSide } );
    //var outlineMesh1 = new THREE.Mesh( sphereGeometry, outlineMaterial1 );
    //outlineMesh1.position.set( -60, 55, 0);
    //outlineMesh1.scale.multiplyScalar( 1.05 );
    //scene.add( outlineMesh1 );


    var outlineMat       = new THREE.MeshPhongMaterial( { color: 0xFF0000, side: THREE.BackSide, emissive: 0xFF0000 } );
    var outlineThickness = 1.1;

    //  Init the models
    //  1. Rock
    var rock_dim          = new THREE.Vector3( 10, 8, 10 );

    minigame_rock         = new THREE.Mesh( new THREE.CubeGeometry( rock_dim.x, rock_dim.y, rock_dim.z ),
                                            new THREE.MeshPhongMaterial( { color: 0xBBBBBB } ) );
    minigame_rock_outline = new THREE.Mesh( minigame_rock.geometry,
                                            outlineMat );
    minigame_rock_outline.scale.multiplyScalar( outlineThickness );

    //  2. Water
    var water_dim   = new THREE.Vector3( 10, 8, 10 );

    minigame_water  = new THREE.Mesh( new THREE.CubeGeometry( water_dim.x, water_dim.y, water_dim.z ),
                                      new THREE.MeshPhongMaterial( { color: 0x0000FF } ) );

    minigame_water_outline = new THREE.Mesh( minigame_water.geometry,
                                             outlineMat );
    minigame_water_outline.scale.multiplyScalar( outlineThickness );
    minigame_water_outline.visible = false;

    //  3. Tree
    var tree_dim    = new THREE.Vector3( 5, 20, 5 );
    var leaves_dim  = new THREE.Vector3( 8, 8, 8 );

    minigame_tree   = new THREE.Mesh( new THREE.CubeGeometry( tree_dim.x, tree_dim.y, tree_dim.z ),
                                      new THREE.MeshPhongMaterial( { color: 0xAAAA22 } ) );
    tree_leaves     = new THREE.Mesh( new THREE.CubeGeometry( leaves_dim.x, leaves_dim.y, leaves_dim.z ),
                                      new THREE.MeshPhongMaterial( { color: 0x00FF00 } ) );

    tree_leaves.position.y = tree_dim.y / 2 + leaves_dim.y / 2;

    var outlineGeom =  minigame_tree.geometry;
    minigame_tree.updateMatrix();
    outlineGeom.merge( minigame_tree.geometry, minigame_tree.matrix );
    tree_leaves.updateMatrix();
    outlineGeom.merge(   tree_leaves.geometry,   tree_leaves.matrix );

    minigame_tree.add( tree_leaves );

    minigame_tree_outline = new THREE.Mesh( outlineGeom,
                                            outlineMat );
    minigame_tree_outline.scale.multiplyScalar( outlineThickness );
    minigame_tree_outline.visible = false;

    //  Generate map coordinates for each minigame
    nodeCoordinates = [];
    for ( var i = 0; i < 3; i++ )
    {
        do
        {
            var xpos = randBetween( -dim / 2, dim / 2 - 1 );
            var zpos = randBetween( -dim / 2, dim / 2 - 1 );
            var ypos = field[Math.round( middle.x + zpos )][Math.round( middle.y + xpos )];
        }
        while ( ypos < WATERLEVEL );

        //TODO: Check for overlapping

        nodeCoordinates.push( new THREE.Vector3( xpos, ypos, zpos ) );
    }

    minigame_rock.position.x  = minigame_rock_outline.position.x  = nodeCoordinates[0].x;
    minigame_rock.position.y  = minigame_rock_outline.position.y  = nodeCoordinates[0].y + rock_dim.y  / 2 - 1;
    minigame_rock.position.z  = minigame_rock_outline.position.z  = nodeCoordinates[0].z;

    minigame_water.position.x = minigame_water_outline.position.x = nodeCoordinates[1].x;
    minigame_water.position.y = minigame_water_outline.position.y = nodeCoordinates[1].y + water_dim.y / 2 - 1;
    minigame_water.position.z = minigame_water_outline.position.z = nodeCoordinates[1].z;

    minigame_tree.position.x  = minigame_tree_outline.position.x  = nodeCoordinates[2].x;
    minigame_tree.position.y  = minigame_tree_outline.position.y  = nodeCoordinates[2].y + tree_dim.y  / 2 - 1;
    minigame_tree.position.z  = minigame_tree_outline.position.z  = nodeCoordinates[2].z;

    scene.add( minigame_rock );
    scene.add( minigame_rock_outline );
    scene.add( minigame_water );
    scene.add( minigame_water_outline );
    scene.add( minigame_tree );
    scene.add( minigame_tree_outline );

    OnMinigameAvailabilityChanged( 1, true );
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
    directionalLight                        = new THREE.DirectionalLight( 0xFFFFFF, LIGHTSTR );
    directionalLight.position.set( SUN_POSITION.x * 20, SUN_POSITION.y * 20, SUN_POSITION.z * 20 );
    directionalLight.castShadow             = false;
    var shadowCamDist                       = 10;
    directionalLight.shadowCameraRight      = shadowCamDist;
    directionalLight.shadowCameraLeft       = -shadowCamDist;
    directionalLight.shadowCameraTop        = shadowCamDist;
    directionalLight.shadowCameraBottom     = -shadowCamDist;
    directionalLight.shadowCameraFar        = shadowCamDist * 2;
    //directionalLight.shadowMapHeight        =
    //directionalLight.shadowMapWidth         = 8192;
    //scene.add( new THREE.CameraHelper( directionalLight.shadow.camera ) );

    //  Opposing sun light (fake light reflected from water to lighten shadows)
    directionalLight2 = new THREE.DirectionalLight( OPPOSITE_LIGHTCOL, OPPOSITE_LIGHTSTR );
    directionalLight2.position.set( -SUN_POSITION.x, SUN_POSITION.y, -SUN_POSITION.z );
}

//  Caution: Mostly debug stuff still
function animate()
{
    stats.begin();

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



    //var scaleMult = 1.15 + Math.sin(Date.now() / 1500) / 5;

    //if(minigame_rock_outline.visible)
    //{
    //    minigame_rock_outline.scale.set( scaleMult, scaleMult, scaleMult );
    //}
    //if(minigame_water_outline.visible)
    //{
    //    minigame_water_outline.scale.set( scaleMult, scaleMult, scaleMult );
    //}
    //if(minigame_tree_outline.visible)
    //{
    //    minigame_tree_outline.scale.set( scaleMult, scaleMult, scaleMult );
    //}

    if (!isInMenu)
    {
        //controls.autoRotate = false;    //Todo: Better way to handle autorotating while in menu
        /*  UPDATE SCENE HERE */

        //for ( var i = 0; i < weazles.length; i++ )
        //{
        //    weazles[i].moveRandomly();

        //}
        
        

        //camera.updateProjectionMatrix();

    }
    else
    {
        //SET THESE TO AUTOMATICALLY ROTATE, FOR EXAMPLE WHEN VIEWING STATUE
        //controls.autoRotate = true;
    }
           
    //  continue render loop

    if ( waterCreated )
    {
        //waterPlane.position.y = WATERLEVEL - Math.sin( Date.now() / 1500 );
        water.material.uniforms.time.value += 0.005;
        water.render();
    }

    //controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
    
    requestAnimationFrame(animate);
    //stats.update();
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

    if ( !controls.enabled )
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
        else if ( intersects[0].object == minigame_tree || intersects[0].object == tree_leaves  )
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
}

//------------------------------------------------------//
//             INTERFACE IMPLEMENTATION                 //
//------------------------------------------------------//
function OnStatueModelChanged( minigameID )
{
    //  1. Remove existing statue segment at that position
    if ( test_statues[minigameID] != null )
    {
        var oldSegmentMesh = test_statues[minigameID];
    }

    //  2. Create new statue segment
    var segmentGeom    = new THREE.BoxGeometry( STATUE_DIMENSIONS.x / minigameID, STATUE_DIMENSIONS.y, STATUE_DIMENSIONS.z / minigameID );

    var minigameWon    = getMinigameState( minigameID, 2 );
    var minigamePlayed = getMinigameState( minigameID, 1 );

    var segmentMat     = minigameWon == 1
                       ? STATUE_WOOD_MAT
                       : minigameWon == 2
                       ? STATUE_BRONZE_MAT
                       : minigameWon == 3
                       ? STATUE_SILVER_MAT
                       : STATUE_GOLD_MAT;

    var segmentMesh            = new THREE.Mesh( segmentGeom, segmentMat );
        segmentMesh.castShadow = true;
        segmentMesh.position.y = STATUE_DIMENSIONS.z * ( minigameID - 1 ) + field[middle.x][middle.y];

    test_statues[minigameID]   = segmentMesh;

    //  Show message
    if ( showTutorials )
    {
        switch ( minigamePlayed )
        {
            case 1:
                showMessageBox( getFirstSegmentBuiltText( minigameID ),
                                segmentBuiltEndText,
                                function () { changeStatueModel( oldSegmentMesh, segmentMesh ) } );
                break;
            case 4:
                showMessageBox( getLastSegmentBuiltText( minigameID ),
                                segmentBuiltEndText,
                                function () { changeStatueModel( oldSegmentMesh, segmentMesh ) } );
                break;
            default:
                showMessageBox( getNextSegmentBuiltText( minigameID ),
                                segmentBuiltEndText,
                                function () { changeStatueModel( oldSegmentMesh, segmentMesh ) } );
                break;
        }
    }
    else
    {
        changeStatueModel( oldSegmentMesh, segmentMesh );
    }
    

    //  Move camera to statue
    //TODO: Animation

    //  Add statue segment
    //TODO: Animation

}

function changeStatueModel( oldSegmentMesh, mesh )
{
    controls.enabled     = false;

    oldRad           = spherical.radius;
    oldRotateSpeed   = controls.autoRotateSpeed;

    targetRad        = 30;
    targetRotateSpd  = 5;
    zoomInTime       = 1500;
    zoomOutTime      = 1000;
    segmentBuildTime = 2000;
    timeUntilZoomOut = 2000;

    controls.autoRotate  = true;

    ShowStatue(function()
    {
        // > Segment build animation here <

        setTimeout( function ()
        {
            if ( oldSegmentMesh )
            {
                clickable_objects.splice( oldSegmentMesh );
                scene.remove( oldSegmentMesh );
            }
            clickable_objects.push( mesh );
            scene.add( mesh );
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
                minigame_rock_outline.visible = true;
                break;
            case 2:
                clickable_objects.push( minigame_water );
                minigame_water_outline.visible = true;
                break;
            case 3:
                clickable_objects.push( minigame_tree );
                minigame_tree_outline.visible = true;
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
                minigame_rock_outline.visible = false;
                break;
            case 2:
                clickable_objects.splice( minigame_water, 1 );
                minigame_water_outline.visible = false;
                break;
            case 3:
                clickable_objects.splice( minigame_tree, 1 );
                minigame_tree_outline.visible = false;
                break;
        }
    }

}

main();