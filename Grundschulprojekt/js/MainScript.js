//  GLOBALS
isInMenu           = true;
preventRaycastOnce = false;

//  CONSTANTS
const PAUSE_IN_MENU      = true;
const WATERLEVEL         = -0.02;
const WINDOW_CLEAR_COLOR = 0x0066BB;
const TERRAIN_RESOLUTION = 8;
const TERRAIN_OFFSET     = 30000;
const SUN_POSITION       = new THREE.Vector3( 1024, 1024, 1024 );
const RAFT_DIMENSIONS    = new THREE.Vector3( 10, 10, 0.5 );

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
    scene.fog        = new THREE.FogExp2( 0xcccccc, 0.002 );
    scene.rotation.x = degreeToRad( 270 );

    //  RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( WINDOW_CLEAR_COLOR );

    var container = document.getElementById("mainGame");
    container.appendChild( renderer.domElement );

    //  CAMERA
    camera            = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2048);
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 35;
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    //      CAMERA CONTROLS
    controls                = new THREE.OrbitControls( camera, renderer.domElement );

    controls.minDistance    = 10;
    controls.maxDistance    = 100;

    controls.minPolarAngle  = degreeToRad( 15 ); //  | (0)   |/  (~15)    |_ (90) 
    controls.maxPolarAngle  = degreeToRad( 70 );

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
    //var islandMat   = new THREE.MeshPhongMaterial( { color: 0xDDDDDD } );//GenerateIslandMaterial( islandGeom, SUN_POSITION );
    var texture = THREE.ImageUtils.loadTexture( 'img/sand.jpg' );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 10, 10 );

    var islandMat   = new THREE.MeshPhongMaterial( { map: texture } );
    islandMesh      = new THREE.Mesh( islandGeom, islandMat );

    //      WATER
    var waterGeom   = new THREE.PlaneGeometry( 1024, 1024, 1, 1 );
    var waterMat    = new THREE.MeshPhongMaterial( { color: 0x0088DD, transparent: true, opacity: 0.9, specular: 0xFFFFFF, shininess: 5 } );
    waterMesh       = new THREE.Mesh( waterGeom, waterMat );
    waterMesh.position.z = WATERLEVEL;

    //      WEAZLE RAFT
    var raftGeom        = new THREE.CubeGeometry( RAFT_DIMENSIONS.x, RAFT_DIMENSIONS.y, RAFT_DIMENSIONS.z );
    var raftTexture     = THREE.ImageUtils.loadTexture( 'img/wood_box.jpg' );
    raftTexture.wrapS   = texture.wrapT = THREE.RepeatWrapping;
    raftTexture.repeat.set( 1, 1 );
    var raftMat         = new THREE.MeshPhongMaterial( { map: raftTexture } );
    raftMesh            = new THREE.Mesh( raftGeom, raftMat );
    
    //      TEST_WEAZLE
    var test_weazle_geom = new THREE.CubeGeometry( 0.1, 0.1, 0.5 );
    var test_weazle_mat  = new THREE.MeshBasicMaterial( { color: 0x0000FF } );
    test_weazle          = new THREE.Mesh( test_weazle_geom, test_weazle_mat );
    test_weazle.position.z = RAFT_DIMENSIONS.z / 2 + 0.25;
    var head = new THREE.Mesh( new THREE.SphereGeometry( 0.125, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x0000FF } ) );
    head.position.z = 0.3;
    test_weazle.add( head );

    //      SUN MESH
    var sunGeom     = new THREE.SphereGeometry( 128, 32, 32 );
    var sunMat      = new THREE.MeshBasicMaterial( { color: 0xFFFCBB } );
    sunMat.fog      = false;
    var sunMesh     = new THREE.Mesh( sunGeom, sunMat );

    sunMesh.position.x = SUN_POSITION.x;
    sunMesh.position.y = SUN_POSITION.y;
    sunMesh.position.z = SUN_POSITION.z / 2;

    //      SUN LIGHT
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
    directionalLight.position.set( SUN_POSITION.x, SUN_POSITION.y, SUN_POSITION.z );

    //  PLACE INTO SCENE
    waterMesh.add( raftMesh );
    raftMesh .add( test_weazle )
    scene    .add( islandMesh );
    scene    .add( waterMesh );
    scene    .add( sunMesh );

    scene    .add( directionalLight );

    //  EVENT BINDING
    document.addEventListener( 'mousedown' , onDocumentMouseDown , false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    window  .addEventListener( 'resize'    , onWindowResize      , false );

    onWindowResize();
}

function animate()
{
    if (!isInMenu)
    {

        /*  UPDATE SCENE HERE */
        if ( Math.random() <= 0.01 )
        {
            test_weazle.position.x = ( Math.random() * RAFT_DIMENSIONS.x ) - RAFT_DIMENSIONS.x / 2;
            test_weazle.position.y = ( Math.random() * RAFT_DIMENSIONS.y ) - RAFT_DIMENSIONS.y / 2;
        }

        waterMesh.position.z = WATERLEVEL + Math.sin(Date.now() / 1500) / 2.5;
        camera.updateProjectionMatrix();
    }

    //  continue render loop
    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
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

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

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
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    objects = [ raftMesh ];
    var intersects = raycaster.intersectObjects(objects);

    if ( intersects.length > 0 )
    {

        intersects[0].object.material.color.setHex(Math.random() * 0xffffff);

    }

}

main();