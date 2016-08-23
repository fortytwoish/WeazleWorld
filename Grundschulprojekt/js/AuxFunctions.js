/* MATHS */

function degreeToRad( degree )
{
    return degree * Math.PI / 180;
}

function randBetween( low, high )
{
    return ( Math.random() * ( high - low ) ) + low;
}

/*  VECTOR 2D ARITHMETICS */

function Point( x, y )
{
    this.x = x;
    this.y = y;
}

function distanceSquared( pointA, pointB )
{
    return Math.pow( pointA.x - pointB.x, 2 ) + Math.pow( pointA.y - pointB.y, 2 );
}

function midBetween( pointA, pointB )
{
    return new Point(( ( pointA.x + pointB.x ) / 2 ), ( ( pointA.y + pointB.y ) / 2 ) );
}

function midpoint( pointA, pointB, pointC, pointD )
{
    return new Point(( ( pointA.x + pointB.x + pointC.x + pointD.x ) / 4 ), ( ( pointA.y + pointB.y + pointC.y + pointD.y ) / 4 ) );
}

/*  VECTOR 3D ARITHMETICS */

function dotProduct( vector3D_A, vector3D_B )
{
    var dot = vector3D_A.x * vector3D_B.x +
              vector3D_A.y * vector3D_B.y +
              vector3D_A.z * vector3D_B.z;

    return dot;
}

function crossProduct3D( vector3D_A, vector3D_B )
{
    var vector3D_C =    new THREE.Vector3();

    vector3D_C.x   =    vector3D_A.y * vector3D_B.z -
                        vector3D_A.z * vector3D_B.y;

    vector3D_C.y    =   vector3D_A.z * vector3D_B.x -
                        vector3D_A.x * vector3D_B.z;

    vector3D_C.z    =   vector3D_A.x * vector3D_B.y -
                        vector3D_A.y * vector3D_B.x;

    return vector3D_C;
}

function vector3DMagnitude( vector3D )
{
    var magn = Math.sqrt( vector3D.x * vector3D.x + 
                          vector3D.y * vector3D.y + 
                          vector3D.z * vector3D.z);

    return magn;
}

function angleBetweenVectors3D( vector3D_A, vector3D_B )
{
    var angle = Math.acos(dotProduct( vector3D_A, vector3D_B ) /
                (vector3DMagnitude( vector3D_A ) * vector3DMagnitude( vector3D_B )));

    return angle;
}

function vec3DToString( vec3D )
{
    return vec3D.x + " / " + vec3D.y + " / " + vec3D.z;
}

/*  OTHER   */
function pointToString( point )
{
    return "[ " + point.x + " , " + point.y + " ]";
}

function arrayContains( a, obj )
{
    for ( var i = 0; i < a.length; i++ )
    {
        if ( a[i] === obj )
        {
            return true;
        }
    }
    return false;
}