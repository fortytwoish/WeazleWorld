function initMinigame1()
{
    //------------------------------------------------------//
    //                  SCENE                               //
    //------------------------------------------------------//
    mg1_scene = new THREE.Scene();

    //------------------------------------------------------//
    //                  LINE                                //
    //------------------------------------------------------//
    initLine();
    initPath();
    initLetters();
    initSkipParticles();

    //------------------------------------------------------//
    //                  LIGHT                               //
    //------------------------------------------------------//
    mg1_light = new THREE.DirectionalLight( 0xFFFFFF, 1 );

    mg1_light.castShadow = true;
    mg1_light.shadow.camera.near = 0.1;
    //mg1_scene.add( new THREE.CameraHelper( mg1_light.shadow.camera ) );

    var sunPosition = new THREE.Vector3( 10, 10, 10 );
    mg1_light.position.set( sunPosition.x, sunPosition.y, sunPosition.z );
    mg1_light.lookAt( new THREE.Vector3( 0, 0, 0 ) );
    mg1_scene.add( mg1_light );

    //------------------------------------------------------//
    //                  CAMERA                              //
    //------------------------------------------------------//
    mg1_camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 5, 200 );
    mg1_camera.position.x = 0;
    mg1_camera.position.y = 110;
    mg1_camera.position.z = 0;
    mg1_camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    mg1_scene.add( mg1_camera );

    //------------------------------------------------------//
    //                  ISLAND                              //
    //------------------------------------------------------//
    var scale = 10;
    var dim = VILLAGE_DIMENSIONS.x * scale;
    var height = 1;
    
    var topLeft     = new Point( 0, 0 );
    var topRight    = new Point( dim, 0 );
    var bottomLeft  = new Point( 0, dim );
    var bottomRight = new Point( dim, dim );

    mg1_middle = midpoint( topLeft, topRight, bottomLeft, bottomRight );

    //  1. Create and fill array
    mg1_field = new Array( dim );
    for ( var i = 0; i < dim; i++ )
    {
        mg1_field[i] = new Array( dim );
    }

    //  2. Fill a circle
    for ( i = -dim/2; i < dim/2; i++ )
    {
        for ( j = -dim/2; j < dim/2; j++ )
        {
            var distToCenter = Math.abs(distanceSquared( new Point(i, j), new Point(0,0)));

            if ( distToCenter < Math.pow( dim / 2, 2 ) )
            {
                //Grass
                mg1_field[( mg1_middle.x + i )][( mg1_middle.y + j )] = height + (Math.random() / 2) - (distToCenter / 5000);
            }
            //else if ( distToCenter < Math.pow( dim / 2, 2 ) )
            //{
            //    //Sand
            //    mg1_field[( mg1_middle.x + i )][( mg1_middle.y + j )] = height / 2 + Math.random() - distToCenter / 10;
            //}
            else
            {
                mg1_field[( mg1_middle.x + i )][( mg1_middle.y + j )] = -10;
            }
        }
    }

    //  3. Create geometry from array
    var mg1_geometry = new THREE.PlaneBufferGeometry( dim - 1, dim - 1, dim - 1, dim - 1 );
    mg1_geometry.rotateX( -degreeToRad( 90 ) );
    var count = 1;
    for ( var i = 0; i < dim; i++ )
    {
        for ( var j = 0; j < dim; j++ )
        {
            mg1_geometry.attributes.position.array[count] = mg1_field[i][j];
            count += 3; //Go to next vertex's y-property (skip z and x)
        }
    }

    //------------------------------------------------------//
    //          ISLAND TEXTURE                              //
    //------------------------------------------------------//

    mg1_geometry.computeVertexNormals();

    var normalVector     = new THREE.Vector3(),
        up               = new THREE.Vector3( 0, 1, 0 );
        normalComponents = mg1_geometry.attributes.normal.array,
        width            = dim,
        height           = dim;

    var canvas           = document.createElement( 'canvas' );
    canvas.width         = width;
    canvas.height        = height;

    var context          = canvas.getContext( '2d' );
    context.fillStyle    = '#000';
    context.fillRect( 0, 0, width, height );

    var image            = context.getImageData( 0, 0, canvas.width, canvas.height );
    var imageData        = image.data;

    for ( var i = 0, j = 0; j < imageData.length; i += 4, j += 3 )
    {

        //  Extract the current vertex's normal vector from the normal components array ( [XYZ XYZ XYZ XY...] )
        normalVector.x = normalComponents[j];
        normalVector.y = normalComponents[j + 1];
        normalVector.z = normalComponents[j + 2];

        normalVector.normalize();

        angle = angleBetweenVectors3D( normalVector, sunPosition ) / Math.PI * 2;

        shade = angle * 255;

        shadeInv = 255 - shade;

        //  Global texture brightness
        shadeInv *= 0.75;

        /***********************************
        *          FINAL COLOUR            *
        ***********************************/
        //Sand
        if ( mg1_geometry.attributes.position.array[j + 1] <= 0.25 + Math.random() / 4 )
        {
            shadeInv /= 7;
            imageData[i]     = ( shadeInv * ( mg1_geometry.attributes.position.array[j + 1] + 20 ) * 0.875 );
            imageData[i + 1] = ( shadeInv * ( mg1_geometry.attributes.position.array[j + 1] + 20 ) * 0.8 );
            imageData[i + 2] = ( shadeInv * 13 ).clamp8Bit( CLAMP_GRASS );
        }
        //Grass
        else
        {
            imageData[i] = ( shadeInv * 0.9 );
            imageData[i + 1] = ( shadeInv * 1.65 );
            imageData[i + 2] = ( shadeInv * 0.8 );
        }

    }

    context.putImageData( image, 0, 0 );

    var texture   = new THREE.CanvasTexture( canvas );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    var mg1_islandMat = new THREE.MeshBasicMaterial( { map: texture } );

    //------------------------------------------------------//
    //            ADD TOGETHER                              //
    //------------------------------------------------------//
    mg1_islandMat.shading   = THREE.FlatShading;
    mg1_islandMesh          = new THREE.Mesh( mg1_geometry, mg1_islandMat );
    mg1_islandMesh.position.set( 0, 1, 0 );
    mg1_islandMesh.scale.set( 1 / scale, 1, 1 / scale );

    mg1_islandMesh.castShadow = true;
    mg1_islandMesh.receiveShadow = true;

    mg1_scene.add( mg1_islandMesh );

    //------------------------------------------------------//
    //                  WATER                               //
    //------------------------------------------------------//
    var mg1_planeGeom = new THREE.PlaneBufferGeometry( 256, 256, 1, 1 );

    new THREE.TextureLoader().load( 'img/waternormals.jpg', function ( loadedTexture ) //Called when the texture has finished loading
    {
        var mg1_waterTexture = loadedTexture;
        mg1_waterTexture.wrapS = mg1_waterTexture.wrapT = THREE.RepeatWrapping;
        mg1_waterTexture.repeat.set( 4, 4 );

        mg1_water = new THREE.Water( renderer, mg1_camera, mg1_scene,
        {
            textureWidth: 1024,
            textureHeight: 1024,
            waterNormals: mg1_waterTexture,
            alpha: 1,
            waterColor: WATERCOLOR,
            distortionScale: 15
        } );

        mg1_waterMesh        = new THREE.Mesh( mg1_planeGeom, mg1_water.material );
        mg1_waterMesh.rotation.x = -Math.PI * 0.5;
        mg1_waterMesh.add( mg1_water );

        mg1_scene.add( mg1_waterMesh );

    } );

    //------------------------------------------------------//
    //                  WEAZLE                              //
    //------------------------------------------------------//
    new THREE.OBJLoader().load( "Models/otter_highQ.obj", function ( object )
    {
        object.traverse( function ( child )
        {
            if ( child instanceof THREE.Mesh )
            {
                mg1_weazleGeom = child.geometry;
                mg1_weazleMesh = new THREE.Mesh( mg1_weazleGeom, new THREE.MeshPhongMaterial( { color: 0xC27D3F } ) );

                mg1_weazleMesh.castShadow = true;

                mg1_weazleMesh.position.y = 2;
                mg1_weazleMesh.position.x = 0.5;
                mg1_weazleMesh.scale.set( 0.4, 0.4, 0.4 );

                mg1_scene.add( mg1_weazleMesh );
            }
        } );
    } );
}

function mg1_start()
{
    SCENE_TO_RENDER = mg1_scene;
    document.addEventListener( 'mousemove'  , mg1_onMg1MouseMove , false );
    document.addEventListener( 'touchstart' , mg1_onMg1TouchStart, false );
    document.addEventListener( 'mousedown'  , mg1_onMg1MouseDown , false );

    sendWord( "YOU" );
    setTimeout( function () { sendWord( "FUCK" ) }, 5000 );
    setTimeout( function () { sendWord( "YOU" ) }, 10000 );
    setTimeout( function () { sendWord( "FUCK" ) }, 15000 );
    setTimeout( function () { sendWord( "YOU" ) }, 20000 );
    setTimeout( function () { sendWord( "FUCK" ) }, 25000 );
}

function mg1_end()
{
    SCENE_TO_RENDER = scene;

    endMinigame++;
    animate();
    minigameLost( 1 );

    document.removeEventListener( 'mousemove', mg1_onMg1MouseMove, false );
    document.removeEventListener( 'touchstart', mg1_onMg1TouchStart, false );
    document.removeEventListener( 'mousedown', mg1_onMg1MouseDown, false );
}

var endMinigame = 0;

//------------------------------------------------------//
//                  LINE                                //
//------------------------------------------------------//
function initLine()
{
    lineGeometry = new THREE.BufferGeometry();
    positions    = new Float32Array( 3 * 3 );
    lineGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    var material = new THREE.LineBasicMaterial( { color: 0xffaa00 } );

    //  Set two vertices above the origin
    positions[0] =  0;
    positions[1] = 1.5;
    positions[2] =  0;
    positions[3] =  0;
    positions[4] = 1.5;
    positions[5] =  0;
    positions[6] =  0;
    positions[7] = 1.5;
    positions[8] =  0;

    // line
    mg1_line = new THREE.Line( lineGeometry, material );
    mg1_scene.add( mg1_line );
}

var mouse = new THREE.Vector2;
var raycaster;

var lineHidden = false;

//------------------------------------------------------//
//                  PATH & DOTS                         //
//------------------------------------------------------//
function initPath()
{
    var numPoints = 100;
    var numDots = 20;

    var height = 5;

    //spline = new THREE.SplineCurve3(
    //[
    //    new THREE.Vector3(   -80, height,     0 ),
    //    new THREE.Vector3(   -50, height,   -22 ),
    //    new THREE.Vector3(     0, height,   -35 ),
    //    new THREE.Vector3(  39.5, height, -25.5 ),
    //    new THREE.Vector3(    58, height,     0 ),
    //    new THREE.Vector3(  41.2, height,  27.5 ),
    //    new THREE.Vector3(     0, height,    36 ),
    //    new THREE.Vector3(   -28, height,    27 ),
    //    new THREE.Vector3(   -35, height,     0 )
    //] );

    spline = new THREE.SplineCurve3(
    [
        new THREE.Vector3( -80,     height, 15 ),
        new THREE.Vector3( -78.5,   height, -0.54 ),
        new THREE.Vector3( -69.32,  height, -13.5 ),
        new THREE.Vector3( -55.2,   height, -25 ),
        new THREE.Vector3( -40,     height, -32.8 ),
        new THREE.Vector3( -23.1,   height, -39 ),
        new THREE.Vector3( 0,       height, -42.5 ),
        new THREE.Vector3( 22.76,   height, -41.3 ),
        new THREE.Vector3( 45.1,    height, -33.4 ),
        new THREE.Vector3( 58.45,   height, -25.06 ),
        new THREE.Vector3( 71,      height, -9.6 ),
        new THREE.Vector3( 74.11,   height, 3.54 ),
        new THREE.Vector3( 68.36,   height, 21.06 ),
        new THREE.Vector3( 57.74,   height, 31.8 ),
        new THREE.Vector3( 43.43,   height, 38.6 ),
        new THREE.Vector3( 21.51,   height, 42.18 ),
        new THREE.Vector3( -3.13,   height, 38.36 ),
        new THREE.Vector3( -24.1,   height, 17.4 )
    ] );

    var material = new THREE.LineBasicMaterial( {
        color: 0x222222,
    } );

    var geometry = new THREE.Geometry();
    var splinePoints = spline.getPoints( numPoints );

    for ( var i = 0; i < splinePoints.length; i++ )
    {
        geometry.vertices.push( splinePoints[i] );
    }

    var line = new THREE.Line( geometry, material );
    //mg1_scene.add( line );

    //------------------------------------------------------//
    //                  DOTS                                //
    //------------------------------------------------------//
    var dotGeom = new THREE.SphereGeometry( 0.25, 0.25, 0.25 );
    var dotMat = new THREE.MeshBasicMaterial( { color: 0xBFFFFF } );
    dotMeshes = [];

    for ( var i = 0; i < numDots; i++ )
    {
        var mesh = new THREE.Mesh( dotGeom, dotMat );
        dotMeshes.push( [mesh, ( i / numDots )] );
    }
    for ( var i = 0; i < numDots; i++ )
    {
        mg1_scene.add( dotMeshes[i][0] );
    }
}

var textLoaded = false;
var loadedLetters = 0;
function initLetters()
{
    var size = 5;
    var height = 1;

    textGeoms = [];
    textMeshes = [];

    
    new THREE.FontLoader().load( 'Resources/Calibri_Bold.json', function ( response )
    {
        for ( var i = 0; i < 26; i++ )
        {
            font = response;

            textGeoms[i] = new THREE.TextGeometry( numberToChar( i ),
            {
                font: font,
                size: size,
                height: height
            } );

        }

        textLoaded = true;
    } );
    
}

function sendWord( word )
{
    //  Reverse word
    word = word.split( "" ).reverse().join( "" );

    for(var i = 0; i < word.length; i++)
    {
        var letter = word.charAt( i );
        delaySendLetter( letter, 1000 * i );
    }
}

function delaySendLetter( letter, delay )
{
    setTimeout( function () { sendLetter( letter ) }, delay );
}

function sendLetter( character )
{        
    var mesh = new THREE.Mesh( textGeoms[charToNumber( character )], new THREE.MeshPhongMaterial( { color: 0xFF0000 } ) );
    textMeshes.push( [mesh, 0] );
    mg1_scene.add( mesh );

}

function numberToChar( num )
{
    return String.fromCharCode( 65 + num );
}

function charToNumber( character )
{
    return character.charCodeAt(0) - 65;
}

var tangent = new THREE.Vector3();
var axis    = new THREE.Vector3();
var up      = new THREE.Vector3( 0, 1, 0 );
var speed   = 1;

function moveLettersAlongPath( deltaTime )
{
    if ( !textLoaded )
    {
        return;
    }

    for ( var i = 0; i < textMeshes.length; i++ )
    {
        if ( textMeshes[i][1] <= 1 )
        {
            textMeshes[i][0].position.copy( spline.getPointAt( textMeshes[i][1] ) );

            tangent = spline.getTangentAt( textMeshes[i][1] ).normalize();

            axis.crossVectors( up, tangent ).normalize();

            var radians = Math.acos( up.dot( tangent ) );

            textMeshes[i][0].quaternion.setFromAxisAngle( axis, radians );

            textMeshes[i][0].lookAt( mg1_camera.position );

            textMeshes[i][1] += ( deltaTime / 50 ) * speed;
        }
        else
        {
            textMeshes[i][1] = 0;
        }
    }

}

function moveDotsAlongPath(deltaTime)
{
    for ( var i = 0; i < dotMeshes.length; i++ )
    {
        if ( dotMeshes[i][1] <= 1 )
        {
            dotMeshes[i][0].position.copy( spline.getPointAt( dotMeshes[i][1] ) );

            //tangent = spline.getTangentAt( dotMeshes[i][1] ).normalize();

            //axis.crossVectors( up, tangent ).normalize();

            //var radians = Math.acos( up.dot( tangent ) );

            //dotMeshes[i][0].quaternion.setFromAxisAngle( axis, radians );

            dotMeshes[i][1] += ( deltaTime / 50 ) * speed * 5;
        }
        else
        {
            dotMeshes[i][1] = 0;
        }
    }
}

//------------------------------------------------------//
//            CLICK HANDLERS                            //
//------------------------------------------------------//
var lastX = null;
var lastZ = null;
function mg1_onMg1MouseMove( event )
{
    if ( !lineHidden )
    {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, mg1_camera );

        var intersects = raycaster.intersectObjects( [mg1_waterMesh] );

        if ( intersects.length > 0 )
        {
            positions[6] = lastX = intersects[0].point.x;
            positions[7] = 1.5;
            positions[8] = lastZ = intersects[0].point.z;

            mg1_weazleMesh.lookAt( new THREE.Vector3( intersects[0].point.x, mg1_weazleMesh.position.y, intersects[0].point.z ) );
        }

        mg1_line.geometry.attributes.position.needsUpdate = true;
    }
    
}

function mg1_onMg1TouchStart( event )
{
    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;

    mg1_onMg1MouseDown( event );
}

function mg1_onMg1MouseDown( event )
{
    if ( lineHidden )
    {
        return;
    }

    lineHidden = true;
    mg1_line.visible = false;

    shootLetter( numberToChar(Math.floor(Math.random()*26)) );
}

//------------------------------------------------------//
//                UPDATE                                //
//------------------------------------------------------//
var projectileYSpd;
function animateMinigame1()
{
    if ( endMinigame > 0 )
    {
        endMinigame--;
        return;
    }

    deltaTime = clock.getDelta();
    moveLettersAlongPath( deltaTime );
    moveDotsAlongPath( deltaTime );

    if ( projectileMesh )
    {
        //------------------------------------------------------//
        //     CHECK WHETHER PROJECTILE EXITED BOUNDS           //
        //------------------------------------------------------//
        if ( projectileMesh.position.x < -90 || projectileMesh.position.x > 90 || projectileMesh.position.z < -50 || projectileMesh.position.z > 50 )
        {
            mg1_scene.remove( projectileMesh );
            projectileMesh = null;
            lineHidden = false;
            mg1_line.visible = true;
        }
        //------------------------------------------------------//
        //     CHECK WHETHER PROJECTILE HIT A LETTER            //
        //------------------------------------------------------//
        else if ( false )
        {
            
        }
        else
        {
            //------------------------------------------------------//
            //        UPDATE PROJECTILE                             //
            //------------------------------------------------------//
            projectileMesh.translateY( deltaTime * 30 );

            projectileYSpd -= deltaTime * 5;

            projectileMesh.position.y += projectileYSpd;

            //------------------------------------------------------//
            //        EVALUATE SKIPPING                             //
            //------------------------------------------------------//

            //  SKIPPED
            if ( projectileMesh.position.y < mg1_waterMesh.position.y && projectileYSpd < 0 )
            {
                projectileYSpd *= -0.9;
                doSkipEffect( projectileMesh.position.x, projectileMesh.position.z );
            }
        }

    }

    mg1_waterMesh.position.y = Math.sin( Date.now() / 1500 ) / 4 + 1;
    mg1_water.material.uniforms.time.value += deltaTime * 0.1;
    mg1_water.render();

    requestAnimationFrame( animateMinigame1 );
    renderer.render( mg1_scene, mg1_camera );
}

//------------------------------------------------------//
//           LETTER SHOOTING                            //
//------------------------------------------------------//
var projectileMesh = null;
function shootLetter( letter )
{
    console.log( "trying to shoot letter: " + letter );

    lineHidden = true;

    //  For safety
    if ( projectileMesh )
    {
        mg1_scene.remove( projectileMesh );
    }

    //  1. create Mesh from letter and add it to scene
    projectileMesh = new THREE.Mesh( textGeoms[charToNumber( letter )], new THREE.MeshPhongMaterial( { color: 0x00FF00 } ) );

    projectileMesh.position.y = 8;
    projectileMesh.lookAt( new THREE.Vector3( lastX, 8, lastZ ) );
    projectileMesh.rotateX( Math.PI / 2 );
    projectileMesh.rotateY( Math.PI );

    projectileYSpd = 1.5;

    mg1_scene.add( projectileMesh );
}

var skipEffects = [];
var numSkipEffects = 10;
var currSkipEffect = 0;
function doSkipEffect( x, z )
{
    //  This will overwrite the oldest water ripple effect
    currSkipEffect = ( currSkipEffect + 1 ) % numSkipEffects;

    console.log( "Skip effect at: " + x + ", " + z );
    //  Create water ripple particles
    //      (Re)set Particles
    for ( var i = 0; i < skipEffects[currSkipEffect].length; i++ )
    {
        skipEffects[currSkipEffect][i].position.set( x, 2/*mg1_waterMesh.position.y*/, z );
        //skipEffects[currSkipEffect][i].scale.set( i + 1 ) * 5;
        skipEffects[currSkipEffect][i].material.opacity = 1;
    }

    //  Need to call this in external method (closure)
    fadeOutRipple( currSkipEffect );    
}

function fadeOutRipple( currSkipEffect )
{
    //  Ripple outwards and disappear:
    $( { n: 1 } ).animate( { n: 10 }, {
        duration: 2500,
        step: function ( now, fx )
        {
            for ( var i = 0; i < skipEffects[currSkipEffect].length; i++ )
            {
                skipEffects[currSkipEffect][i].geometry.verticesNeedUpdate = true;
                //skipEffects[currSkipEffect][i].scale.set( now * (i + 1), now * (i + 1) );
                skipEffects[currSkipEffect][i].material.opacity = ( 10 - now ) / 10;
            }
        }
    } );
}

function initSkipParticles()
{
    var particles = new THREE.Geometry();

    var numCircles = 3;

    particles.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    particles.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    particles.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

    // Create the particle systems
    for ( var i = 0; i < numSkipEffects; i++ )
    {
        skipEffects[i] = [];

        for ( var j = 0; j < numCircles; j++ )
        {
            skipEffects[i].push(new THREE.Points( particles,
                new THREE.PointsMaterial(
                {
                    color: 0xFFFFFF,
                    size: (j + 1) * 5,
                    map: THREE.ImageUtils.loadTexture( "img/RockGame/waterRipple.png" ),
                    transparent: true,
                    alphaTest: 0.5
                    
                } ) ) );

            mg1_scene.add( skipEffects[i][j] );
        }

    }
}