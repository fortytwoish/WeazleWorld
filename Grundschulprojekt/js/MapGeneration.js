//  Shadow clamp values (prevents full white and full black)
const CLAMP_ROCK        = [30, 150];
const CLAMP_GRASS       = [30, 200];
const CLAMP_WATER       = [0, 255];
const TEXTUREBRIGHTNESS = 0.45;


//  "Biome" borders (upper limits)
const BEACH_HEIGHT      = 3.25;
const BEACH_SLOPE       = 0.75;
const GRASS_HEIGHT      = 150;
const GRASS_SLOPE       = 0.65;
const TREE_HEIGHT       = 4;
const TREE_SLOPE        = 1;
const SNOW_HEIGHT       = 750;

//  Chance of a fitting vertex being changed to a tree, in percent
const TREE_DENSITY      = 35;
const TREE_HEIGHT_MIN   = 2;
const TREE_HEIGHT_MAX   = 4;

island_peaks = [0, 0, 0];
grass_positions = [];

function GenerateIsland( size, waterLevel )
{
    dim = Math.pow( 2, size ) + 1;
    offset = TERRAIN_OFFSET;

    //Initialize Field as square 2D Array of size (2^size + 1)
    field = new Array( dim );
    for ( var i = 0; i < dim; i++ )
    {
        field[i] = new Array( dim );
    }

    var topLeft = new Point( 0, 0 );
    var topRight = new Point( dim - 1, 0 );
    var bottomLeft = new Point( 0, dim - 1 );
    var bottomRight = new Point( dim - 1, dim - 1 );
    field[topLeft.x][topLeft.y] = 2;
    field[topRight.x][topRight.y] = 2;
    field[bottomLeft.x][bottomLeft.y] = 2;
    field[bottomRight.x][bottomRight.y] = 2;

    middle = midpoint( topLeft, topRight, bottomLeft, bottomRight );

    console.log( "Map dimensions: " + ( dim - 1 ) + "² (2^" + size + ")" );
    console.log( pointToString( topLeft ) + " -- \t" + pointToString( topRight ) );
    console.log( " | \t\t" + pointToString( middle ) + " \t| " );
    console.log( pointToString( bottomLeft ) + " -- \t" + pointToString( bottomRight ) );
	console.log("Using offset value: \t\t" + offset + " / " + TERRAIN_OFFSET);


    //  Set height values of play area before heightmap generation so it fits into the map nicely
    var padding = 15;   //The circle's extra radius

    for ( i = -( VILLAGE_DIMENSIONS.x / 2 ) - padding; i <= ( VILLAGE_DIMENSIONS.x / 2 ) + padding; i++ )
    {
        for ( j = -( VILLAGE_DIMENSIONS.y / 2 ) - padding; j <= ( VILLAGE_DIMENSIONS.y / 2 ) + padding; j++ )
        {
            if ( Math.pow( Math.abs( i ) + Math.abs( j ), 2 ) < Math.pow( VILLAGE_DIMENSIONS.x + padding, 2 ) )
            {
                field[( middle.x + i )][( middle.y + j )] = VILLAGE_DIMENSIONS.z + Math.random() / 4;
            }
        }
    }

    //  force water in middle (will generate
    field[middle.x][middle.y] = -25;

    /******************************************************/
    /*  GENERATE HEIGHTMAP USING DIAMOND SQUARE ALGORITHM */
    /******************************************************/
    var start = new Date().getTime();
    for ( var i = 0; i < size; i++ )
    {
        squareStep( i, topLeft, topRight, bottomLeft, bottomRight );
        offset /= 2;
        diamondStep( i, topLeft, topRight, bottomLeft, bottomRight );
    }

    log( start, new Date().getTime(), "Diamond Square" );
    start = new Date().getTime();

    //  Smooth beaches
    for ( i = 20; i > 0; i-- )
    {
        smoothBeaches( i / 5 );
    }

    log( start, new Date().getTime(), "Smooth beaches" );
    start = new Date().getTime();

    //  Smooth underwater
    smoothUnderwater( waterLevel - 10, 1 );

    log( start, new Date().getTime(), "Smooth water" );

    /******************************************************/
    /*  CREATE A PLATEAU IN THE MIDDLE OF THE PLAY AREA   */
    /******************************************************/
    //  Force-set height values again, to ensure that a play area exists
    for ( i = -( VILLAGE_DIMENSIONS.x / 2 ) - padding; i <= ( VILLAGE_DIMENSIONS.x / 2 ) + padding; i++ )
    {
        for ( j = -( VILLAGE_DIMENSIONS.y / 2 ) - padding; j <= ( VILLAGE_DIMENSIONS.y / 2 ) + padding; j++ )
        {
            if ( Math.pow( Math.abs( i ) + Math.abs( j ), 2 ) < Math.pow( VILLAGE_DIMENSIONS.x + padding, 2 ) )
            {
                field[( middle.x + i )][( middle.y + j )] = VILLAGE_DIMENSIONS.z + Math.random() / 4;
            }
        }
    }

    start = new Date().getTime();

    //  Smooth the play area
    for ( i = 0; i < 1; i++ )
    {
        smooth( 16, 1 );
    }
    for ( i = 0; i < 10; i++ )
    {
        smooth( 4, 1 );
    }
    for ( i = 0; i < 10; i++ )
    {
        smooth( 1, 1 );
    }

    padding = 3;
    //  Force-set height values again, to ensure that a play area exists
    for ( i = -( VILLAGE_DIMENSIONS.x / 2 ) - padding; i <= ( VILLAGE_DIMENSIONS.x / 2 ) + padding; i++ )
    {
        for ( j = -( VILLAGE_DIMENSIONS.y / 2 ) - padding; j <= ( VILLAGE_DIMENSIONS.y / 2 ) + padding; j++ )
        {
            if ( Math.pow( Math.abs( i ) + Math.abs( j ), 2 ) < Math.pow( VILLAGE_DIMENSIONS.x + padding, 2 ) )
            {
                field[( middle.x + i )][( middle.y + j )] = VILLAGE_DIMENSIONS.z;
            }
        }
    }

    start = new Date().getTime();

    /******************************************************/
    /*  CREATE GEOMETRY FROM THE HEIGHTMAP                */
    /******************************************************/
    var geometry = new THREE.PlaneBufferGeometry( dim - 1, dim - 1, dim - 1, dim - 1 );
    //  default orientation is off - roll by 90°
    geometry.rotateX( -degreeToRad( 90 ) );

    var count = 1;
    for ( var i = 0; i < dim; i++ )
    {
        for ( var j = 0; j < dim; j++ )
        {
            geometry.attributes.position.array[count] = field[i][j];
            count += 3; //Go to next vertex's y-property (skip z and x)
        }
    }

    log( start, new Date().getTime(), "Create Geometry" );

    return geometry;

}

function smoothBeaches( height )
{
    for ( var i = 2; i < dim - 2; i++ )
    {
        for ( var j = 2; j < dim - 2; j++ )
        {
            if ( field[i][j] <= height && field[i][j] >= -20 )
            {
                var pnt = new Point( i, j );

                field[i][j] =
                (
                   field[( i )][( j - 1 )] +
                   field[( i )][( j + 1 )] +
                   field[( i - 1 )][( j )] +
                   field[( i - 1 )][( j - 1 )] +
                   field[( i - 1 )][( j + 1 )] +
                   field[( i + 1 )][( j )] +
                   field[( i + 1 )][( j - 1 )] +
                   field[( i + 1 )][( j + 1 )]
                )
                / 8 + Math.random() / 2;
            }
        }
    }
}

function smoothUnderwater( height, reach )
{
    for ( var i = reach; i < dim - reach; i++ )
    {
        for ( var j = reach; j < dim - reach; j++ )
        {
            if ( field[i][j] <= height )
            {
                field[i][j] = (
                    field[ i         ][ j - reach ] +
                    field[ i         ][ j + reach ] +
                    field[ i - reach ][ j         ] +
                    field[ i - reach ][ j - reach ] +
                    field[ i - reach ][ j + reach ] +
                    field[ i + reach ][ j         ] +
                    field[ i + reach ][ j - reach ] +
                    field[ i + reach ][ j + reach ]
                ) / 8;
            }
        }
    }
}

function smooth( smoothingArea, reach )
{
    if( middle.x - (VILLAGE_DIMENSIONS.x / 2  * smoothingArea) < 1 || middle.x + (VILLAGE_DIMENSIONS.x / 2 * smoothingArea) > field.length)
    {
        return;
    }

    //  Smooth out the plateau's edges
    for ( i = -( VILLAGE_DIMENSIONS.x / 2 ) * smoothingArea ; i <= ( VILLAGE_DIMENSIONS.x / 2 ) * smoothingArea ; i++ )
    {
        for ( j = -( VILLAGE_DIMENSIONS.y / 2 ) * smoothingArea ; j <= ( VILLAGE_DIMENSIONS.y / 2 ) * smoothingArea ; j++ )
        {
            field[( middle.x + i )][( middle.y + j )] = (
                field[( middle.x + i )][( middle.y + j - reach )] +
                field[( middle.x + i )][( middle.y + j + reach )] +
                field[( middle.x + i - reach )][( middle.y + j )] +
                field[( middle.x + i - reach )][( middle.y + j - reach )] +
                field[( middle.x + i - reach )][( middle.y + j + reach )] +
                field[( middle.x + i + reach )][( middle.y + j )] +
                field[( middle.x + i + reach )][( middle.y + j - reach )] +
                field[( middle.x + i + reach )][( middle.y + j + reach )]
                ) / 8 + randBetween( -0.2, 0.2 );
        }
    }
}

function squareStep( depth,
                        tl, tr,
                        bl, br )
{
    var midPoint = midpoint( tl, tr, bl, br );

    if ( depth-- != 0 )
    {
        squareStep( depth,
                    //top-left square
                    tl, midBetween( tl, tr ),
                    midBetween( tl, bl ), midPoint );

        squareStep( depth,
                    //top-right square
                    midBetween( tl, tr ), tr,
                    midPoint, midBetween( tr, br ) );

        squareStep( depth,
                    //bottom-left square
                    midBetween( tl, bl ), midPoint,
                    bl, midBetween( bl, br ) );

        squareStep( depth,
                    //bottom-right square
                    midPoint, midBetween( tr, br ),
                    midBetween( bl, br ), br );
    }
    else
    {
        //Only set the value of "new" fields - overlap does occur!
        if ( field[midPoint.x][midPoint.y] == undefined )
        {
            var value = ( field[tl.x][tl.y] + field[tr.x][tr.y] + field[bl.x][bl.y] + field[br.x][br.y] ) / 4   // Average value of the four corners
                      + randBetween( -offset, offset );                                                         // +/- random offset

            field[midPoint.x][midPoint.y] = value;
        }
    }
}

function diamondStep( depth,
                        tl, tr,
                        bl, br )
{
    var midPoint = midpoint( tl, tr, bl, br );

    if ( depth-- != 0 )
    {

        diamondStep( depth,
                        //top-left square
                        tl, midBetween( tl, tr ),

                        midBetween( tl, bl ), midPoint );


        diamondStep( depth,
                        //top-right square
                        midBetween( tl, tr ), tr,

                        midPoint, midBetween( tr, br ) );

        diamondStep( depth,
                        //bottom-left square
                        midBetween( tl, bl ), midPoint,

                        bl, midBetween( bl, br ) );


        diamondStep( depth,
                        //bottom-right square
                        midPoint, midBetween( tr, br ),

                        midBetween( bl, br ), br );
    }
    else
    {
        //These are the four mid points
        //half of the top line
        var halfT = midBetween( tl, tr );
        //half of the right line
        var halfR = midBetween( tr, br );
        //half of the bottom line
        var halfB = midBetween( bl, br );
        //half of the left line
        var halfL = midBetween( tl, bl );

        //Only set the value of "new" fields - overlap does occur!

        if ( field[halfT.x][halfT.y] == undefined )
        {
            field[halfT.x][halfT.y] = ( field[tl.x][tl.y] + field[tr.x][tr.y] ) / 2 // Average value of the four corners
                                    + randBetween( -offset, offset );               // +/- random offset
        }
        if ( field[halfR.x][halfR.y] == undefined )
        {
            field[halfR.x][halfR.y] = ( field[tr.x][tr.y] + field[br.x][br.y] ) / 2 // Average value of the four corners
                                    + randBetween( -offset, offset );               // +/- random offset
        }
        if ( field[halfB.x][halfB.y] == undefined )
        {
            field[halfB.x][halfB.y] = ( field[bl.x][bl.y] + field[br.x][br.y] ) / 2 // Average value of the four corners
                                    + randBetween( -offset, offset );               // +/- random offset
        }
        if ( field[halfL.x][halfL.y] == undefined )
        {
            field[halfL.x][halfL.y] = ( field[tl.x][tl.y] + field[bl.x][bl.y] ) / 2 // Average value of the four corners
                                    + randBetween( -offset, offset );               // +/- random offset
        }

    }
}

var perfDebug = false;

function GenerateMaterial( geometry, sunPosition )
{
    start = new Date().getTime();

    //  The geometry's faces' normal vertices are used to compute their angle towards the sun as well as 
    //  their slope.
    geometry.computeVertexNormals();

    if ( perfDebug )
    {
        log( start, new Date().getTime(), "Comp Normals" );
        start = new Date().getTime();
    }

    var normalVector     = new THREE.Vector3(),
        up               = new THREE.Vector3( 0, 1, 0 );
        normalComponents = geometry.attributes.normal.array,
        width            = dim,
        height           = dim;

    //  The shadow map texture will be drawn on an HTML canvas' drawing context.
    //  For that, we need to access the context's imageData array of color values. ( [RGBA RGBA RGBA R...] )
    canvas               = document.createElement( 'canvas' );
    canvas.width         = width;
    canvas.height        = height;

    //  Get a clear context
    context              = canvas.getContext( '2d' );
    context.fillStyle    = '#000';
    context.fillRect( 0, 0, width, height );

    image                = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData            = image.data;

    var time1 = 0, time2 = 0, time3 = 0;

    var fieldX = 0, fieldY = 0;

    for ( var i = 0, j = 0; j < imageData.length; i += 4, j += 3 )
    {
        fieldX++;

        if(fieldX >= dim)
        {

            fieldY++;
            fieldX = 0;
        }

        ////  Can the current coordinate be a new peak?
        //if ( geometry.attributes.position.array[j + 1] > island_peaks[0] )
        //{
        //    var i = 1;
        //    //  Which peak is it?
        //    while( geometry.attributes.position.array[j + 1] > island_peaks[i] )
        //    {
        //        i++;
        //    }
        //    //Insert value into array at position i-1
        //    for(var k = i - 1; )
        //}

        if ( imageData[i] != 0 )
        {
            continue;
        }

        start2 = new Date().getTime();

        //  Extract the current vertex's normal vector from the normal components array ( [XYZ XYZ XYZ XY...] )
        normalVector.x = normalComponents[j];
        normalVector.y = normalComponents[j + 1];
        normalVector.z = normalComponents[j + 2];

        normalVector.normalize();

        //  Angle as a value between 0 and 1

        angle = angleBetweenVectors3D( normalVector, sunPosition ) / Math.PI * 2;

        if ( perfDebug )
        {
            time1 += ( new Date().getTime() - start2 );
            start2 = new Date().getTime();
        }

        //  Shade scaled to the value domain of a color value [0, 255]
        shade = angle * 255;

        //  High angle to sun = low shade (mountainside), low angle = high shade (flat land).
        //  Therefore, invert the shade value.
        shadeInv = 255 - shade;

        //  Global texture brightness
        shadeInv *= TEXTUREBRIGHTNESS;

        var upAngle = angleBetweenVectors3D( normalVector, up ) / Math.PI * 2;

        if ( perfDebug )
        {
            time2 += ( new Date().getTime() - start2 );
            start2 = new Date().getTime();
        }

        /***********************************
        *           ABOVE WATER            *
        ***********************************/
        if ( geometry.attributes.position.array[j + 1] > WATERLEVEL - 10 )
        {
            /***********************************
            *           Flat, low ground       *
            *               (Beach)            *
            ***********************************/

            if ( geometry.attributes.position.array[j + 1] <= BEACH_HEIGHT && upAngle <= BEACH_SLOPE )
            {
                shadeInv /= 7;
                imageData[i]     = ( shadeInv * ( geometry.attributes.position.array[j + 1] + 20 ) * 0.875 ).clamp8Bit( CLAMP_GRASS );
                imageData[i + 1] = ( shadeInv * ( geometry.attributes.position.array[j + 1] + 20 ) * 0.8 ) .clamp8Bit( CLAMP_GRASS );
                imageData[i + 2] = ( shadeInv * 13 ).clamp8Bit( CLAMP_GRASS );
            }

                /***********************************
                *        Flat, medium ground       *
                *        (Grass and/or Tree)       *
                ***********************************/
            else if ( geometry.attributes.position.array[j + 1] <= randBetween( GRASS_HEIGHT, GRASS_HEIGHT * 1.5 ) && upAngle <= GRASS_SLOPE )
            {
                /***********************************
                *               GRASS              *
                ***********************************/
                imageData[i]     = ( shadeInv * 0.9 ).clamp8Bit( CLAMP_GRASS );
                imageData[i + 1] = ( shadeInv * 1.65 ).clamp8Bit( CLAMP_GRASS );
                imageData[i + 2] = ( shadeInv * 0.8 ).clamp8Bit( CLAMP_GRASS );

                if ( geometry.attributes.position.array[j + 1] <= randBetween( TREE_HEIGHT, TREE_HEIGHT * 1.5 ) && upAngle <= TREE_SLOPE && Math.random() < ( TREE_DENSITY / 100 ) )
                {
                    //  Don't generate trees in the play area

                    //if (   Math.abs( dim / 2 - fieldX ) > VILLAGE_DIMENSIONS.x
                    //    || Math.abs( dim / 2 - fieldY ) > VILLAGE_DIMENSIONS.y )
                    //{                    
                    //    /***********************************
                    //    *              + TREE              *
                    //    ***********************************/
                    //    geometry.attributes.position.array[j + 1] += randBetween( TREE_HEIGHT_MIN, TREE_HEIGHT_MAX );

                    //    shadeInv *= randBetween( 0.7, 0.9 );

                    //    imageData[i]     =   shadeInv                    .clamp8Bit( CLAMP_GRASS );
                    //    imageData[i + 1] = ( shadeInv * ( 2 - upAngle ) ).clamp8Bit( CLAMP_GRASS );
                        //    imageData[i + 2] =   shadeInv                    .clamp8Bit( CLAMP_GRASS );
                        grass_positions.push( new THREE.Vector3( geometry.attributes.position.array[j] + Math.random() / 2, geometry.attributes.position.array[j + 2] + Math.random() / 2, -( geometry.attributes.position.array[j + 1] + 0.5 ) ) );
                    //}

                    

                }

            }
            else if ( geometry.attributes.position.array[j + 1] >= randBetween( SNOW_HEIGHT * 0.95, SNOW_HEIGHT ) && upAngle <= 0.85 )
            {
                /***********************************
                *               SNOW              *
                ***********************************/
                shadeInv *= 5;

                imageData[i]     = shadeInv.clamp8Bit( CLAMP_ROCK );
                imageData[i + 1] = shadeInv.clamp8Bit( CLAMP_ROCK );
                imageData[i + 2] = shadeInv.clamp8Bit( CLAMP_ROCK );
            }

                /***********************************
                *        Sloped, high ground       *
                *               (Rock)             *
                ***********************************/
            else
            {
                shadeInv += randBetween( -20, 20 );
                shadeInv *= 1.75;

                imageData[i]     = ( shadeInv + 12 ).clamp8Bit( CLAMP_ROCK );
                imageData[i + 1] =
                imageData[i + 2] = shadeInv         .clamp8Bit( CLAMP_ROCK );
            }

        }

            /***********************************
            *           BELOW WATER            *
            ***********************************/
        else
        {

            shadeInv /= 5;
            imageData[i] = ( shadeInv * ( 0 + 20 ) * 0.85 + geometry.attributes.position.array[j + 1] ).clamp8Bit( CLAMP_GRASS );
            imageData[i + 1] = ( shadeInv * ( 0 + 20 ) * 0.85 + geometry.attributes.position.array[j + 1] ).clamp8Bit( CLAMP_GRASS );
            imageData[i + 2] = ( shadeInv * 13 + geometry.attributes.position.array[j + 1] ).clamp8Bit( CLAMP_GRASS );

        }

        if ( perfDebug )
        {
            time3 += ( new Date().getTime() - start2 );
            start2 = new Date().getTime();
        }
    }

    context.putImageData( image, 0, 0 );

    var texture = new THREE.CanvasTexture( canvas );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    log( start, new Date().getTime(), "Create Texture" );

    if(perfDebug)
    {
        console.log( "- step 1 \t\t" + time1 );
        console.log( "- step 2 \t\t" + time2 );
        console.log( "- step 3 \t\t" + time3 );
    }


    return texture;
}

Number.prototype.clamp8Bit = function ( clamp )
{
    return Math.min( Math.max( this, clamp[0] ), clamp[1] );
};

function debug_displayOnConsole()
{
    var s = "";
    console.log( "Current content of \"field\":" )
    for ( var i = 0; i < dim * 12; i++ )
        s += "=";
    console.log( s );
    for ( var x = 0; x < dim; x++ )
    {
        s = "";
        for ( var y = 0; y < dim; y++ )
        {
            s += ( "    " + ( Math.floor( field[x][y] ) ) ).slice( -4 ) + " | ";
        }
        console.log( "|" + s );
        s = "";
        for ( var i = 0; i < ( dim * 12 ) - 2; i++ )
            s += "=";
        console.log( "|" + s + "|" );
    }
    s = "";
}

function log( start, end, step )
{
    var time = end - start;
    console.log( step + "\t\t Execution time: " + time );
}