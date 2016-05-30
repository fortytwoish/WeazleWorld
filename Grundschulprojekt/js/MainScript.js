//Global variables
isInMenu = true;

//Local variables
var camera, scene, renderer;
var geometry, material, mesh;
var waterLevel = 0;

function init() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(880, 540);
    renderer.setClearColor(0x0066BB);
    //renderer.setPixelRatio(device.pixelRatio);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10);
    //camera = new THREE.OrthographicCamera(window.innerWidth / -scale, window.innerWidth / scale, window.innerHeight / scale, window.innerHeight / -scale, -1, 1000);
    camera.position.z = 1;

    scene = new THREE.Scene();
    geometry = GenerateIsland(8, waterLevel);
    material = new THREE.MeshBasicMaterial({ color: 0xAAAAAA, wireframe: true });
    waterGeom = new THREE.PlaneGeometry(32, 16, 1, 1);
    waterMat = new THREE.MeshBasicMaterial({ color: 0x0055AA, transparent: true, opacity: 0.5 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.1;
    waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.z = waterLevel;
    mesh.rotation.x = -45;
    waterMesh.rotation.x = -45;

    testMesh = new THREE.Mesh(new THREE.CubeGeometry(0.02, 0.02, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: false }));
    testMesh.position.set(0, 0, -0.04);
    mesh.add(testMesh);

    scene.add(mesh);
    //mesh.add(new THREE.Mesh(new THREE.CubeGeometry(0.01, 0.01, 0.01, 0.01), new THREE.MeshBasicMaterial()));
    scene.add(waterMesh);

    //click handling
    particleMaterial = new THREE.MeshBasicMaterial({

        color: 0x000000

    });

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    //TODO REPLACE WITH JQUERY CALLS
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
}

function animate() {
    //if (!isInMenu) {
        mesh.rotation.z = Date.now() / 2500;
        //camera.rotation.x = Math.sin(Date.now() / 1000) / 10;
        waterMesh.position.z = waterLevel + Math.sin(Date.now() / 500) / 75;
        //waterMesh.rotation.z = rot;
    //}
        camera.fov = (40 * Math.sin(Date.now()/5000) + 50);
        camera.updateProjectionMatrix();

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

//Button click handlers
$(function () {

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

    $("#zoomPlus").click(function () {
        //if (isInMenu)
        //    return;
        //camera.fov *= 0.95;
        //camera.updateProjectionMatrix();
        waterLevel += 0.1;
    });

    $("#zoomMinus").click(function () {
        //if (isInMenu)
        //    return;
        //camera.fov *= 1.05;
        //camera.updateProjectionMatrix();
        waterLevel -= 0.1;

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

//Initialise map in background
init();
//Start animation loop
animate();

/*Debug*/
function printMenuState(s) {
    menu = $("#menu");
    console.log("menu: " + menu + " dimensions: " + menu.css("left") + ", " + menu.css("top") + ", " + menu.width() + " X " + menu.height() + " visibility: " + menu.css("visibility") + " " + s);
}

function onDocumentTouchStart(event) {

    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown(event);

}

function onDocumentMouseDown(event) {

    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    objects = [ mesh, waterMesh, testMesh ];
    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

        intersects[0].object.material.color.setHex(Math.random() * 0xffffff);

        var particle = new THREE.Sprite(particleMaterial);
        particle.position.copy(intersects[0].point);
        particle.scale.x = particle.scale.y = 16;
        scene.add(particle);

    }

    /*
    // Parse all the faces
    for ( var i in intersects ) {

        intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

    }
    */
}