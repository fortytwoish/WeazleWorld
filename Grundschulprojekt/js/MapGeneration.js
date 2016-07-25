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

    //  force water in middle
    middle = midpoint( topLeft, topRight, bottomLeft, bottomRight );
    field[middle.x][middle.y] = -TERRAIN_OFFSET / 32;


    /******************************************************/
    /*  GENERATE HEIGHTMAP USING DIAMOND SQUARE ALGORITHM */
    /******************************************************/
    for ( var i = 0; i < size; i++ )
    {
        squareStep( i, topLeft, topRight, bottomLeft, bottomRight );
        offset /= 2;
        diamondStep( i, topLeft, topRight, bottomLeft, bottomRight );
    }


    //  Create geometry from generated heightmap
    var geometry = new THREE.PlaneBufferGeometry( dim, dim, dim - 1, dim - 1 );
    //  default orientation is off - roll by 90°
    geometry.rotateX( -degreeToRad(90) );

    var count = 1;
    for ( var i = 0; i < dim; i++ )
    {
        for ( var j = 0; j < dim; j++ )
        {
            geometry.attributes.position.array[count] = field[i][j] / ( size * 75 );
            count += 3; //Go to next vertex's y-property (skip z and x)
        }
    }

    return geometry;

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

function GenerateIslandMaterial( geometry, sunPosition )
{
    geometry.computeFaceNormals();

    var angle = 0.0;

    var curr;

    var materials = [];

    for ( var i = 0; i < geometry.faces.length; i++ )
    {
        geometry.faces[i].materialIndex = i;

        curr            = angleBetweenVectors3D( geometry.faces[i].normal, sunPosition );
        calculatedColor = new THREE.Color( curr * 120, curr * 60, curr * 30 );
        console.log( calculatedColor );
        materials[i]    = new THREE.MeshBasicMaterial( { color: calculatedColor } );
    }

    var material = new THREE.MeshFaceMaterial( materials );
    return material;
}

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

