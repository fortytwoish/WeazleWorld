//  GLOBALS
isInMenu           = true;
preventRaycastOnce = false;
TERRAIN_OFFSET     = 0;
TERRAIN_RESOLUTION = 0;
GRASS_DENSITY = 1;

//  CONSTANTS
const DEFAULT_QUALITY    = 1;
const PAUSE_IN_MENU      = true;
const WATERLEVEL         = 0;
const WATERCOLOR         = 0x55AAAA;
const WATERCOLOR_LOW     = 0x228888;
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
const WEAZLE_AMOUNT      = 8;


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
    placedMinigameNodes          = false,
    decorationSpriteMeshes,
    activeMinigameNodeIndex;

clickable_objects = [];
waterCreated = false;

function main()
{
    initStaticElements();
}

function initStaticElements()
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
    camera            = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 5, 3000000 );
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

    controls.enableDamping   = false; //TODO: Enable this for touchscreens maybe?
    controls.enabled         = false;
    controls.enablePan       = false;

    controls.rotateSpeed     = 1;
    controls.autoRotateSpeed = 1;
    controls.autoRotate      = true;
    controls.zoomSpeed       = 1;

    controls.target          = new THREE.Vector3( 0, 10, 0 );

    initWeazles();

    initStatueSegments();

    initStatueParticleSystem();

    initLighting();

    //------------------------------------------------------//
    //                  -> SCENE                            //
    //------------------------------------------------------//

    scene.add( statueParticleSystem );
    scene.add( directionalLight );
    scene.add( directionalLight2 );

    //------------------------------------------------------//
    //                  EVENT BINDING                       //
    //------------------------------------------------------//
    window.addEventListener(   'resize'    , onWindowResize, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'click'     , onDocumentMouseClick, false );
    document.addEventListener( 'keydown'   , onkeydown           , false );

    handleWindowVisibility();

    stats = new Stats();

    //  Load non-static elements that change with quality setting
    loadQualityLevel();
}

//  Example by Andy E: http://stackoverflow.com/a/1060034
function handleWindowVisibility()
{
    var hidden = "hidden";

    // Standards:
    if ( hidden in document )
        document.addEventListener( "visibilitychange", onchange );
    else if ( ( hidden = "mozHidden" ) in document )
        document.addEventListener( "mozvisibilitychange", onchange );
    else if ( ( hidden = "webkitHidden" ) in document )
        document.addEventListener( "webkitvisibilitychange", onchange );
    else if ( ( hidden = "msHidden" ) in document )
        document.addEventListener( "msvisibilitychange", onchange );
        // IE 9 and lower:
    else if ( "onfocusin" in document )
        document.onfocusin = document.onfocusout = onchange;
        // All others:
    else
        window.onpageshow = window.onpagehide
        = window.onfocus = window.onblur = onchange;

    function onchange( evt )
    {

        var v = "visible", h = "hidden",
            evtMap = {
                focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
            };

        evt = evt || window.event;
        if ( evt.type in evtMap )
        {
            document.body.className = evtMap[evt.type];
        }
        else
        {
            document.body.className = this[hidden] ? "hidden" : "visible";
            if ( this[hidden] )
            {
                console.log( "pausing rendering... " );
                pauseRendering();
            }
            else
            {
                console.log( "resuming rendering... " );
                resumeRendering();
            }
        }

    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if ( document[hidden] !== undefined )
        onchange( { type: document[hidden] ? "blur" : "focus" } );
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
    var planeGeom         = new THREE.PlaneBufferGeometry( Math.pow( 2, TERRAIN_RESOLUTION + 1), Math.pow( 2, TERRAIN_RESOLUTION + 1 ), 1000, 1000 );
    waterMesh2            = new THREE.Mesh( planeGeom, new THREE.MeshPhongMaterial( { color: WATERCOLOR_LOW, transparent: false, shininess: 150} ) );
    waterMesh2.rotation.x = -Math.PI * 0.5;

    var textureLoader = new THREE.TextureLoader();

    textureLoader.load( 'img/waternormals.jpg', function ( loadedTexture ) //Called when the texture has finished loading
    {
        waterTexture       = loadedTexture;
        waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
        waterTexture.repeat.set( 4, 4 );

        waterMesh2.material.normalMap = waterTexture;

        water = new THREE.Water( renderer, camera, scene,
        {
            //  Optional Parameters
            textureWidth: 1024,
            textureHeight: 1024,
            waterNormals: waterTexture,
            alpha: 0.9,
            waterColor: WATERCOLOR,
            distortionScale: 15
        } );

        waterMesh = new THREE.Mesh( planeGeom, water.material );
        waterMesh.rotation.x = -Math.PI * 0.5;
        waterMesh.add( water );

        if ( renderWater )
        {
            scene.add( waterMesh );
        }
        else
        {
            scene.add( waterMesh2 );
        }

        waterCreated = true;
        asyncOperationFinished();

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

    scene.add( islandMesh );
}

function initIslandDecoration( density )
{
    differentSpriteCount = 5;

    grassCount = grass_positions.length;
    
    decorationSprites = [];
    for ( var i = 0; i < differentSpriteCount; i++ )
    {
        decorationSprites[i] = new THREE.Geometry();
    }
    
    grassMaterials = [
        new THREE.PointsMaterial(
        {
            color: 0xBBBBBB,
            size: 4,
            map: THREE.ImageUtils.loadTexture( "img/grass.png" ),
            transparent: true,
            alphaTest: 0.5
        } ),
        new THREE.PointsMaterial(
        {
            color: 0x999999,
            size: 4,
            map: THREE.ImageUtils.loadTexture( "img/grass.png" ),
            transparent: true,
            alphaTest: 0.5
        } ),
        new THREE.PointsMaterial(
        {
            color: 0x777777,
            size: 4,
            map: THREE.ImageUtils.loadTexture( "img/grass.png" ),
            transparent: true,
            alphaTest: 0.5
        } ),
        new THREE.PointsMaterial(
        {
            color: 0x779977,
            size: 4,
            map: THREE.ImageUtils.loadTexture( "img/grass.png" ),
            transparent: true,
            alphaTest: 0.5
        } ),
        new THREE.PointsMaterial(
        {
            color: 0x77BB77,
            size: 4,
            map: THREE.ImageUtils.loadTexture( "img/grass.png" ),
            transparent: true,
            alphaTest: 0.5
        } )
    ]

    for ( var i = 0; i < differentSpriteCount; i++ )
    {
        for ( j = 0; j < grassCount; j += (differentSpriteCount * density) )
        {
            if( grass_positions[i + j] )
            {
                for ( var k = 0; k < 5; k++ )
                {
                    var coord = new THREE.Vector3();
                    coord.x = grass_positions[i + j].x + randBetween( -1, 1 );
                    coord.y = grass_positions[i + j].y + randBetween( -1, 1 );
                    coord.z = grass_positions[i + j].z + randBetween(-0.1, 0.1);
                    decorationSprites[i].vertices.push( coord );
                }
            }
        }
    }

    // Create the particle system
    decorationSpriteMeshes = [];

    for ( var i = 0; i < differentSpriteCount; i++ )
    {
        decorationSpriteMeshes[i] = new THREE.Points( decorationSprites[i], grassMaterials[i] );
        decorationSpriteMeshes[i].rotation.x = Math.PI / 2;
        scene.add( decorationSpriteMeshes[i] );
    }
}

function initWeazles()
{
    Weazle_init();

    weazles = [];
}

function onWeazleLoadingFinished()
{
    for ( var i = 0; i < WEAZLE_AMOUNT; i++ )
    {
        weazles[i] = new Weazle();
        scene.add( weazles[i].mesh );
    }
}

function initStatueSegments()
{
    var loader = new THREE.OBJLoader();

    loadStatueSegment( loader, 'Models/Statue_Bottom.obj', 1 );
    loadStatueSegment( loader, 'Models/Statue_Mid.obj'   , 2 );
    loadStatueSegment( loader, 'Models/Statue_Top.obj'   , 3);

    //Statue boundaries 
    var geom = new THREE.CubeGeometry(0.25, 2, 0.25);

    var boxes = [ new THREE.Mesh(geom, STATUE_WOOD_MAT),
                  new THREE.Mesh(geom, STATUE_WOOD_MAT),
                  new THREE.Mesh(geom, STATUE_WOOD_MAT),
                  new THREE.Mesh(geom, STATUE_WOOD_MAT)];

    boxes[0].position.set(-STATUE_DIST, VILLAGE_DIMENSIONS.z, -STATUE_DIST);
    boxes[1].position.set( STATUE_DIST, VILLAGE_DIMENSIONS.z, -STATUE_DIST);
    boxes[2].position.set(-STATUE_DIST, VILLAGE_DIMENSIONS.z,  STATUE_DIST);
    boxes[3].position.set( STATUE_DIST, VILLAGE_DIMENSIONS.z,  STATUE_DIST);

    scene.add(boxes[0]);
    scene.add(boxes[1]);
    scene.add(boxes[2]);
    scene.add(boxes[3]);
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
    particleCount = 500;

    // Particles are just individual vertices in a geometry
    // Create the geometry that will hold all of the vertices
    particles = new THREE.Geometry();

    // Create the vertices and add them to the particles geometry
    for ( var p = 0; p < particleCount; p++ )
    {
        //  Random point on the statue's circle
        var angle = Math.random() * Math.PI           * 2;
        var x     = Math.random() * Math.cos( angle ) * 5;
        var y     = 0;
        var z     = Math.random() * Math.sin( angle ) * 5;

        // Create the vertex
        var particle = new THREE.Vector3( x, y, z );

        // Add the vertex to the geometry
        particles.vertices.push( particle );
    }

    // Create the material that will be used to render each vertex of the geometry
    particleMaterial = new THREE.PointsMaterial(
            {
                color: 0xffffff,
                size:  7,
                map: THREE.ImageUtils.loadTexture( "img/smoke_puff.png" ),
                //blending: THREE.AdditiveBlending,
                transparent: true,
                alphaTest: 0.5
            } );

    // Create the particle system
    statueParticleSystem = new THREE.Points( particles, particleMaterial );
}

function initMinigameNodes()
{
    console.log( "initiating minigame nodes..." );
    var loader                        = new THREE.OBJLoader();

    minigame_rock_geom                = new THREE.Mesh(),
    minigame_rock_outline_geom        = new THREE.Mesh(),
    minigame_water_geom               = new THREE.Mesh(),
    minigame_water_outline_geom       = new THREE.Mesh(),
    minigame_palm_geom                = new THREE.Mesh(),
    minigame_palm_outline_geom        = new THREE.Mesh(),
    minigame_palm_leaves_geom         = new THREE.Mesh(),
    //minigame_palm_leaves_outline_geom = new THREE.Mesh();

    //  Init the models
    //  1. Rock
    loadNodeSegment( loader, 'Models/rock.obj',                   minigame_rock_geom );
    loadNodeSegment( loader, 'Models/rock_outline.obj',           minigame_rock_outline_geom );
    //  2. Water
    loadNodeSegment( loader, 'Models/well.obj',                   minigame_water_geom );
    //  3. palm
    loadNodeSegment( loader, 'Models/palm_trunk_low.obj',         minigame_palm_geom );
    loadNodeSegment( loader, 'Models/palm_trunk_outline_low.obj', minigame_palm_outline_geom );
    loadNodeSegment( loader, 'Models/palm_leaves_low.obj',        minigame_palm_leaves_geom );
    //loadNodeSegment( loader, 'Models/palm_leaves_outline_low.obj', minigame_palm_leaves_outline_geom );
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
                targetGeom.material = new THREE.MeshPhongMaterial();

                if ( targetGeom == minigame_palm_geom )
                {
                    new THREE.TextureLoader().load( 'img/palm_bark.png', function ( loadedTexture )
                    {
                        targetGeom.material.map = loadedTexture;
                        nodeLoaded();
                    } );
                }
                else if(targetGeom == minigame_palm_leaves_geom)
                {
                    new THREE.TextureLoader().load( 'img/palm leafs_low.png', function ( loadedTexture )
                    {
                        targetGeom.material.map = loadedTexture;
                        targetGeom.material.transparent = true;
                        targetGeom.material.alphaTest = 0.5;
                        nodeLoaded();
                    } );
                }
                else if ( targetGeom == minigame_rock_geom )
                {
                    new THREE.TextureLoader().load( 'img/rockTexture.png', function ( loadedTexture )
                    {
                        targetGeom.material.map = loadedTexture;
                        nodeLoaded();
                    } );
                }
                else if ( targetGeom == minigame_water_geom )
                {
                    
                    //console.log( child.material );
                    new THREE.TextureLoader().load( 'img/wellTexture.png', function ( loadedTexture )
                    {
                        targetGeom.material = child.material;
                        targetGeom.material.map = loadedTexture;
                        console.log( object );
                        nodeLoaded();
                    } );
                }
                else
                {
                    nodeLoaded();
                }
            }
        } );
    } );
}

var nodesLoaded = 0;
var nodesToLoad = 6;
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
    var outlineMatInv = new THREE.MeshBasicMaterial( { color: 0xFF0000, side: THREE.BackSide } );

    minigame_rock                         = [];
    minigame_rock_outline                 = [];
                                           
    minigame_water                        = [];
    minigame_water_outline                = [];
                                           
    minigame_palm                         = [];
    minigame_palm_leaves                  = [];
    minigame_palm_outline                 = [];
    //minigame_palm_leaves_outline                = [];

    for ( var i = 0; i < TRIES_PER_MINIGAME; i++ )
    {
        //  Generate meshes
        minigame_rock[i]                  = new THREE.Mesh( minigame_rock_geom         .geometry, minigame_rock_geom.material );
        minigame_rock_outline[i]          = new THREE.Mesh( minigame_rock_outline_geom .geometry, outlineMat );
                                                                                                  
        minigame_water[i]                 = new THREE.Mesh( minigame_water_geom        .geometry, minigame_water_geom.material  );
        minigame_water_outline[i]         = new THREE.Mesh( new THREE.CubeGeometry(8.5,12.75,8.5), outlineMatInv );
                                                                                                  
        minigame_palm[i]                  = new THREE.Mesh( minigame_palm_geom         .geometry, minigame_palm_geom       .material);
        minigame_palm_leaves[i]           = new THREE.Mesh( minigame_palm_leaves_geom  .geometry, minigame_palm_leaves_geom.material);
        minigame_palm_outline[i]          = new THREE.Mesh( minigame_palm_outline_geom .geometry, outlineMat );
        //minigame_palm_leaves_outline[i]   = new THREE.Mesh( minigame_palm_leaves_outline_geom.geometry, outlineMat );
                                          
        minigame_water_outline[i].visible = false;
        minigame_palm_outline[i].visible  = false;
        //minigame_palm_leaves_outline[i].visible = false;

    }

    placeMinigameNodes();
    asyncOperationFinished();

}

function placeMinigameNodes()
{
    
    //  Generate map coordinates for each minigame
    nodeCoordinates = [];
    var halfDim = dim / 2;

    var validDistance = 50;
    //---------------------------------------------------------------//
    //  Valid placement criteria:                                    //
    //                                                               //
    //  - Above water                                                //
    //  - Below the mountain line (Beach or Grass)                   //
    //  - Outside the village                                        //
    //  - Less than x% away from the center (follows from the RNG)   //
    //  - Sufficiently far away (validDistance) from any             //
    //     other minigame node                                       //
    //---------------------------------------------------------------//
    for ( var i = 0; i < 3 * TRIES_PER_MINIGAME; i++ )
    {
        do
        {
            var xpos = randBetween( -halfDim * 0.65, (halfDim - 1) * 0.65 );
            var zpos = randBetween( -halfDim * 0.65, (halfDim - 1) * 0.65 );
            var ypos = field[Math.round( middle.x + zpos )][Math.round( middle.y + xpos )];
        }
        while (    ypos < WATERLEVEL
                || ypos > TREE_HEIGHT
                || distanceSquared(new Point(xpos, zpos), new Point(0, 0)) < islandRadius * islandRadius
                || isAnyCoordinateCloserThan2D( nodeCoordinates, xpos, zpos, 10 ) );

        //  TODO: Check for overlapping
        //  TODO: Check for distance to middle and border

        nodeCoordinates.push( new THREE.Vector3( xpos, ypos, zpos ) );
    }

    var rock_height  =  0;
    var water_height = -1;
    var palm_height  = -1;

    for ( var i = 0; i < TRIES_PER_MINIGAME; i++ )
    {
        //  Rock
        minigame_rock[i].position.x        = minigame_rock_outline[i].position.x        = nodeCoordinates[i * 3].x;
        minigame_rock[i].position.y        = minigame_rock_outline[i].position.y        = nodeCoordinates[i * 3].y + rock_height;
        minigame_rock[i].position.z        = minigame_rock_outline[i].position.z        = nodeCoordinates[i * 3].z;
        var randScl = randBetween(0.6, 1);
        minigame_rock[i].scale.set( randScl, randScl, randScl );
        minigame_rock_outline[i].scale.set( randScl, randScl, randScl );
        //  Water
        minigame_water[i].position.x       = minigame_water_outline[i].position.x       = nodeCoordinates[i * 3 + 1].x;
        minigame_water[i].position.y       = minigame_water_outline[i].position.y       = nodeCoordinates[i * 3 + 1].y + water_height;
        minigame_water[i].position.z       = minigame_water_outline[i].position.z       = nodeCoordinates[i * 3 + 1].z;
        minigame_water[i].scale.set( 0.5, 0.75, 0.5 ); 
        //  Palm
        minigame_palm[i].position.x        = minigame_palm_outline[i].position.x        =
        minigame_palm_leaves[i].position.x = /*minigame_palm_leaves_outline[i].position.x =*/ nodeCoordinates[i * 3 + 2].x;
        minigame_palm[i].position.y        = minigame_palm_outline[i].position.y        =
        minigame_palm_leaves[i].position.y = /*minigame_palm_leaves_outline[i].position.y =*/ nodeCoordinates[i * 3 + 2].y + palm_height;
        minigame_palm[i].position.z        = minigame_palm_outline[i].position.z        =
        minigame_palm_leaves[i].position.z = /*minigame_palm_leaves_outline[i].position.z =*/ nodeCoordinates[i * 3 + 2].z;
        var randScl = randBetween( 0.8, 1.2 );
        minigame_palm[i].scale.set( randScl, randScl, randScl );
        minigame_palm_leaves[i].scale.set( randScl, randScl, randScl );
        minigame_palm_outline[i].scale.set( randScl, randScl, randScl );
        //minigame_palm_leaves_outline[i].scale.set( randScl, randScl, randScl );
        //  Rotation
        minigame_rock[i] .rotation.y       = minigame_rock_outline[i] .rotation.y       = Math.random() * Math.PI * 2;
        minigame_water[i].rotation.y       = minigame_water_outline[i].rotation.y       = Math.random() * Math.PI * 2;
        minigame_palm[i] .rotation.y       = minigame_palm_outline[i] .rotation.y       =
        minigame_palm_leaves[i].rotation.y = /*minigame_palm_leaves_outline[i].rotation.y =*/ Math.random() * Math.PI * 2;

        scene.add( minigame_rock[i]          );
        scene.add( minigame_rock_outline[i]  );
        scene.add( minigame_water[i]         );
        scene.add( minigame_water_outline[i] );
        scene.add( minigame_palm[i]          );
        scene.add( minigame_palm_outline[i]  );
        scene.add( minigame_palm_leaves[i]   );
        //scene.add( minigame_palm_leaves_outline[i] );
    }

    placedMinigameNodes = true;
    OnMinigameAvailabilityChanged( 1, true );
}

function isAnyCoordinateCloserThan2D( coordinates, xCoord, zCoord, distance )
{
    for(var i = 0; i < coordinates.length; i++)
    {
        if(distanceSquared(new Point(xCoord, zCoord), new Point(coordinates[i].x, coordinates[i].z)) < distance * distance )
        {
            return true;
        }
    }
    return false;
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

var saveAutoRotate;

function pauseRendering()
{
    renderThreadsToBeKilled++;
    saveAutoRotate = controls.autoRotate;
    controls.autoRotate = false;
}

function resumeRendering()
{
    controls.autoRotate = saveAutoRotate;
    deltaTime = clock.getDelta();
    animate();
}

//  More thread-safe than a simple boolean that kills the next render thread
//  Prevents a bug when pausing and _immediately_ resuming (so a second
//  thread gets created, but the first one isn't killed)
var renderThreadsToBeKilled = 0;

function renderOnce()
{
    //water.material.uniforms.time.value += 0.0005;
    water.render();
    renderer.render( scene, camera );
}

var pauseRender = false;
//  Caution: Mostly debug stuff still
function animate()
{
    if ( renderThreadsToBeKilled > 0 )
    {
        renderThreadsToBeKilled--
        return;
    }

    stats.begin();

    deltaTime = clock.getDelta();
    for ( var i = 0; i < weazles.length; i++ )
    {
        weazles[i].update( deltaTime );
    }


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

    //  Pulsing minigame outlines
    if ( placedMinigameNodes )
    {
        var col = Math.round( 255 * ( Math.sin( Date.now() / 500 ) / 4 + 0.75 ) );

        for ( var i = 0; i < TRIES_PER_MINIGAME; i++ )
        {
            if ( minigame_rock_outline[i] && minigame_rock_outline[i].visible )
            {
                minigame_rock_outline[i].material.color = new THREE.Color( "rgb(" + col + ", 0, 0)" );
            }
            if ( minigame_water_outline[i] && minigame_water_outline[i].visible )
            {
                minigame_water_outline[i].material.color = new THREE.Color( "rgb(" + col + ", 0, 0)" );
            }
            if ( minigame_palm_outline[i] && minigame_palm_outline[i].visible )
            {
                minigame_palm_outline[i].material.color = new THREE.Color( "rgb(" + col + ", 0, 0)" );
            }
        }
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
        if ( renderWater )
        {
            water.material.uniforms.time.value += deltaTime * 0.1;
            water.render();
        }
        else
        {
            waterTexture.offset.x = Math.cos(Date.now() / 200000);
            waterTexture.offset.y = Math.sin(Date.now() / 200000);
        }
    }
    
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.end();
}

renderWater = true;

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

    $( "#fullscreenButton" ).click( function ()
    {
        if ( !isFullscreen )
        {
            isFullscreen = true;
            goFullscreen();
        }
        else
        {
            isFullscreen = false;
            exitFullscreen();
        }
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
        $( "#exitStatueButton" ).hide();
        ExitShowStatue();
    } );
} );

var isFullscreen = false;

function goFullscreen()
{
    var i = document.getElementById( "mainGame" );

    if ( i.requestFullscreen )
    {
        i.requestFullscreen();
    } else if ( i.webkitRequestFullscreen )
    {
        i.webkitRequestFullscreen();
    } else if ( i.mozRequestFullScreen )
    {
        i.mozRequestFullScreen();
    } else if ( i.msRequestFullscreen )
    {
        i.msRequestFullscreen();
    }

    THREE.FullScreen.request();
}

function exitFullscreen()
{
    if ( document.exitFullscreen )
    {
        document.exitFullscreen();
    } else if ( document.webkitExitFullscreen )
    {
        document.webkitExitFullscreen();
    } else if ( document.mozCancelFullScreen )
    {
        document.mozCancelFullScreen();
    } else if ( document.msExitFullscreen )
    {
        document.msExitFullscreen();
    }
}

//TODO: Find a better method to go fullscreen
function onWindowResize()
{
    console.log( "Resizing..." );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio / subsampleFactor);
    renderer.setSize( window.innerWidth, window.innerHeight );

    resizeMenu();
    resizeSplashScreen();

    if ( pauseRender )
    {
        renderOnce();
    }
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
    //console.log( "preventRaycastOnce" + preventRaycastOnce );
    //console.log( "controls.enabled  " + controls.enabled );
    //console.log( "pauseRender       " + pauseRender );
    //console.log( "canClickObjects   " + canClickObjects );
    //console.log( "clickable_objects " + clickable_objects );

    if (preventRaycastOnce)
    {
        preventRaycastOnce = false;
        return;
    }

    if ( !controls.enabled || pauseRender || !canClickObjects )
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
        var index = indexInArray( minigame_rock, intersects[0].object );
        if ( index > -1 )
        {
            activeMinigameNodeIndex = index;
            startMinigame( 1 );
            return;
        }
        index = indexInArray( minigame_water, intersects[0].object );
        if ( index > -1 )
        {
            activeMinigameNodeIndex = index;
            startMinigame( 2 );
            return;
        }
        index = indexInArray( minigame_palm, intersects[0].object );
        if ( index > -1 )
        {
            activeMinigameNodeIndex = index;
            startMinigame( 3 );
            return;
        }
        index = indexInArray( minigame_palm_leaves, intersects[0].object );
        if ( index > -1 )
        {
            activeMinigameNodeIndex = index;
            startMinigame( 3 );
            return;
        }
        index = indexInArray( test_statues, intersects[0].object );
        if ( index > -1 )
        {
            $( "#exitStatueButton" ).show();
            setTimeout( function ()
            {
                ShowStatue();
            }, 250 );
            
        }

    }

}

var minigamesVis = true;
var decorationVis = true;
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
    else if ( event.key == "g" )
    {
        if ( decorationVis )
        {
            for ( var i = 0; i < differentSpriteCount; i++ )
            {
                decorationSpriteMeshes[i].visible = false;
            }
            decorationVis = false;
        }
        else
        {
            for ( var i = 0; i < differentSpriteCount; i++ )
            {
                decorationSpriteMeshes[i].visible = true;
            }
            decorationVis = true;
        }
    }
    else if ( event.key == "w" )
    {
        if ( renderWater )
        {
            renderWater = false;
            scene.remove( waterMesh );
            scene.add( waterMesh2 );
        }
        else
        {
            renderWater = true;
            scene.remove( waterMesh2 );
            scene.add( waterMesh );
        }
    }
    else if( event.key == "m")
    {
        if ( minigamesVis )
        {
            for ( var i = 0; i < minigame_rock.length; i++ )
            {
                minigame_rock_outline[i].visible = false;
                minigame_water_outline[i].visible = false;
                minigame_palm_outline[i].visible = false;
                //minigame_palm_leaves_outline[i].visible = false;
                minigame_rock[i].visible = false;
                minigame_water[i].visible = false;
                minigame_palm[i].visible = false;
                minigame_palm_leaves[i].visible = false;
            }
            minigamesVis = false;
        }
        else
        {
            for ( var i = 0; i < minigame_rock.length; i++ )
            {
                minigame_rock_outline[i].visible = true;
                minigame_water_outline[i].visible = true;
                minigame_palm_outline[i].visible = true;
                //minigame_palm_leaves_outline[i].visible = true;
                minigame_rock[i].visible = true;
                minigame_water[i].visible = true;
                minigame_palm[i].visible = true;
                minigame_palm_leaves[i].visible = true;
            }
            minigamesVis = true;
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
    else if ( event.key == "+" )
    {
        decorationSpritesMesh.rotation.z+=0.1;
    }
    else if ( event.key == "-" )
    {
        decorationSpritesMesh.rotation.z-=0.1;
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
    zoomInTime       = 2500;
    zoomOutTime      = 2000;
    segmentBuildTime = 3000;
    timeUntilZoomOut = 2000;
    particleTime     = 2500;
    particleSpd      = 1;

    controls.autoRotate  = true;

    for (var i = 0; i < weazles.length; i++)
    {
        weazles[i].initBuilding();
    }

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
            var initSize   = particleMaterial.size;
            var sizeDelta  = initSize * 10 - initSize;
            for ( var i = 0; i < particleCount; i++ )
            {
                directions.push( new THREE.Vector3( randBetween( -1, 1 ), randBetween( -0.25, 0.25 ), randBetween( -1, 1 ) ).normalize() );
            }
            $( { n: 1 } ).animate( { n: 10 }, {
                duration: particleTime,
                step: function ( now, fx )
                {
                    for ( var i = 0; i < particleCount; i++ )
                    {
                        verts[i].x += ( directions[i].x / Math.pow( 2, now ) * particleSpd );
                        verts[i].y += ( directions[i].y / Math.pow( 2, now ) * particleSpd );
                        verts[i].z += ( directions[i].z / Math.pow( 2, now ) * particleSpd );
                    }
                    particleMaterial.opacity = (10 - now) / 10;

                    statueParticleSystem.geometry.verticesNeedUpdate = true;
                }
            } );
            //----------------------//
            //   2. BUILD SEGMENT   //
            //----------------------//
            mesh.material = segmentMat;

            if ( segmentMat == STATUE_WOOD_MAT )
            {
                scene.add( mesh );
                clickable_objects.push( mesh );
            }

            for (var i = 0; i < weazles.length; i++)
            {
                weazles[i].startWalking();
                weazles[i].speed = startSpd;
            }
            
        }, segmentBuildTime );
    }, zoomInTime);

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
                showButtons();
            }
        } );
    }, (zoomInTime + segmentBuildTime + timeUntilZoomOut ) );
}

function ShowStatue( completeFctn, zoomInTime )
{
    oldRad              = spherical.radius;
    oldRotateSpeed      = controls.autoRotateSpeed;

    targetRad           = 30;
    targetRotateSpd = 5;
    if (!zoomInTime)
    {
        var zoomInTime = 1500;
    }

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
                for ( var i = 0; i < TRIES_PER_MINIGAME; i++ )
                {
                    clickable_objects.push( minigame_rock[i] );
                    minigame_rock_outline[i].visible = true;
                }
                break;
            case 2:
                for ( var i = 0; i < TRIES_PER_MINIGAME; i++ )
                {
                    clickable_objects.push( minigame_water[i] );
                    minigame_water_outline[i].visible = true;
                }
                break;
            case 3:
                for ( var i = 0; i < TRIES_PER_MINIGAME; i++ )
                {
                    clickable_objects.push( minigame_palm[i] );
                    clickable_objects.push( minigame_palm_leaves[i] );
                    minigame_palm_outline[i].visible = true;
                    //minigame_palm_leaves_outline[i].visible = true;
                }
                break;
        }
    }
    else
    {
        var i = activeMinigameNodeIndex;

        switch ( minigameID )
        {

            case 1:
                var index = indexInArray(clickable_objects, minigame_rock[i] );
                console.log( index );
                clickable_objects.splice( index, 1 );
                minigame_rock_outline[i].visible = false;
                break;
            case 2:
                var index = indexInArray( clickable_objects, minigame_water[i] );
                console.log( index );
                clickable_objects.splice( index, 1 );
                minigame_water_outline[i].visible = false;
                break;
            case 3:
                var index = indexInArray( clickable_objects, minigame_palm[i] );
                console.log( index );
                clickable_objects.splice( index, 1 );
                index = indexInArray( clickable_objects, minigame_palm_leaves[i] );
                clickable_objects.splice( index, 1 );
                minigame_palm_outline[i].visible = false;
                //minigame_palm_leaves_outline[i].visible = false;

                break;
        }
    }

}