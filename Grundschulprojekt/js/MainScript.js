//Global variables
isInMenu = true;

//Local variables;
var camera, scene, renderer;
var geometry, material, mesh;
var rot = 0;

function init() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(880, 540);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.z = 0.75;

    scene = new THREE.Scene();

    geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
    material = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true });

    mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);
}

function animate() {
    if (!isInMenu) {
        mesh.rotation.z = (rot += 0.005);
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

$(function () {

    $("#menuButton").click(function () {
        if (isInMenu)
            return;
        isInMenu = true;
        console.log("menu button clicked.");
        $("#menu").css("visibility", "visible");
        printMenuState("css");
        $("#menuButton").css("visibility", "hidden");
    });

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
});

init();
animate();

function printMenuState(s) {
    menu = $("#menu");
    console.log("menu: " + menu + " dimensions: " + menu.css("left") + ", " + menu.css("top") + ", " + menu.width() + " X " + menu.height() + " visibility: " + menu.css("visibility") + " " + s);
}