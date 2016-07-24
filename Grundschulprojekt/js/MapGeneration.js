debugOutput_everyField = false;
debugOutput_lastField = false;
debugOutput_PointArithmetic = false;
debugOutput_FieldValueSetting = false;

function GenerateIsland( size, waterLevel )
{
    dim = Math.pow( 2, size ) + 1;
    offset = TERRAIN_OFFSET;

    console.log( "Generating Island:" );
    console.log( "dim:    " + dim );
    console.log( "offset: " + offset );

    //Initialize Field as square 2D Array of size (2^size + 1)
    field = new Array( dim );
    for ( var i = 0; i < dim; i++ )
        field[i] = new Array( dim );

    console.log( "Field initialized." );
    console.log( "Field width:  " + field.length );
    console.log( "Field height: " + field[0].length );

    topLeft = new Point( 0, 0 );
    topRight = new Point( dim - 1, 0 );
    bottomLeft = new Point( 0, dim - 1 );
    bottomRight = new Point( dim - 1, dim - 1 );
    field[topLeft.x][topLeft.y] =
        field[topRight.x][topRight.y] =
        field[bottomLeft.x][bottomLeft.y] =
        field[bottomRight.x][bottomRight.y] = 2;

    //force water in middle
    middle = midpoint( topLeft, topRight, bottomLeft, bottomRight );
    field[middle.x][middle.y] = -TERRAIN_OFFSET / 4;

    if ( debugOutput_everyField ) debug_displayOnConsole();
    for ( var i = 0; i < size; i++ )
    {
        if ( debugOutput_everyField ) console.log( "performing square step.." );
        squareStep( i, topLeft, topRight, bottomLeft, bottomRight );
        if ( debugOutput_everyField ) debug_displayOnConsole();
        offset /= 2;
        if ( debugOutput_everyField ) console.log( "performing diamond step.." );
        diamondStep( i, topLeft, topRight, bottomLeft, bottomRight );
        if ( debugOutput_everyField ) debug_displayOnConsole();
    }
    if ( debugOutput_lastField && !debugOutput_everyField ) debug_displayOnConsole();

    var geometry = new THREE.PlaneGeometry( dim, dim, dim - 1, dim - 1 );
    var count = 0;
    for ( var i = 0; i < dim; i++ )
        for ( var j = 0; j < dim; j++ )
        {
            //Create artificial ground
            //if (Math.abs(middle.x - i) <= 10 && Math.abs(middle.y - j) <= 10)
            //    geometry.vertices[count++].z = waterLevel - 0.06;
            //else
            geometry.vertices[count++].z = field[i][j] / ( size * 75 );
        }

    return geometry;

}

function squareStep( depth, tl, tr, bl, br )
{
    var midPoint = midpoint( tl, tr, bl, br );
    if ( debugOutput_PointArithmetic ) console.log( "[Square Step] midPoint: [" + midPoint.x + ", " + midPoint.y + "]" );
    if ( depth-- != 0 )
    {
        squareStep( depth, tl, midBetween( tl, tr ), midBetween( tl, bl ), midPoint );  //top-left square
        squareStep( depth, midBetween( tl, tr ), tr, midPoint, midBetween( tr, br ) );  //top-right square
        squareStep( depth, midBetween( tl, bl ), midPoint, bl, midBetween( bl, br ) );  //bottom-left square
        squareStep( depth, midPoint, midBetween( tr, br ), midBetween( bl, br ), br );  //bottom-right square
    }
    else
    {
        var val = ( ( field[tl.x][tl.y] + field[tr.x][tr.y] + field[bl.x][bl.y] + field[br.x][br.y] ) / 4 + randBetween( -offset, offset ) );
        if ( debugOutput_PointArithmetic ) console.log( "Averaging " + "[" + tl.x + ", " + tl.y + "] (" + field[tl.x][tl.y] + ") + " + "[" + tr.x + ", " + tr.y + "] (" + field[tr.x][tr.y] + ") + " + "[" + bl.x + ", " + bl.y + "] (" + field[bl.x][bl.y] + ") + " + "[" + br.x + ", " + br.y + "] (" + field[br.x][br.y] + ")" );
        if ( debugOutput_FieldValueSetting ) console.log( " Setting [" + midPoint.x + "," + midPoint.y + "] to " + val );
        if ( field[midPoint.x][midPoint.y] == undefined )
            field[midPoint.x][midPoint.y] = val;
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
        if ( debugOutput_FieldValueSetting )
        {
            console.log( "DiamondStep at 0 depth:" );
            console.log( "halfT: [" + halfT.x + ", " + halfT.y + "] (" + field[halfT.x][halfT.y] + ")" );
            console.log( "halfR: [" + halfR.x + ", " + halfR.y + "] (" + field[halfR.x][halfR.y] + ")" );
            console.log( "halfB: [" + halfB.x + ", " + halfB.y + "] (" + field[halfB.x][halfB.y] + ")" );
            console.log( "halfL: [" + halfL.x + ", " + halfL.y + "] (" + field[halfL.x][halfL.y] + ")" );
        }
        if ( field[halfT.x][halfT.y] == undefined )
        {
            var val = ( ( field[tl.x][tl.y] + field[tr.x][tr.y] ) / 2 + randBetween( -offset, offset ) );
            if ( debugOutput_FieldValueSetting ) console.log( " Setting [" + halfT.x + "," + halfT.y + "] to " + val );
            field[halfT.x][halfT.y] = val;
        }
        if ( field[halfR.x][halfR.y] == undefined )
        {
            var val = ( ( field[tr.x][tr.y] + field[br.x][br.y] ) / 2 + randBetween( -offset, offset ) );
            if ( debugOutput_FieldValueSetting ) console.log( " Setting [" + halfR.x + "," + halfR.y + "] to " + val );
            field[halfR.x][halfR.y] = val;
        }
        if ( field[halfB.x][halfB.y] == undefined )
        {
            var val = ( ( field[bl.x][bl.y] + field[br.x][br.y] ) / 2 + randBetween( -offset, offset ) );
            if ( debugOutput_FieldValueSetting ) console.log( " Setting [" + halfB.x + "," + halfB.y + "] to " + val );
            field[halfB.x][halfB.y] = val;
        }
        if ( field[halfL.x][halfL.y] == undefined )
        {
            var val = ( ( field[tl.x][tl.y] + field[bl.x][bl.y] ) / 2 + randBetween( -offset, offset ) );
            if ( debugOutput_FieldValueSetting ) console.log( " Setting [" + halfL.x + "," + halfL.y + "] to " + val );
            field[halfL.x][halfL.y] = val;
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

