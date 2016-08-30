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
            });

}

var states = {
    IDLE:       1,
    WALK:       2,
    BUILD_INIT: 3,
    BUILD:      4
}

const STATUE_DIST = 4;

const islandRadius = 21;

const idleToWalkChance = 0.005;

const startSpd = 2.5;

class Weazle
{
    constructor()
    {

        var targetCoords = new THREE.Vector3;
        targetCoords.y   = VILLAGE_DIMENSIONS.z;

        this.speed = startSpd;

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
                        this.startWalking();
                    }
                    break;

                //---------------------------//
                //            WALK           //
                //---------------------------//
                case states.WALK:

                    this.walkTowards( targetCoords, deltaTime );
                    if (distanceBelowThreshold(this.mesh.position, targetCoords, 5))
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
                    if ( distanceSquared(new Point(this.mesh.position.x, this.mesh.position.z), new Point(0,0)) < (STATUE_DIST * STATUE_DIST * STATUE_DIST) )
                    {
                        console.log("Distance reached");
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
                        //mixer.clipAction( weazleGeom.animations[0] ).pause();

                        // state transisition happens from outside
                        //this.state = states.IDLE;
                    }
                    break;
            }
        }

        this.walkTowards     = function ( coordinates, deltaTime )
        {
            this.mesh.lookAt( targetCoords );
            this.mesh.translateZ( deltaTime * this.speed );
        }

        this.setRandomCoords = function()
        {
            do {
                var angle      = Math.random() * Math.PI         * 2;
                targetCoords.x = Math.random() * Math.cos(angle) * islandRadius;
                targetCoords.z = Math.random() * Math.sin(angle) * islandRadius;
            }
            while (intersectsLine( -STATUE_DIST,
                                   -STATUE_DIST,
                                    STATUE_DIST * 2,
                                    STATUE_DIST * 2,
                                    new Point(this.mesh.position.x, this.mesh.position.z),
                                    new Point(targetCoords.x, targetCoords.z))          );
        }

        this.initBuilding    = function()
        {
            this.speed *= 2;

            targetCoords.x = targetCoords.z = 0;

            mixer.clipAction(weazleGeom.animations[0]).play();

            this.state = states.BUILD_INIT;
        }

        this.startWalking = function()
        {
            //  TODO: Blend to walking animation
            mixer.clipAction(weazleGeom.animations[0]).play();

            this.setRandomCoords();
            this.mesh.lookAt(targetCoords);
            this.state = states.WALK;
        }

        //  Mesh
        var angle            = Math.random() * Math.PI * 2;
        this.mesh            = new THREE.SkinnedMesh(weazleGeom, weazleMat);
        this.mesh.castShadow = true;
        this.mesh.position.x = randBetween(0.5, 1) * Math.cos(angle) * islandRadius;
        this.mesh.position.y = VILLAGE_DIMENSIONS.z;
        this.mesh.rotation.y = Math.random() * Math.PI;
        this.mesh.position.z = randBetween(0.5, 1) * Math.sin(angle) * islandRadius;
        this.mesh.scale.set(0.075, 0.075, 0.075);

        // Animation
        var mixer = new THREE.AnimationMixer(this.mesh);
        
        this.state = states.IDLE;
    }

}

function distanceBelowThreshold( meshPos, targetPos, threshold )
{
    return distanceSquared( new Point( meshPos.x, meshPos.z ), new Point( targetPos.x, targetPos.z ) ) <= threshold;
}