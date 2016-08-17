//------------------------------------------------------//
//              Init Weazles                            //
//------------------------------------------------------//
function Weazle_init()
{
    var loader = new THREE.OBJLoader( );
    loader.load( 'Models/Otter.obj', function ( object )
    {
        object.traverse( function ( child )
        {

            if ( child instanceof THREE.Mesh )
            {

                weazleGeom = child.geometry;
                weazle_mat = new THREE.MeshPhongMaterial( { color: 0xAAAAAA } );

            }

        } );

        onWeazleLoadingFinished();

    } );

}

class Weazle
{
    constructor()
    {
        var weazlemesh = new THREE.Mesh( weazleGeom, weazle_mat );
        weazlemesh.castShadow = true;
        weazlemesh.position.x = 0;
        weazlemesh.position.y = VILLAGE_DIMENSIONS.z + 0.1;
        weazlemesh.position.z = 0;

        weazlemesh.scale.set( 0.0005, 0.0005, 0.0005 );

        this.mesh = weazlemesh;

        this.moveRandomly = function ()
        {
            //this.mesh.position.x = ( Math.random() * VILLAGE_DIMENSIONS.x ) - VILLAGE_DIMENSIONS.x / 2;
            //this.mesh.position.y = field[Math.round( middle.x + this.mesh.position.z )][Math.round( middle.y + this.mesh.x )] + 1;
            //this.mesh.position.z = ( Math.random() * VILLAGE_DIMENSIONS.y ) - VILLAGE_DIMENSIONS.y / 2;

            var rand = Math.random();

            if ( rand < 0.25 )
            {
                this.mesh.position.x+= 0.01;
            }
            else if( rand < 0.5 )
            {
                this.mesh.position.x-=0.01;
            }
            else if ( rand < 0.75 )
            {
                this.mesh.position.z += 0.01;
            }
            else
            {
                this.mesh.position.z-=0.01;
            }

            if ( this.mesh.position.x < -VILLAGE_DIMENSIONS.x )
            {
                this.mesh.position.x = -VILLAGE_DIMENSIONS.x;
            }
            else if ( this.mesh.position.x > VILLAGE_DIMENSIONS.x )
            {
                this.mesh.position.x = VILLAGE_DIMENSIONS.x;
            }
            if ( this.mesh.position.z < -VILLAGE_DIMENSIONS.y )
            {
                this.mesh.position.z = -VILLAGE_DIMENSIONS.y;
            }
            else if ( this.mesh.position.z > VILLAGE_DIMENSIONS.y )
            {
                this.mesh.position.z = VILLAGE_DIMENSIONS.y;
            }

        }
    }


}