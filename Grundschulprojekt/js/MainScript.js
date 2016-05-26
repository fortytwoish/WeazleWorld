var camera, scene, renderer;
var geometry, material, mesh;

function init() {
    alert("test");
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.z = 0.25;

    scene = new THREE.Scene();

    geometry = new THREE.PlaneGeometry(1, 1, 50, 50);
    material = new THREE.MeshBasicMaterial({ color: 0x44DD00, wireframe: true });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

}

function animate() {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);

}

init();
animate();