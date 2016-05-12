

var camera, scene, renderer;
var geometry, material, mesh;
var x;


var init = function () {
    alert("test");
    alert(x);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth - 25, window.innerHeight - 20);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;
    camera.position.y = 250;

    scene = new THREE.Scene();

    roadGeometry = new THREE.PlaneGeometry(300, 100000, 1, 1);

    roadTex = THREE.ImageUtils.loadTexture("Resources/Strasse.jpg");
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(1, 500);
    roadTex.anisotropy = renderer.getMaxAnisotropy();
    road = new THREE.Mesh(roadGeometry, new THREE.MeshPhongMaterial({ map: roadTex }));
    road.rotation.x = -(Math.PI / 180) * 90;

    greenGeometry = new THREE.CubeGeometry(300, 100000, 10, 10);
    greenTex = THREE.ImageUtils.loadTexture("Resources/Grass.jpg");
    greenTex.wrapS = greenTex.wrapT = THREE.RepeatWrapping;
    greenTex.repeat.set(1, 500);
    greenTex.anisotropy = renderer.getMaxAnisotropy();
    greenMat = new THREE.MeshPhongMaterial({ map: greenTex });
    green1 = new THREE.Mesh(greenGeometry, greenMat);
    green2 = new THREE.Mesh(greenGeometry, greenMat);
    green1.rotation.x = -(Math.PI / 180) * 90;
    green2.rotation.x = -(Math.PI / 180) * 90;
    green1.position.x = -300;
    green2.position.x = 300;

    car = new THREE.Mesh(new THREE.CubeGeometry(40, 20, 60), new THREE.MeshPhongMaterial({ color: 0xFF3300 }));
    car.position.y = 15;

    spotLightTarget = new THREE.Mesh(new THREE.CubeGeometry(0, 0, 0), new THREE.MeshBasicMaterial());
    spotLightTarget.position.y = 15;
    spotLightTarget.position.z = -125;

    light = new THREE.SpotLight(0xFFFFFF);
    light.distance = 2500;
    light.decay = 1;
    light.exponent = 1;
    light.target = spotLightTarget;
    light.intensity = 1;
    light.position.y = 25;
    light.position.z = -100;

    backLight = new THREE.PointLight(0xFF0000);
    backLight.position.set(0, 10, 40);
    backLight.distance = 100;
    backLight.intensity = 5;

    pickup = new THREE.Mesh(new THREE.SphereGeometry(25), new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
    pickup.position.z = -2000;
    pickupLight = new THREE.PointLight(0xA86FFF);
    pickupLight.position.y = 50;
    pickupLight.intensity = 1.5;
    pickupLight.distance = 200;
    pickup.add(pickupLight);

    scene.add(road);
    scene.add(green1);
    scene.add(green2);
    scene.add(pickup);
    scene.add(car);
    x = new THREE.AmbientLight(0xFFEEBB);
    x.intensity = 0.25;
    scene.add(x);
    car.add(light);
    car.add(backLight);
    car.add(spotLightTarget);
    car.add(camera);

    var toAdd1;
    var toAdd2;
    var toAddLight;

    var geom1 = new THREE.CubeGeometry(5, 5, 200);
    var geom2 = new THREE.CubeGeometry(100, 5, 5);
    var mat = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });
    //THREE.GeometryUtils.merge(geom1, geom2);

    for (i = 0; i < 100000; i += 1500) {
        toAdd1 = new THREE.Mesh(geom1, mat);
        toAdd1.castShadow = true;
        toAdd2 = new THREE.Mesh(geom2, mat);
        toAdd1.position.set(300, 100, -i);
        toAdd2.position.set(250, 200, -i);
        /*
        toAddLight = new THREE.PointLight( 0xFFF08F );
        toAddLight.distance = 300;
        toAddLight.position.x = -50;
        toAddLight.position.y = 100;
        toAdd1.add(toAddLight);
        */
        toAdd1.rotation.x = -(Math.PI / 180) * 90;
       

        scene.add(toAdd1);
        scene.add(toAdd2);
    }


    cameraType = 0;
    cameraZOffset = 0;

    document.addEventListener('keydown', function (e)
    {
        if (greenTex.anisotropy != 0)
            greenTex.anisotropy = 0
        else
            greenTex.anisotropy == renderer.getMaxAnisotropy();
        if (rotationTimer != 0)
            return;
        var key = e.keyCode;
        console.log(key);
        switch (key) {
            case 87: 					// W
                speed++;
                break;
            case 65: 					// A
                if (car.position.x > -130)
                    car.position.x -= 10;
                break;
            case 83: 					// S
                speed--;
                break;
            case 68: 					// D

                if (car.position.x < 130)
                    car.position.x += 10;
                break;

            case 37: 					// LEFT ARROW
                if (cameraType != 1) {
                    cameraType = 1;
                    camera.rotation.y = Math.PI;
                    cameraZOffset = -1500;
                    camera.position.y = 250;
                }

                break;

            case 39: 					// RIGHT ARROW
                if (cameraType != 2) {
                    cameraType = 2;
                    cameraZOffset = -500;
                    camera.rotation.y = 0;
                    camera.position.y = 20;
                }
                break;

            case 40: 					// DOWN ARROW
                if (cameraType != 0) {
                    cameraType = 0;
                    cameraZOffset = 0;
                    camera.rotation.y = 0;
                    camera.position.y = 250;
                }
                break;


        }
    });

}

speed = 0;
rotationTimer = 0;

var animate = function () {
    if (car.position.z >= -50000)
        requestAnimationFrame(animate);

    if (car.position.z >= -50000)
        renderer.render(scene, camera);

    car.position.z -= speed;
    camera.position.z = cameraZOffset + 500;

    pickupLight.intensity = (Math.sin(Date.now() / 200) * 0.8) + 1.5;

    if (car.position.z <= -50000)
        alert("You win!");

    if (rotationTimer != 0) {
        rotationTimer--;
        car.rotation.y = rotationTimer / 10;
    }

    if (Math.abs(Math.abs(car.position.z) - Math.abs(pickup.position.z)) <= 50) {
        pickup.position.z = 0; //"Hide"
        if (prompt("What is 2x2?") != 4) {
            speed = 0;
            rotationTimer = 200;
        }
        else
            speed *= 10;
    }
}

//init();
//animate();