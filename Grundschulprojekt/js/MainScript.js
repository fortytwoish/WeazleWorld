//Constants
const ZOOM_BUTTON_INCREMENT_PERCENT = 20 / 100;
const ZOOM_DEFAULT_VALUE = 75;
const ROTATION_BUTTON_INCREMENT_DEGREES = 30;
const WATERLEVEL = 0;
const RENDER_RESOLUTION = [880, 540];
const WINDOW_CLEAR_COLOR = 0x0066BB;
const TERRAIN_RESOLUTION = 8;

//Global variables
isInMenu = true;
preventRaycastOnce = false;

//Local variables
var camera, scene, renderer;
var geometry, material, mesh;

function init() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(RENDER_RESOLUTION[0], RENDER_RESOLUTION[1]);
    $("#mainGame").css({ width: RENDER_RESOLUTION[0] + "px", height: RENDER_RESOLUTION[1] + "px" });
    renderer.setClearColor(WINDOW_CLEAR_COLOR);

    //TODO REPLACE WITH JQUERY CALL
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10);
    //camera = new THREE.OrthographicCamera(window.innerWidth / -scale, window.innerWidth / scale, window.innerHeight / scale, window.innerHeight / -scale, -1, 1000);
    camera.position.z = 1;

    scene = new THREE.Scene();
    geometry = GenerateIsland(TERRAIN_RESOLUTION, WATERLEVEL);
    material = new THREE.MeshBasicMaterial({ color: 0xAAAAAA, wireframe: true });
    waterGeom = new THREE.PlaneGeometry(32, 16, 1, 1);
    waterMat = new THREE.MeshBasicMaterial({ color: 0x0055AA, transparent: true, opacity: 0.5 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.1;
    waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.z = WATERLEVEL;
    mesh.rotation.x = -45;
    waterMesh.rotation.x = -45;

    scene.add(mesh);
    //mesh.add(new THREE.Mesh(new THREE.CubeGeometry(0.01, 0.01, 0.01, 0.01), new THREE.MeshBasicMaterial()));
    scene.add(waterMesh);

    //TODO REPLACE WITH JQUERY CALLS
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
}

function animate() {
    //if (!isInMenu) {
        //mesh.rotation.z = Date.now() / 20000;
        //camera.rotation.x = Math.sin(Date.now() / 1000) / 10;
        waterMesh.position.z = WATERLEVEL + Math.sin(Date.now() / 500) / 75;
        //waterMesh.rotation.z = rot;
    //}
        camera.updateProjectionMatrix();

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

//Button click handlers
$(function () {
    
    $(".blockRaycast").mousedown(function () {
        preventRaycastOnce = true;
    });


    /*Main game buttons*/
    $("#menuButton").click(function () {
        if (isInMenu)
            return;
        isInMenu = true;
        console.log("menu button clicked.");
        $("#menu").css("visibility", "visible");
        printMenuState("css");
        $("#menuButton").css("visibility", "hidden");
    });

    $("#moveUp").click(function () {
        
    });

    $("#moveL").click(function () {
        $({ dummyVal: mesh.rotation.z }).animate({ dummyVal: mesh.rotation.z + degreeToRad(ROTATION_BUTTON_INCREMENT_DEGREES) }, {
            duration: 500,
            step: function (now) {
                mesh.rotation.z = now;
            }
        });
    });

    $("#moveR").click(function () {
        $({ dummyVal: mesh.rotation.z }).animate({ dummyVal: mesh.rotation.z - degreeToRad(ROTATION_BUTTON_INCREMENT_DEGREES) }, {
            duration: 500,
            step: function (now) {
                mesh.rotation.z = now;
            }
        });
    });

    $("#moveDn").click(function () {

    });

    $("#zoomPlus").click(function () {
        $({ dummyVal: camera.fov }).animate({ dummyVal: camera.fov * (1 - ZOOM_BUTTON_INCREMENT_PERCENT) }, {
            duration: 500,
            step: function (now) {
                camera.fov = now;
                camera.updateProjectionMatrix();
            }
        });
    });

    $("#zoomMinus").click(function () {
        $({ dummyVal: camera.fov }).animate({ dummyVal: camera.fov * (1 + ZOOM_BUTTON_INCREMENT_PERCENT) }, {
            duration: 500,
            step: function (now) {
                camera.fov = now;
                camera.updateProjectionMatrix();
            }
        });
    });

    //Test, to be replaced by clicks on the island's objects
    $("#minigameButton").click(function () {
        if (isInMenu)
            return;
        isInMenu = true;
        minigameID = prompt("Which minigame? (1-3)");
        console.log("minigame button clicked.");
        $("#minigame").css("visibility", "visible");
        printMenuState("css");
        console.log("Reading: " + "html/minigame" + minigameID + ".html");
        $.get("html/minigame" + minigameID + ".html", function (data) {
            console.log("Contents: " + data);
            $("#minigame").html(data);
        });

    });

    

    //Menu Buttons - to be moved into menu.html
    $("#continueButton").click(function () {
        isInMenu = false;
        console.log("continue button clicked.");
        printMenuState();
        $("#menu").css("visibility", "hidden");
        $("#menuButton").css("visibility", "visible");
    });
});

//Map click handling
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

function onDocumentTouchStart(event) {

    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown(event);

}

function onDocumentMouseDown(event) {

    if (preventRaycastOnce)
    {
        preventRaycastOnce = false;
        return;
    }

    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    objects = [ mesh, waterMesh ];
    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

        intersects[0].object.material.color.setHex(Math.random() * 0xffffff);

        //var particle = new THREE.Sprite(particleMaterial);
        //particle.position.copy(intersects[0].point);
        //particle.scale.x = particle.scale.y = 16;
        //scene.add(particle);

    }

    /*
    // Parse all the faces
    for ( var i in intersects ) {

        intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

    }
    */
}

//Helper functions
function degreeToRad(degree)
{
    return degree * Math.PI / 180;
}

/*Debug*/
function printMenuState(s) {
    menu = $("#menu");
    console.log("menu: " + menu + " dimensions: " + menu.css("left") + ", " + menu.css("top") + ", " + menu.width() + " X " + menu.height() + " visibility: " + menu.css("visibility") + " " + s);
}

//Initialise background map
init();
//Start animation loop
animate();
