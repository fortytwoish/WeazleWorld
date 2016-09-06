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
    //initSkipParticles();

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
    var scale  = 10;
    var dim    = VILLAGE_DIMENSIONS.x * scale;
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

                unfiredProjectileLetter = new Letter( "X", null );
                mg1_weazleMesh.add( unfiredProjectileLetter.mesh );

                mg1_scene.add( mg1_weazleMesh );
            }
        } );
    } );
}

const NAMES_EASY = ["APFEL", "ABER", "ALS", "ALSO", "AUF", "AUS", "AUFGABE", "AUGE", "AUTO", "AMEISE", "ARBEITEN", "ANTWORTEN", "BLAU", "BRAUN", "BROT", "BUCH", "BUNT", "BADEN", "BRINGEN", "BANK", "BRAUCHEN", "BIRNE", "BAUM", "BILD", "BILDER", "BLEIBEN", "BLEIBT", "BUB", "BUBEN", "BADEN", "BEI", "BABY", "BACKEN", "CENT", "CLOWN", "COMPUTER", "DOSE", "DUNKEL", "DENKEN", "DANKEN", "DARF", "DIE", "DOCH", "DURCH", "DICK", "DAS", "DER", "DES", "DIR", "DICH", "ENTE", "ENDE", "ESEL", "EIS", "EURO", "ENG", "FRAU", "FEDER", "FENSTER", "FINDEN", "FEIN", "FRISCH", "FRAGEN", ",FRAGT", "FREUND", "FREUNDE", "GUT", "GABEL", "GARTEN", "GRAS", "GEBEN", "GIBT", "GELB", "GELBE", "GESUND", "GESUNDE", "GEHEN", "GEHT", "HASE", "HOSE", "HABEN", "HOLEN", "HOCH", "HAUS", "HINTER", "HUND", "HUNDE", "ICH", "IST", "JUNGE", "JAHR", "KISTE", "KRANK", "KOPF", "KIND", "KINDER", "KLEID", "KLEIDER", "KATZE", "KAISER", "LAUT", "LEISE", "LEUTE", "LEICHT", "LERNEN", "LAUFEN", "LEBEN", "LEBT", "LEGEN", "LEGT", "MALEN", "MACHEN", "MAUS", "MAI", "MIT", "NAME", "NEBEL", "NADEL", "NEU", "NACH", "NEIN", "NICHT", "NUN", "OMA", "OPA", "ONKEL", "ODER", "PINSEL", "PFLANZE", "PARTNER", "PFERD", "PFERDE", "QUELLE", "QUADRAT", "QUATSCH", "RABE", "RAUPE", "ROT", "RUFEN", "REDEN", "RECHNEN", "REGEN", "RING", "REISEN", "SALZ", "SCHAF", "SCHERE", "SCHULE", "SCHWESTER", "SUCHEN", "SEIFE", "SINGEN", "SPRECHEN", "SPRICHT", "SPORT", "SPAREN", "SPIELEN", "SPIELT", "STEIN", "STERN", "STUNDE", "SUCHEN", "SCHNEIDEN", "SCHEINEN", "SCHWARZ", "SCHREIBEN", "SCHREIBT", "SAGEN", "SAGT", "SCHLAFEN", "SCHON", "SUCHEN", "SIE", "SIND", "SATZ", "SITZEN", "SITZT", "TANTE", "TELEFON", "TOMATE", "TUN", "TRINKEN", "TISCH", "TASCHE", "TURNEN", "TAG", "TAGE", "UHR", "VOR", "VOGEL", "VATER", "VASE", "VIEL", "WEIT", "WOLF", "WOLKE", "WINTER", "WURZEL", "WOCHE", "WARTEN", "WORT", "WIND", "WINDE", "WEG", "WEGE", "WAS", "WURZEL", "WIR", "WEIL", "WEITER", "WER", "ZEIT", "ZWEI", "ZEIGEN", "ZEIGT", "ZAHL", "ZAHLEN", "ZAHN"];

//==============================//
//    vv      CONFIG    vv      //
//==============================//

var speed       = 0.5;
var wordsToSend = 25;
var life        = 3;
var charDist    = 500;
var wordDist    = 2000;
var tutorialMode = false;

function mg1_configurate()
{
    var diff = getMinigameState( 1, 2 );

    //  Tutorial mode
    if ( diff == 0 )
    {
        wordsToSend = 5;
        speed = 1;
        tutorialMode = true;

        showMessageBox( ["Hallo!", "Wie es aussieht, hat dieses Weazle ein paar schöne Steine gefunden.", "Hmm, die sehen ja aus wie Buchstaben...",
                         "Da kommt ein Wort, in dem ein Buchstabe fehlt, was ein Zufall...",
                         "Eine kleine Erklärung vorweg:", "Tippst oder klickst du auf die Insel, wechselst du den aktiven Buchstaben.", "Die verfügbaren Buchstaben erscheinen rechts der Insel.",
                         "Der aktive Buchstabe ist eingekreist.", "Tippe oder klicke ins Wasser, um den aktiven Buchstaben übers Wasser hüpfen zu lassen.",
                         "Versuch doch mal, ein paar Wörter an der richtigen Stelle mit den fehlenden Buchstaben zu treffen.",
                         "Lass dir so viel Zeit wie du willst, dieses Mal bist du nur zum Üben hier.", "Viel Spaß!"],
                         "OK!", function() {generateWords()} );
    }
    else
    {
        wordsToSend = 10 * diff;
        speed = 1 + diff / 2;
        tutorialMode = false;

        if(getMinigameState( 1, 1 ) == 1)
        {
            showMessageBox( ["Vorsicht, dieses Mal sind es ein paar mehr Wörter, außerdem bewegen sie sich schneller!",
                             "Ab sofort verlierst du jedes mal eines deiner drei Leben, sollte es ein Wort bis ans Ende schaffen.", "Viel Glück!"],
                             "Los geht's!", function () { generateWords() } );
        }
        else
        {
            generateWords();
        }
    }

}

//==============================//
//     ^^     CONFIG     ^^     //
//==============================//



//==============================//
//    vv    GAME LOGIC    vv    //
//==============================//
mg1_paused = true;
function mg1_start()
{
    endRemainingWordAdds = 0;
    words = [];

    mg1_paused = true;

    SCENE_TO_RENDER = mg1_scene;

    mg1_configurate();

    //  Faster to delete any leftovers and re-initialize them in the next run than to test for them when ending the game
    initLine();
    initDots();
    initSkipParticles();

    document.addEventListener( 'mousemove'  , mg1_onMg1MouseMove , false );
    document.addEventListener( 'touchstart' , mg1_onMg1TouchStart, false );
    document.addEventListener( 'mousedown'  , mg1_onMg1MouseDown , false );
}

function generateWords()
{
    if ( WordArray.length == 0 )
    {
        for ( var i = 0; i < wordsToSend; i++ )
        {
            WordArray.push( NAMES_EASY[Math.floor( randBetween( 0, NAMES_EASY.length ) )] );
        }
    }

    console.log( "Starting minigame 1 with these words: " + WordArray.join( ", " ) );

    var firstWord = WordArray[wordsSentIndex++];

    new Word( firstWord ).sendUndelayed();

    lineHidden = false;
    mg1_paused = false;
}

var wordsScored = 0;
var wordsLost = 0;

function scoreWord()
{
    //console.log( "Scored a word! Life: " + life );

    wordsScored++;

    checkAllWordsGone();
}

function loseWord()
{
    //console.log( "Lost a word! Life: " + life );
    wordsLost++;

    life--;

    var newUrl = "../img/RockGame/" + life + "life.png";

    $( "#life" ).attr( "src", newUrl );

    if(life == 0)
    {
        loseMinigame1();
    }

    checkAllWordsGone();
}

function checkAllWordsGone()
{
    if ( wordsScored + wordsLost >= wordsToSend )
    {
        if ( life > 0 )
        {
            winMinigame1();
        }
        else
        {
            loseMinigame1();
        }
    }
}

function loseMinigame1()
{
    //Keep WordArray for next time
    //WordArray = [];

    mg1_end();
    minigameLost( 1 );
}

function winMinigame1()
{
    WordArray = [];

    mg1_end();
    minigameWon( 1 );
}

function mg1_reset()
{
    if ( projectileLetter && projectileLetter.mesh )
    {
        mg1_scene.remove( projectileLetter.mesh );
    }

    for ( var i = 0; i < words; i++ )
    {
        words[i].cleanUp();
    }

    //Clear any leftover objects
    for ( var i = mg1_scene.children.length - 1; i >= 0; i-- )
    {
        obj = mg1_scene.children[i];

        if ( obj != mg1_waterMesh && obj != mg1_islandMesh && obj != unfiredProjectileLetter.mesh && obj != mg1_light && obj != mg1_camera && obj != mg1_weazleMesh )
        {
            mg1_scene.remove( obj );
        }

    }
    
    projectileLetter        = null;
    loadedProjectileChar    = null;
    currLoadedProjectileInd = 0;
    missingLetters          = [];
    words                   = [];
    wordsSentIndex          = 0;
    pointerOnIsland         = false;
    wordsScored = 0;
    wordsLost = 0
}

var endRemainingWordAdds = 0;

function mg1_end()
{
    SCENE_TO_RENDER = scene;

    endMinigame++;
    endRemainingWordAdds++;
    mg1_reset();
    animate();

    document.removeEventListener( 'mousemove',  mg1_onMg1MouseMove,  false );
    document.removeEventListener( 'touchstart', mg1_onMg1TouchStart, false );
    document.removeEventListener( 'mousedown',  mg1_onMg1MouseDown,  false );
}
//==============================//
//    ^^    GAME LOGIC    ^^    //
//==============================//

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
var wordsSentIndex = 0;
var lineHidden = false;

//------------------------------------------------------//
//                  PATH & DOTS                         //
//------------------------------------------------------//
function initPath()
{
    var numPoints = 100;

    var height    = 5;

    spline = new THREE.SplineCurve3(
    [
        new THREE.Vector3( -100  , height, -0.54 ),
        new THREE.Vector3( -78.5,  height, -0.54 ),
        new THREE.Vector3( -69.32, height, -13.5 ),
        new THREE.Vector3( -55.2,  height, -25 ),
        new THREE.Vector3( -40,    height, -32.8 ),
        new THREE.Vector3( -23.1,  height, -39 ),
        new THREE.Vector3( 0,      height, -42.5 ),
        new THREE.Vector3( 22.76,  height, -41.3 ),
        new THREE.Vector3( 45.1,   height, -33.4 ),
        new THREE.Vector3( 58.45,  height, -25.06 ),
        new THREE.Vector3( 71,     height, -9.6 ),
        new THREE.Vector3( 74.11,  height, 3.54 ),
        new THREE.Vector3( 68.36,  height, 21.06 ),
        new THREE.Vector3( 57.74,  height, 31.8 ),
        new THREE.Vector3( 43.43,  height, 38.6 ),
        new THREE.Vector3( 21.51,  height, 42.18 ),
        new THREE.Vector3( -3.13,  height, 38.36 ),
        new THREE.Vector3( -24.1,  0     , 17.4 )
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
    
}

var numDots = 15;
function initDots()
{


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
    var size   = 5;
    var height = 1;

    textGeoms  = [];
    words      = [];

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

//var debug_firstLetterOffset;

function moveLettersAlongPath( deltaTime )
{
    if ( !textLoaded || mg1_paused )
    {
        return;
    }

    for ( var i = 0; i < words.length; i++ )
    {
        var word = words[i];

        for ( var j = 0; j < word.letters.length; j++ )
        {
            var letter = word.letters[j];

            if ( letter.offset <= 1 )
            {
                if ( !word.isVisible && j == 0 && letter.offset > 0.05 )
                {
                    word.isVisible = true;
                    missingLetters.push( word.missingLetter );
                    if ( missingLetters.length == 1 )
                    {
                        loadProjectile( word.missingLetter );
                    }
                    missingLettersChanged();
                }

                letter.mesh.position.copy( spline.getPointAt( letter.offset ) );

                tangent = spline.getTangentAt( letter.offset ).normalize();

                axis.crossVectors( up, tangent ).normalize();

                var radians = Math.acos( up.dot( tangent ) );

                letter.mesh.quaternion.setFromAxisAngle( axis, radians );

                letter.mesh.lookAt( mg1_camera.position );

                letter.offset += ( deltaTime / 50 ) * speed;
            }
            else
            {
                if ( tutorialMode )
                {
                    letter.offset = 0;
                }
                else
                {
                    loseWord();
                    word.remove();
                    break;
                }
            }
        }
        
    }

}

var dotSpeed = 5;
function moveDotsAlongPath(deltaTime)
{
    for ( var i = 0; i < dotMeshes.length; i++ )
    {
        if ( dotMeshes[i][1] <= 1 )
        {
            dotMeshes[i][0].position.copy( spline.getPointAt( dotMeshes[i][1] ) );

            dotMeshes[i][1] += ( deltaTime / 50 ) * (dotSpeed + speed/5) ;
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
var pointerOnIsland = false;
function mg1_onMg1MouseMove( event )
{
    if ( !lineHidden )
    {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, mg1_camera );

        var intersects = raycaster.intersectObjects( [mg1_waterMesh, mg1_islandMesh] );

        if ( intersects.length > 0 )
        {
            if ( intersects[0].object === mg1_waterMesh )
            {
                pointerOnIsland = false;
                /*positions[6] = */lastX = intersects[0].point.x;
                /*positions[7] = 1.5;*/
                /*positions[8] = */lastZ = intersects[0].point.z;
            }
            else
            {
                pointerOnIsland = true;
            }
        }
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
    if ( pointerOnIsland )
    {
        loadNextProjectile();
    }
    else if ( missingLetters.length > 0 )
    {
        if ( lineHidden )
        {
            return;
        }

        lineHidden = true;
        mg1_line.visible = false;

        shootLetter();
    }
}

//------------------------------------------------------//
//                UPDATE                                //
//------------------------------------------------------//
var projectileYSpd;
var hitThreshold = 15;
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

    if ( projectileLetter )
    {
        var distances = [];
        
        //------------------------------------------------------//
        //     CHECK WHETHER PROJECTILE HIT A LETTER            //
        //------------------------------------------------------//
        for ( var i = 0; i < words.length; i++ )
        {
            var word = words[i];

            for ( var j = 0; j < word.letters.length; j++ )
            {
                var letter = word.letters[j];

                var distance = distanceSquared( new Point( letter.mesh.position.x,         letter.mesh.position.z ),
                                                new Point( projectileLetter.mesh.position.x, projectileLetter.mesh.position.z ));

                if( distance < hitThreshold)
                {
                    //  We hit a letter!
                    //console.log( "Hit word: " + word.word + "missing letter: " + word.missingLetter + " index " + word.missingLetterInd + " at letter \"" + letter + "\" (Index " + j + ")" );

                    //  Hit a letter at either end, needs special handling
                    if ( j == 0 )
                    {
                        wordHit( projectileLetter, word, 1 );
                    }
                    else if( j == word.letters.length - 1)
                    {
                        wordHit( projectileLetter, word, word.letters.length - 1 );
                    }
                    //  Hit a letter in the middle
                    else
                    {
                        var distanceL = distanceSquared
                        (
                            new Point( word.letters[j - 1].mesh.position.x, word.letters[j - 1].mesh.position.z ),
                            new Point( projectileLetter.mesh.position.x, projectileLetter.mesh.position.z )
                        );
                        var distanceR = distanceSquared
                        (
                            new Point( word.letters[j + 1].mesh.position.x, word.letters[j + 1].mesh.position.z ),
                            new Point( projectileLetter.mesh.position.x, projectileLetter.mesh.position.z )
                        );

                        if(distanceL <= distanceR)
                        {
                            //console.log( "inserting between index " + ( j - 1 ) + " and index " + j );
                            wordHit( projectileLetter, word, j );
                        }
                        else
                        {
                            //console.log( "inserting between index " + ( j ) + " and index " + ( j + 1 ) );
                            wordHit( projectileLetter, word, ( j + 1 ) );
                        }
                    }

                    resetProjectile();
                    mg1_animateAnotherFrame();
                    return;
                }
            }
        }

        //------------------------------------------------------//
        //     CHECK WHETHER PROJECTILE EXITED BOUNDS           //
        //------------------------------------------------------//
        if (   projectileLetter.mesh.position.x < -90
            || projectileLetter.mesh.position.x >  90
            || projectileLetter.mesh.position.z < -50
            || projectileLetter.mesh.position.z >  50 )
        {
            resetProjectile();
        }
        else
        {
            //------------------------------------------------------//
            //        UPDATE PROJECTILE                             //
            //------------------------------------------------------//
            projectileLetter.mesh.translateY( deltaTime * 42 );

            projectileYSpd -= deltaTime * 5;

            projectileLetter.mesh.position.y += projectileYSpd;

            //------------------------------------------------------//
            //        EVALUATE SKIPPING                             //
            //------------------------------------------------------//

            //  SKIPPED
            if ( projectileLetter.mesh.position.y < mg1_waterMesh.position.y && projectileYSpd < 0 )
            {
                projectileYSpd *= -0.9;
                doSkipEffect( projectileLetter.mesh.position.x, projectileLetter.mesh.position.z );
            }
        }

    }

    positions[6] = lastX;
    positions[7] = 1.5;
    positions[8] = lastZ;
    mg1_weazleMesh.lookAt( new THREE.Vector3( lastX, mg1_weazleMesh.position.y, lastZ ) );
    mg1_line.geometry.attributes.position.needsUpdate = true;

    mg1_waterMesh.position.y = Math.sin( Date.now() / 1500 ) / 4 + 1;
    mg1_water.material.uniforms.time.value += deltaTime * 0.1;
    mg1_water.render();

    mg1_animateAnotherFrame();
}

var projectileLetter = null;
var loadedProjectileChar = null;
var unfiredProjectileLetter;
function loadProjectile( char )
{
    //console.log( "Loading projectile: " + char );
    if ( char != loadedProjectileChar )
    {
        mg1_weazleMesh.remove( unfiredProjectileLetter.mesh );
        unfiredProjectileLetter.mesh = ( new Letter( char, null ) ).mesh;
        unfiredProjectileLetter.mesh.material = new THREE.MeshPhongMaterial( { color: 0x666666 } );
        unfiredProjectileLetter.mesh.scale.set( 2, 2, 2 );
        unfiredProjectileLetter.mesh.position.x = 3.25;
        unfiredProjectileLetter.mesh.position.y = 40;
        unfiredProjectileLetter.mesh.position.z = 12.5;
        unfiredProjectileLetter.mesh.rotation.x = Math.PI / 2;
        unfiredProjectileLetter.mesh.rotation.y = Math.PI;
        unfiredProjectileLetter.mesh.rotation.z = 0;
        mg1_weazleMesh.add( unfiredProjectileLetter.mesh );

        loadedProjectileChar = char;
    }

    unfiredProjectileLetter.mesh.visible = true;
}

function wordHit( projectile, word, hitIndex )
{
    if(projectile.char == word.missingLetter && word.missingLetterInd == hitIndex)
    {
        scoreWord();
        word.remove();
    }

}

function resetProjectile()
{
    if ( projectileLetter && projectileLetter.mesh )
    {
        mg1_scene.remove( projectileLetter.mesh );
    }
    
    projectileLetter = null;
    lineHidden       = false;
    mg1_line.visible = true;

    if ( missingLetters && missingLetters.length > 0 )
    {
        loadProjectile( loadedProjectileChar );
    }
}

var currLoadedProjectileInd = 0;
function loadNextProjectile()
{
    if ( missingLetters && missingLetters.length != 0 )
    {
        var nextLoadedProjectileInd = ( currLoadedProjectileInd + 1 ) % missingLetters.length;
        currLoadedProjectileInd = nextLoadedProjectileInd;
        loadProjectile( missingLetters[nextLoadedProjectileInd] );
        missingLettersChanged();
    }

}

function mg1_animateAnotherFrame()
{
    requestAnimationFrame( animateMinigame1 );
    renderer.render( mg1_scene, mg1_camera );
}

//------------------------------------------------------//
//           LETTER SHOOTING                            //
//------------------------------------------------------//
function shootLetter()
{
    lineHidden = true;
    unfiredProjectileLetter.mesh.visible = false;

    //  For safety
    if ( projectileLetter )
    {
        mg1_scene.remove( projectileLetter.mesh );
    }
    else
    {
        //  Placeholder (not really necessary)
        projectileLetter = new Letter( "A", 0 );
    }

    //  1. create Mesh from letter and add it to scene
    projectileLetter.mesh = new THREE.Mesh( unfiredProjectileLetter.mesh.geometry,
                                            unfiredProjectileLetter.mesh.material );

    projectileLetter.char = loadedProjectileChar;

    projectileLetter.mesh.position.y = 8;
    projectileLetter.mesh.position.x = projectileLetter.mesh.position.z = 0;
    projectileLetter.mesh.lookAt( new THREE.Vector3( lastX, 8, lastZ ) );
    projectileLetter.mesh.rotateX( Math.PI / 2 );
    projectileLetter.mesh.rotateY( Math.PI     );

    //  Center projectile on line
    projectileLetter.mesh.translateX( -2 );
    projectileLetter.mesh.translateY(  2 );

    projectileYSpd = 1;

    mg1_scene.add( projectileLetter.mesh );
}

var skipEffects    = [];
var numSkipEffects = 10;
var currSkipEffect =  0;
function doSkipEffect( x, z )
{
    //  This will overwrite the oldest water ripple effect
    currSkipEffect = ( currSkipEffect + 1 ) % numSkipEffects;

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

var missingLetters = [];
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

var WordArray = [];
class Word
{
    constructor( word )
    {
        this.isVisible = false;

        if ( word.length <= 3 )
        {
            this.missingLetterInd = 1;
        }
        else
        {
            this.missingLetterInd = Math.floor( randBetween( 1, NAMES_EASY[0].length - 2 ) );
        }

        this.missingLetter = word.charAt( this.missingLetterInd );

        this.word = word.slice( 0, this.missingLetterInd ) + word.slice( this.missingLetterInd + 1, word.length );

        this.letters = [];

        for ( var i = 0; i < this.word.length; i++ )
        {
            var  letter     = this.word.charAt( i );
            this.letters[i] = new Letter( letter, i * 0.02 );
        }

        this.send = function()
        {
            console.log( "Sending #" + wordsSentIndex + ": " + Date.now() );
            sendDelayed( this.letters, this );
        }

        this.sendUndelayed = function()
        {
            console.log( "Sending first: " + Date.now() );
            for ( var i = 0; i < this.letters.length; i++ )
            {
                mg1_scene.add( this.letters[i].mesh );
            }
            words.push( this );

            if ( wordsSentIndex < WordArray.length )
            {
                var nextWord = WordArray[wordsSentIndex++];

                setTimeout( function ()
                {
                    new Word( nextWord ).send();

                }, ( ( nextWord.length - 1 ) * charDist + wordDist + this.word.length * charDist ) / speed );
            }
        }

        this.remove = function()
        {

            var index = indexInArray( words, this );
            words.splice( index, 1 );

            index = indexInArray( missingLetters, this.missingLetter );
            missingLetters.splice( index, 1 );

            missingLettersChanged();

            if ( loadedProjectileChar == this.missingLetter )
            {
                loadNextProjectile();
            }

            for(var i = 0; i < this.letters.length; i++)
            {
                mg1_scene.remove( this.letters[i].mesh );
            }
        }

        this.cleanUp = function()
        {
            var index = indexInArray( words, this );
            words.splice( index, 1 );

            index = indexInArray( missingLetters, this.missingLetter );
            missingLetters.splice( index, 1 );

            missingLettersChanged();

            for ( var i = 0; i < this.letters.length; i++ )
            {
                mg1_scene.remove( this.letters[i].mesh );
            }
        }
    }

}

function missingLettersChanged()
{
    missingLetters.sort();
    
    var missingLettersCopy = missingLetters.slice();

    if ( missingLettersCopy.length > 0 )
    {
        missingLettersCopy[currLoadedProjectileInd] = "(" + missingLettersCopy[currLoadedProjectileInd] + ")";

        $( "#AvailableButtons" ).text( missingLettersCopy.join( " " ) );
    }
    else
    {
        $( "#AvailableButtons" ).text( "" );
    }


}

function sendDelayed( letters, word )
{

    //  If the minigame was ended before the last word was sent, end the chain here
    if ( endRemainingWordAdds > 0 )
    {
        return;
    }

    setTimeout( function ()
    {
        for ( var i = 0; i < letters.length; i++ )
        {
            mg1_scene.add( letters[i].mesh );
        }
        words.push( word );

        if ( wordsSentIndex < WordArray.length )
        {
            var nextWord = WordArray[wordsSentIndex++];

            setTimeout( function ()
            {
                new Word( nextWord ).send();
                
            }, ( ( nextWord.length - 1 ) * charDist + wordDist ) / speed );
        }
        
    }, (word.word.length * charDist) / speed );
}

class Letter
{
    constructor(char, offset)
    {
        this.char = char;
        this.offset = offset;

        this.mesh = new THREE.Mesh( textGeoms[charToNumber( char )],
                                    new THREE.MeshPhongMaterial( { color: 0xFF0000 } ) );

    }
}