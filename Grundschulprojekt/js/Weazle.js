//------------------------------------------------------//
//              Init Weazles                            //
//------------------------------------------------------//
function Weazle_init()
{
    //  Is actually a .jd file, renamed to .js because the server won't load files it doesn't know
    new THREE.JDLoader().load( "Models/otter.js",
            function ( data )
            {
                weazleGeom = data.geometries[0];

                weazleMat = data.materials[0];

                onWeazleLoadingFinished();
            } );
}

var states = {
    IDLE:       1,
    WALK:       2,
    BUILD_INIT: 3,
    BUILD:      4
}

const idleToWalkChance = 0.01;

class Weazle
{
    constructor()
    {

        var targetCoords = new THREE.Vector3;
        targetCoords.y   = VILLAGE_DIMENSIONS.z;

        //===========================//
        //      STATE MACHINE        //
        //===========================//
        this.update = function ( deltaTime )
        {
            mixer.update( deltaTime );

            switch ( this.state )
            {
                //---------------------------//
                //            IDLE           //
                //---------------------------//
                case states.IDLE:

                    if ( Math.random() <= idleToWalkChance )
                    {
                        //  TODO: Blend to walking animation
                        mixer.clipAction( weazleGeom.animations[0] ).play();

                        this.setRandomCoords();
                        this.mesh.lookAt( targetCoords );
                        this.state = states.WALK;
                    }
                    break;

                //---------------------------//
                //            WALK           //
                //---------------------------//
                case states.WALK:

                    this.walkTowards( targetCoords, deltaTime );
                    if ( distanceBelowThreshold( this.mesh.position, targetCoords, 5 ) )
                    {
                        //  TODO: Blend to idle animation
                        mixer.clipAction( weazleGeom.animations[0] ).stop();
                        //  TODO: Make hammer visible

                        this.state = states.IDLE;
                    }
                    break;

                //---------------------------//
                //        BUILD_INIT         //
                //---------------------------//
                case states.BUILD_INIT:

                    this.walkTowards( targetCoords, deltaTime );
                    if ( false /*finished*/)
                    {
                        //  TODO: Blend to building animation
                        mixer.clipAction( weazleGeom.animations[0] ).stop();
                        //  TODO: Make hammer visible

                        this.state = states.BUILD;
                    }
                    break;


                //---------------------------//
                //           BUILD           //
                //---------------------------//
                case states.BUILD:
                    if ( false /*finished*/ )
                    {
                        //  TODO: Blend to idle animation
                        mixer.clipAction( weazleGeom.animations[0] ).pause();

                        this.state = states.IDLE;
                    }
                    break;
            }
        }

        this.walkTowards = function ( coordinates, deltaTime )
        {
            this.mesh.lookAt( targetCoords );
            this.mesh.translateZ( deltaTime * 2.5 );
        }

        this.setRandomCoords = function()
        {
            var angle = Math.random() * Math.PI * 2;
            targetCoords.x = Math.random() * Math.cos( angle ) * 20;
            targetCoords.z = Math.random() * Math.sin( angle ) * 20;
        }

        //  Mesh
        var weazlemesh        = new THREE.SkinnedMesh( weazleGeom, weazleMat );
        weazlemesh.castShadow = true;
        weazlemesh.position.x = 0;
        weazlemesh.position.y = VILLAGE_DIMENSIONS.z;
        weazlemesh.position.z = 0;
        weazlemesh.scale.set( 0.075, 0.075, 0.075 );

        //weazlemesh.material = new THREE.MeshPhongMaterial();
        //weazlemesh.material.color.setHex( Math.round( 0xFFFFFF * Math.random() ) );


        this.mesh = weazlemesh;

        // Animation
        var mixer = new THREE.AnimationMixer( weazlemesh );
        
        this.state = states.IDLE;
    }


}

function distanceBelowThreshold( meshPos, targetPos, threshold )
{
    return distanceSquared( new Point( meshPos.x, meshPos.z ), new Point( targetPos.x, targetPos.z ) ) <= threshold;
}