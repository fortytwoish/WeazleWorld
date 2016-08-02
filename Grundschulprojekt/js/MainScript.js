//  GLOBALS
isInMenu           = true;
preventRaycastOnce = false;

//  CONSTANTS
const PAUSE_IN_MENU      = true;
const WATERLEVEL         = 0;
const WINDOW_CLEAR_COLOR = 0x4FABFF;
const FOG_COLOR          = 0x4FABFF;
const TERRAIN_RESOLUTION = 10;
const TERRAIN_OFFSET     = 400;
const SUN_POSITION       = new THREE.Vector3( 1, 1, 1 ).normalize();
const VILLAGE_DIMENSIONS = new THREE.Vector3( 20, 20, WATERLEVEL + 4);

//  LOCALS
var camera,
    scene,
    renderer,
    islandMesh,
    waterMesh,
    raftMesh,
    test_weazle;

function main()
{
    init();
    animate();
}

function init()
{
    //  SCENE
    scene            = new THREE.Scene();
    scene.fog        = new THREE.FogExp2( FOG_COLOR, 0.0004 );

    //  RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( WINDOW_CLEAR_COLOR );

    //  CAMERA
    camera            = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4096);
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 35;
    camera.lookAt( new THREE.Vector3( 0, 50, 0 ) );

    //      CAMERA CONTROLS
    controls                = new THREE.OrbitControls( camera, renderer.domElement );

    controls.minDistance    = 10;
    controls.maxDistance    = 400;

    controls.minPolarAngle  = degreeToRad( 10 ); //  | (0)   |/  (~15)    |_ (90) 
    controls.maxPolarAngle  = degreeToRad( 75 );

    controls.enableDamping  = false; //TODO: Enable this for touchscreens

    controls.enablePan      = false;

    controls.rotateSpeed    = 1;
    controls.zoomSpeed      = 2;
    //SET THESE TO AUTOMATICALLY ROTATE, FOR EXAMPLE WHEN VIEWING STATUE
    //controls.autoRotate = true;
    //controls.autoRotateSpeed = 0.1;

    //      ISLAND
    var islandGeom  = GenerateIsland(TERRAIN_RESOLUTION, WATERLEVEL);
    
    /* texture test */
    var islandMat     = new THREE.MeshPhongMaterial( { map: GenerateShadowMapTexture( islandGeom, SUN_POSITION ) } );
    islandMat.shading = THREE.FlatShading;
    islandMesh        = new THREE.Mesh( islandGeom, islandMat );

    //      WATER
    var waterGeom   = new THREE.PlaneBufferGeometry( 16384, 16384, 1, 1 );
    var waterMat    = new THREE.MeshPhongMaterial( { color: 0x0088DD, transparent: true, opacity: 0.9, specular: 0xFFFFFF, shininess: 10 } );
    waterMesh       = new THREE.Mesh( waterGeom, waterMat );
    waterMesh.position.z = WATERLEVEL;
    waterMesh.rotation.x = degreeToRad( -90 );
    
    //      TEST_WEAZLE
    var test_weazle_geom = new THREE.CubeGeometry( 0.1, 0.5, 0.1 );
    var test_weazle_mat = new THREE.MeshBasicMaterial( { color: 0xFF3C22 } );
    test_weazle = new THREE.Mesh( test_weazle_geom, test_weazle_mat );
    //test_weazle.rotation.y = -Math.PI;
    test_weazle.position.x = 0;
    test_weazle.position.y = VILLAGE_DIMENSIONS.z + 0.25;
    test_weazle.position.z = 0;
    var head = new THREE.Mesh( new THREE.SphereGeometry( 0.125, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xDDCC77 } ) );
    head.position.y = 0.3;
    test_weazle.add( head );
    test_weazle.add( new THREE.PointLight() );

    //      SUN LIGHT
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( SUN_POSITION.x, SUN_POSITION.y, SUN_POSITION.z );

    //  PLACE INTO SCENE
    scene    .add( test_weazle )
    scene    .add( islandMesh );
    scene    .add( waterMesh );

    scene    .add( directionalLight );

    //  EVENT BINDING
    document.addEventListener( 'mousedown' , onDocumentMouseDown , false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    window  .addEventListener( 'resize'    , onWindowResize      , false );

    var container = document.getElementById( "mainGame" );
    container.appendChild( renderer.domElement );

    stats         = new Stats();
    document.body.appendChild( stats.dom );

    onWindowResize();
}

function animate()
{
    stats.begin();
    if (!isInMenu)
    {

        /*  UPDATE SCENE HERE */
        if ( Math.random() <= 0.01 )
        {
            //  teleport around village bounds
            test_weazle.position.x = ( Math.random() * VILLAGE_DIMENSIONS.x ) - VILLAGE_DIMENSIONS.x / 2;
            test_weazle.position.y = field[middle.x][middle.y] + 0.25;
            test_weazle.position.z = ( Math.random() * VILLAGE_DIMENSIONS.y ) - VILLAGE_DIMENSIONS.y / 2;
        }

                                                                //speed
        waterMesh.position.y = WATERLEVEL - Math.sin(Date.now() / 1500);
        camera.updateProjectionMatrix();
        //stats.update();
    }

    //  continue render loop
    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
    stats.end();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

//  EVENT HANDLERS
$( function ()
{
    
    $(".blockRaycast").mousedown(function ()
    {
        preventRaycastOnce = true;
    } );


    $( "#menuButton" ).click( function ()
    {
        if ( isInMenu )
        {
            return;
        }
        isInMenu = true;

        $( "#menu" ).css( "visibility", "visible" );
        $( "#menuButton" ).css( "visibility", "hidden" );
    } );

    //Test, to be replaced by clicks on the island's objects
    $( "#minigameButton" ).click( function ()
    {
        if ( isInMenu )
        {
            return;
        }
        isInMenu = true;

        minigameID = prompt( "Which minigame? (1-3)" );
        console.log( "minigame button clicked." );
        $( "#minigame" ).css( "visibility", "visible" );
        console.log( "Reading: " + "html/minigame" + minigameID + ".html" );
        $.get( "html/minigame" + minigameID + ".html", function ( data )
        {
            console.log( "Contents: " + data );
            $( "#minigame" ).html( data );
        } );

    } );    

    //Menu Buttons - to be moved into menu.html
    $( "#continueButton" ).click( function ()
    {
        isInMenu = false;

        $( "#menu" )      .css( "visibility", "hidden" );
        $( "#menuButton" ).css( "visibility", "visible" );
    } );
});

function onWindowResize()
{
    var scrollbarSize = 7;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth - scrollbarSize, window.innerHeight - scrollbarSize );

}

raycaster = new THREE.Raycaster();
mouse     = new THREE.Vector2();

//  Translate touch to mouseclick
function onDocumentTouchStart( event )
{

    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown(event);

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

        intersects[0].object.material.color.setHex(Math.random() * 0xffffff);

    }

}

main();