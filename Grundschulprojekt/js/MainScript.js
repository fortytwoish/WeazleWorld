//  GLOBALS
isInMenu           = true;
preventRaycastOnce = false;
TERRAIN_OFFSET     = 200;
TERRAIN_RESOLUTION = 9;

//  CONSTANTS
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


//  LOCALS
var camera,
    scene,
    renderer,
    islandMesh,
    waterMesh,
    raftMesh,
    test_weazle,
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
    //                  SCENE                               //
    //------------------------------------------------------//
    scene            = new THREE.Scene();
    scene.fog        = new THREE.FogExp2( FOG_COLOR, 0.0004 );

    //------------------------------------------------------//
    //                  RENDERER                            //
    //------------------------------------------------------//
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( WINDOW_CLEAR_COLOR );

    //------------------------------------------------------//
    //                  CAMERA                              //
    //------------------------------------------------------//
    camera            = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 4, 3000000 );
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 35;
    camera.lookAt( new THREE.Vector3( 0, 50, 0 ) );

    //------------------------------------------------------//
    //                  CAMERA CONTROLS                     //
    //------------------------------------------------------//
    controls                 = new THREE.OrbitControls( camera, renderer.domElement );

    controls.minDistance     = 30;
    controls.maxDistance     = Math.pow(2, TERRAIN_RESOLUTION - 1);

    controls.minPolarAngle   = degreeToRad( 5 );     //  | (0)   |/  (~15)    |_ (90) 
    controls.maxPolarAngle   = degreeToRad( 85 );

    controls.enableDamping   = false; //TODO: Enable this for touchscreens

    controls.enablePan      = false;

    controls.rotateSpeed     = 1;
    controls.autoRotateSpeed = 1;
    controls.zoomSpeed       = 1;

    //------------------------------------------------------//
    //                  ISLAND                               //
    //------------------------------------------------------//
    var islandGeom       = GenerateIsland(TERRAIN_RESOLUTION, WATERLEVEL);
    var islandMat        = new THREE.MeshPhongMaterial( { map: GenerateMaterial( islandGeom, SUN_POSITION ) } );
    islandMat.shading    = THREE.FlatShading;
    islandMesh           = new THREE.Mesh( islandGeom, islandMat );

    //------------------------------------------------------//
    //                  WATER                               //
    //------------------------------------------------------//
    var textureLoader = new THREE.TextureLoader();

    textureLoader.load( 'img/waternormals.jpg', function (loadedTexture) //Called when the texture has finished loading
    {
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;

        water = new THREE.Water( renderer, camera, scene,
        {
            //  Optional Parameters
            textureWidth:    1024,
            textureHeight:   1024,
            waterNormals:    loadedTexture,
            alpha:           0.9,
            waterColor:      WATERCOLOR,
            distortionScale: 15
        } );

        var planeGeom           = new THREE.PlaneBufferGeometry( 8192, 8192, 10, 10 );

        waterPlane              = new THREE.Mesh( planeGeom, water.material );
        waterPlane.rotation.x   = -Math.PI * 0.5;
        waterPlane.add( water );

        scene.add( waterPlane );

        waterCreated = true;
    });
    
    //  TEST_WEAZLE
    var test_weazle_geom    = new THREE.CubeGeometry( 0.1, 0.5, 0.1 );
    var test_weazle_mat     = new THREE.MeshBasicMaterial( { color: 0xFF3C22 } );
    test_weazle             = new THREE.Mesh( test_weazle_geom, test_weazle_mat );
    test_weazle.position.x  = 0;
    test_weazle.position.y  = VILLAGE_DIMENSIONS.z + 0.25;
    test_weazle.position.z  = 0;
    var head                = new THREE.Mesh( new THREE.SphereGeometry( 0.125, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xDDCC77 } ) );
    head.position.y         = 0.3;
    test_weazle.add( head );
    test_light              = new THREE.PointLight( 0xCC6611, 2, 4, 0 );
    test_light.position.y   = 2;
    test_weazle.add( test_light );

    //------------------------------------------------------//
    //                  SUN LIGHT                           //
    //------------------------------------------------------//
    var directionalLight  = new THREE.DirectionalLight( 0xFFFFFF, LIGHTSTR );
        directionalLight.position.set( SUN_POSITION.x, SUN_POSITION.y, SUN_POSITION.z );

    //  Opposing sun light (fake light reflected from water to lighten shadows)
    var directionalLight2 = new THREE.DirectionalLight( OPPOSITE_LIGHTCOL, OPPOSITE_LIGHTSTR );
        directionalLight2.position.set( -SUN_POSITION.x, SUN_POSITION.y, -SUN_POSITION.z );

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

//  Caution: Mostly debug stuff still
function animate()
{
    //  Prevent camera collision
    var terrainAtCameraPos = field[Math.round( middle.x + camera.position.z )][Math.round( middle.y + camera.position.x )];

    if ( camera.position.y <= terrainAtCameraPos + 10 )
    {
        camera.position.y = terrainAtCameraPos + 10;
    }

    stats.begin();
    if (!isInMenu)
    {
        controls.autoRotate = false;    //Todo: Better way to handle autorotating while in menu
        /*  UPDATE SCENE HERE */
        if ( Math.random() <= 0.01 )
        {
            //  teleport weazle around village bounds
            test_weazle.position.x = ( Math.random() * VILLAGE_DIMENSIONS.x ) - VILLAGE_DIMENSIONS.x / 2;
            test_weazle.position.y = field[Math.round( middle.x + test_weazle.position.z )][Math.round( middle.y + test_weazle.position.x )] + 0.25;
            test_weazle.position.z = ( Math.random() * VILLAGE_DIMENSIONS.y ) - VILLAGE_DIMENSIONS.y / 2;
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
			console.log("Creating new terrain: " + terrainRes);

			//Generate new terrain
			setQuality_TerrainResDependant(terrainRes);
			controls.update(); //Necessary to bring the camera into bounds

			//      ISLAND
			var islandGeom 		 = GenerateIsland(terrainRes, WATERLEVEL);
			
			/* texture test */
			var islandMat        = new THREE.MeshPhongMaterial( { map: GenerateMaterial( islandGeom, SUN_POSITION ) } );
			islandMat.shading    = THREE.FlatShading;
			
			scene.remove(islandMesh);
			islandMesh = new THREE.Mesh( islandGeom, islandMat );
			scene.add(islandMesh);
		}
		else
		{
			//	Cancel was pressed
		}
	} );

    $( "#menuButton" ).click( function ()
    {
        isInMenu = true;
        $( "#menu" ).css( "visibility", "visible" );
		
        $("#menuButton").css("visibility", "hidden");
        $("#minigameButton").css("visibility", "hidden");
		$("#newMapButton").css("visibility", "hidden");
    } );

    //Test, to be replaced by clicks on the island's objects
    $( "#minigameButton" ).click( function ()
    {
        var minigameID = prompt("Which minigame? (1-3)");

        if (minigameID != null)
        {
            isInMenu = true;
            $("#minigame").css("visibility", "visible");
			
            $("#menuButton").css("visibility", "hidden");
            $("#minigameButton").css("visibility", "hidden");
			$("#newMapButton").css("visibility", "hidden");
            console.log("minigame button clicked.");

            console.log("Reading: " + "html/minigame" + minigameID + ".html");
            $.get("html/minigame" + minigameID + ".html", function (data) {
                console.log("Contents: " + data);
                $("#minigame").html(data);
            });
        }
        else
        {
            //Cancel was pressed
        }



    });

    $("#showMessageBoxButton").click(function () {

        console.log("Toggling Messagebox");
        $("#messageBox").css("visibility", "visible");
        $("#messageBox").toggle("slow");

    });

    $("#messsageBoxButton").click(function () {
        $("#messageBoxContentParagraph").text(" ");

        $("#messageBoxContentParagraph").append(getNextMessageBoxText());
    });
    

    //Menu Buttons - to be moved into menu.html
    $( "#continueButton" ).click( function ()
    {
        isInMenu = false;

        $( "#menu" )      .css( "visibility", "hidden" );
        $( "#menuButton" ).css( "visibility", "visible" );
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

    mouse.x =  (event.clientX / renderer.domElement.clientWidth)  * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    objects = [ test_weazle ];
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

main();