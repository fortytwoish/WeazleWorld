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

    var topLeft                         = new Point( 0, 0 );
    var topRight                        = new Point( dim - 1, 0 );
    var bottomLeft                      = new Point( 0, dim - 1 );
    var bottomRight                     = new Point( dim - 1, dim - 1 );
    field[topLeft.x][topLeft.y]         = 2;
    field[topRight.x][topRight.y]       = 2;
    field[bottomLeft.x][bottomLeft.y]   = 2;
    field[bottomRight.x][bottomRight.y] = 2;

    middle = midpoint( topLeft, topRight, bottomLeft, bottomRight );

    console.log( "Map dimensions: " + (dim - 1) + "² (2^" + size + ")" );
    console.log( pointToString(topLeft) + " -- \t" + pointToString(topRight) );
    console.log( " | \t"      + pointToString(middle) + " \t| " );
    console.log( pointToString(bottomLeft) + " -- \t" + pointToString(bottomRight) );


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
    for ( var i = 0; i < size; i++ )
    {
        squareStep( i, topLeft, topRight, bottomLeft, bottomRight );
        offset /= 2;
        diamondStep( i, topLeft, topRight, bottomLeft, bottomRight );
    }

    for ( i = 25; i > 0; i-- )
    {
        smoothBeaches( i / 5 );
    }

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

    /******************************************************/
    /*  CREATE GEOMETRY FROM THE HEIGHTMAP                */
    /******************************************************/
    var geometry = new THREE.PlaneBufferGeometry( dim - 1, dim - 1, dim - 1, dim - 1 );
    //  default orientation is off - roll by 90°
    geometry.rotateX( -degreeToRad(90) );

    var count = 1;
    for ( var i = 0; i < dim; i++ )
    {
        for ( var j = 0; j < dim; j++ )
        {
            geometry.attributes.position.array[count] = field[i][j];
            count += 3; //Go to next vertex's y-property (skip z and x)
        }
    }

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

                field[ i ][ j ] =
                (
                   field[( i )    ][( j - 1 )] +
                   field[( i )    ][( j + 1 )] +
                   field[( i - 1 )][( j )    ] +
                   field[( i - 1 )][( j - 1 )] +
                   field[( i - 1 )][( j + 1 )] +
                   field[( i + 1 )][( j  )   ] +
                   field[( i + 1 )][( j - 1 )] +
                   field[( i + 1 )][( j + 1 )]
                )
                / 8 + Math.random() / 2;
            }
        }
    }
}

function smooth( smoothingArea, reach )
{
    //  Smooth out the plateau's edges
    for ( i = -( VILLAGE_DIMENSIONS.x / 2 ) * smoothingArea ; i <= ( VILLAGE_DIMENSIONS.x / 2 ) * smoothingArea ; i++ )
    {
        for ( j = -( VILLAGE_DIMENSIONS.y / 2 ) * smoothingArea ; j <= ( VILLAGE_DIMENSIONS.y / 2 ) * smoothingArea ; j++ )
        {
            field[( middle.x + i )][( middle.y + j)] = (
                field[( middle.x + i         )][( middle.y + j - reach )] +
                field[( middle.x + i         )][( middle.y + j + reach )] +
                field[( middle.x + i - reach )][( middle.y + j         )] +
                field[( middle.x + i - reach )][( middle.y + j - reach )] +
                field[( middle.x + i - reach )][( middle.y + j + reach )] +
                field[( middle.x + i + reach )][( middle.y + j         )] +
                field[( middle.x + i + reach )][( middle.y + j - reach )] +
                field[( middle.x + i + reach )][( middle.y + j + reach )]
                ) / 8 + randBetween(-0.2, 0.2);


        }
    }
}

function squareStep(    depth,
                        tl, tr,
                        bl, br )
{
    var midPoint = midpoint( tl, tr, bl, br );

    if ( depth-- != 0 )
    {
        squareStep( depth,
                    //top-left square
                    tl,                     midBetween( tl, tr ),
                    midBetween( tl, bl ),   midPoint );  

        squareStep( depth,
                    //top-right square
                    midBetween( tl, tr ),   tr,
                    midPoint,               midBetween( tr, br ) );  

        squareStep( depth,
                    //bottom-left square
                    midBetween( tl, bl ),   midPoint,
                    bl,                     midBetween( bl, br ) );  

        squareStep( depth,
                    //bottom-right square
                    midPoint,               midBetween( tr, br ),
                    midBetween( bl, br ),   br );  
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

function diamondStep(   depth,
                        tl, tr,
                        bl, br )
{
    var midPoint = midpoint( tl, tr, bl, br );

    if ( depth-- != 0 )
    {

        diamondStep( depth,
                        //top-left square
                        tl,                     midBetween( tl, tr ),

                        midBetween( tl, bl ),   midPoint );


        diamondStep( depth,
                        //top-right square
                        midBetween( tl, tr ),   tr,

                        midPoint,               midBetween( tr, br ) );

        diamondStep( depth,
                        //bottom-left square
                        midBetween( tl, bl ),   midPoint,

                        bl,                     midBetween( bl, br ) );

                        
        diamondStep( depth,
                        //bottom-right square
                        midPoint,               midBetween( tr, br ),

                        midBetween( bl, br ),   br );
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

function GenerateShadowMapTexture( geometry, sunPosition )
{
    geometry.computeVertexNormals();

    var normalVector     = new THREE.Vector3(),
        up               = new THREE.Vector3( 0, 1, 0 );
        normalComponents = geometry.attributes.normal.array,
        width            = dim,
        height           = dim;

    //  The shadow map texture will be drawn on an HTML canvas' drawing context.
    //  For that, we need to access the context's imageData array of color values. ( [RGBA RGBA RGBA R...] )
    canvas            = document.createElement( 'canvas' );
    canvas.width      = width;
    canvas.height     = height;

    context           = canvas.getContext( '2d' );
    //  Clear the context first by filling it with black
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );

    image             = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData         = image.data;

    for ( var i = 0, j = 0; j < imageData.length; i += 4, j += 3 )
    {
        //  Extract the current vertex's normal vector from the normal components array ( [XYZ XYZ XYZ XY...] )
        normalVector.x = normalComponents[j];
        normalVector.y = normalComponents[j + 1];
        normalVector.z = normalComponents[j + 2];

        normalVector.normalize();

        //  Angle as a value between 0 and 1
        angle    = angleBetweenVectors3D( normalVector, sunPosition ) / Math.PI * 2;

        //  Shade scaled to the value domain of a color value [0, 255]
        shade    = angle * 255;

        //  High angle to sun = low shade (mountainside), low angle = high shade (flat land).
        //  Therefore, invert the shade value.
        shadeInv = 255 - shade;
        shadeInv /= 2;

        var upAngle = angleBetweenVectors3D( normalVector, up ) / Math.PI * 2;

        //  Subtract a fixed value and a relative value (based on depth) when the vertex is under water
        //  Since this is a shadow map, set x, y and z values equally
        if ( geometry.attributes.position.array[j + 1] > WATERLEVEL - 10)
        {
            if ( geometry.attributes.position.array[j + 1] <= 2 && geometry.attributes.position.array[j + 1] >= -10 && upAngle <= 0.5 )
            {
                shadeInv /= 2.5;
                imageData[i]     = (shadeInv * (geometry.attributes.position.array[j + 1] + 10)).clamp8Bit();
                imageData[i + 1] = (shadeInv * (geometry.attributes.position.array[j + 1] + 10) * 0.85).clamp8Bit();
                imageData[i + 2] = (shadeInv * 8).clamp8Bit();
            }
            else if ( upAngle <= 0.4 && geometry.attributes.position.array[j + 1] <= 200 )
            {
                imageData[i]     = shadeInv.clamp8Bit();
                imageData[i + 1] = (shadeInv * ( 2 - upAngle )).clamp8Bit();
                imageData[i + 2] = shadeInv.clamp8Bit();
            }
            else
            {
                imageData[i]     = (shadeInv - Math.random() * 20).clamp8Bit();
                imageData[i + 1] = (shadeInv - Math.random() * 20).clamp8Bit();
                imageData[i + 2] = (shadeInv - Math.random() * 20).clamp8Bit();
            }

        }
        else
        {
            shadeInv -= 10;

            imageData[i]     =
            imageData[i + 1] = 
            imageData[i + 2] = (Math.max(0, shadeInv + geometry.attributes.position.array[j + 1])).clamp8Bit();
        }

    }

    //  Smooth out color transitions
    //for ( x = 0; x < 10; x++ )
    //{
    //    for ( var i = 4; i < imageData.length - 4; i += 4 )
    //    {
    //        imageData[i] = ( imageData[i - 4] + imageData[i + 4] ) / 2;
    //        imageData[i + 1] = ( imageData[i - 3] + imageData[i + 5] ) / 2;
    //        imageData[i + 2] = ( imageData[i - 2] + imageData[i + 6] ) / 2;
    //    }
    //}
    

    context.putImageData( image, 0, 0 );

    var texture   = new THREE.CanvasTexture( canvas );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
}

Number.prototype.clamp8Bit = function ( )
{
    return Math.min( Math.max( this, 0 ), 255 );
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

