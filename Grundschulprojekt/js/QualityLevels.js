storage = window.localStorage;

qualityInitialized = false;

currentQuality = 1;

function loadQualityLevel()
{
	if (typeof (storage) !== "undefined" && !isNaN(storage.quality))
	{
		FIRST_TIME_PLAYING = false;
		console.log("Setting quality to loaded level: " + storage.quality);
		setQualityLevel(parseInt(storage.quality));
	} else
	{
		FIRST_TIME_PLAYING = true;
		console.log("No web storage. Setting quality to " + DEFAULT_QUALITY);
		setQualityLevel(DEFAULT_QUALITY);
	}
}

function setQualityLevel(level)
{
	numOfAsyncChanges = 0;
	totalAsyncChanges = 0;

	level = parseInt(level);

	if (typeof (storage) !== "undefined")
		storage.quality = level;

	currentQuality = level;

	//if not mobile
	controls.rotateSpeed = 1;
	controls.zoomSpeed = 2;

	renderWater = true;

	switch (level)
	{
		case 1:
			setQuality_TerrainResDependant(7);
			renderer.antialias = false;
			renderWater = false;
			subsampleFactor = 5;
			directionalLight.castShadow = false;
			GRASS_DENSITY = -1;
			break;
		case 2:
			setQuality_TerrainResDependant(7);
			renderer.antialias = false;
			renderWater = false;
			subsampleFactor = 4;
			directionalLight.castShadow = false;
			GRASS_DENSITY = -1;
			break;
		case 3:
			setQuality_TerrainResDependant(7);
			renderer.antialias = false;
			subsampleFactor = 4;
			directionalLight.castShadow = false;
			GRASS_DENSITY = -1;
			break;
		case 4:
			setQuality_TerrainResDependant(8);
			renderer.antialias = false;
			subsampleFactor = 3;
			directionalLight.castShadow = false;
			GRASS_DENSITY = 8;
			break;
		case 5:
			setQuality_TerrainResDependant(8);
			renderer.antialias = false;
			subsampleFactor = 3;
			directionalLight.castShadow = false;
			GRASS_DENSITY = 8;
			break;
		case 6:
			setQuality_TerrainResDependant(8);
			renderer.antialias = false;
			subsampleFactor = 2;
			directionalLight.castShadow = false;
			GRASS_DENSITY = 8;
			break;
		case 7:
			setQuality_TerrainResDependant(9);
			renderer.antialias = false;
			subsampleFactor = 2;
			directionalLight.castShadow = false;
			GRASS_DENSITY = 8;
			break;
		case 8:
			setQuality_TerrainResDependant(9);
			renderer.antialias = false;
			subsampleFactor = 1;
			GRASS_DENSITY = 8;
			break;
		case 9:
			setQuality_TerrainResDependant(9);
			renderer.antialias = false;
			subsampleFactor = 1;
			GRASS_DENSITY = 4;
			break;
		case 10:
			setQuality_TerrainResDependant(10);
			renderer.antialias = false;
			subsampleFactor = 1;
			GRASS_DENSITY = 4;
			break;
		case 11:
			setQuality_TerrainResDependant(10);
			renderer.antialias = false;
			subsampleFactor = 1;
			GRASS_DENSITY = 4;
			break;
		case 12:
			setQuality_TerrainResDependant(10);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 4;
			break;
		case 13:
			setQuality_TerrainResDependant(11);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 4;
			break;
		case 14:
			setQuality_TerrainResDependant(11);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 4;
			break;
		case 15:
			setQuality_TerrainResDependant(11);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 2;
			break;
		case 16:
			setQuality_TerrainResDependant(11);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 2;
			break;
		case 17:
			setQuality_TerrainResDependant(12);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 2;
			break;
		case 18:
			setQuality_TerrainResDependant(12);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 1;
			break;
		case 19:
			setQuality_TerrainResDependant(12);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 1;
			break;
		case 20:
			setQuality_TerrainResDependant(12);
			renderer.antialias = true;
			subsampleFactor = 1;
			GRASS_DENSITY = 1;
			break;
		case "htcone":
			setQuality_TerrainResDependant(12);
			renderer.antialias = false;
			controls.rotateSpeed = 0.5;
			controls.zoomSpeed = 0.5;
			subsampleFactor = 2;
			GRASS_DENSITY = 5;
			break;
	}

	renderer.setPixelRatio(window.devicePixelRatio / subsampleFactor);
}

const global_fog_scale = 0.9;

function setQuality_TerrainResDependant(terrainRes)
{
	console.log("Updating terrain: " + terrainRes);

	TERRAIN_RESOLUTION = terrainRes;

	camera.far = Math.pow(2, terrainRes + 1);
	camera.updateProjectionMatrix();

	controls.maxDistance = Math.pow(2, terrainRes - 1);
	controls.update();

	switch (terrainRes)
	{
		case 7:
			scene.fog.density = 0.003 * global_fog_scale;
			TERRAIN_OFFSET = 50;
			break;
		case 8:
			scene.fog.density = 0.002 * global_fog_scale;
			TERRAIN_OFFSET = 100;
			break;
		case 9:
			scene.fog.density = 0.001 * global_fog_scale;
			TERRAIN_OFFSET = 200;
			break;
		case 10:
			scene.fog.density = 0.0008 * global_fog_scale;
			TERRAIN_OFFSET = 400;
			break;
		case 11:
			scene.fog.density = 0.0005 * global_fog_scale;
			TERRAIN_OFFSET = 800;
			break;
		case 12:
			scene.fog.density = 0.0002 * global_fog_scale;
			TERRAIN_OFFSET = 1200;
			break;
	}

	//------------------------------------------------------//
	//       REMOVE ANY EXISTING OBJECTS                    //
	//------------------------------------------------------//

	if (typeof(waterMesh) !== 'undefined')
	{
		scene.remove(waterMesh);
		scene.remove(waterMesh2);
	}

	if (typeof (islandMesh) !== 'undefined')
		scene.remove(islandMesh);

	console.log("beginning grass removal");
	if (typeof (decorationSpriteMeshes) !== 'undefined')
	{
		console.log("decorationSpriteMeshes exists");
		for (var i = 0; i < decorationSpriteMeshes.length; i++)
		{
			console.log("trying grass removal " + i);
			if (decorationSpriteMeshes[i])
			{
				console.log("grass removal " + i);
				scene.remove(decorationSpriteMeshes[i]);
			}
		}

		grass_positions = [];
	}

	//------------------------------------------------------//
	//       CREATE/PLACE NEW OBJECTS                       //
	//------------------------------------------------------//

	initWater(); //async
	totalAsyncChanges++;

	initIsland();

	initIslandDecoration(GRASS_DENSITY);

	if (minigame_rock == null || minigame_water == null || minigame_palm == null)
	{
		initMinigameNodes(); //async
		totalAsyncChanges++;
	} else
		placeMinigameNodes();
}

var numOfAsyncChanges = 0;
var totalAsyncChanges = 3;

var fadeInTime        = 1500;
var fadeOutTime       = 1500;
var menuFadeInOffset  = 1500;

var initialized = false;

function asyncOperationFinished()
{
	if (++numOfAsyncChanges == totalAsyncChanges)
	{
		renderOnce();
		if (!initialized)
		{
			//------------------------------------------------------//
			//                  -> HTML                             //
			//------------------------------------------------------//
			var container = document.getElementById("mainGame");
			$("#overlay").animate({
				opacity: 1,
			}, fadeOutTime, function()
			{
				container.appendChild(renderer.domElement);
				renderOnce();
				stats = new Stats();

				//  Call a window resize to ensure everything fits
				onWindowResize();

				renderOnce();
				$("#overlay").animate({
					opacity: 0,
				}, fadeInTime, function()
				{
					$("#overlay").css("display", "none");
				});
			});

			$("#splashScreen h1").css("-webkit-animation-play-state", "paused");

			$(appendToo).fadeOut(fadeOutTime, function()
			{
				setTimeout(function()
				{
					if (FIRST_TIME_PLAYING) //no localstorage or first time playing - show messagebox before showing menu
						showMessageBox(["Hallo!", "Es sieht so aus als würdest Du zum ersten Mal spielen.", "Bitte stelle zuallererst die Grafikoptionen im Optionen-Menü ein."], "OK!", function()
						{
							$(menu).fadeIn(fadeInTime);
						});
					else //directly show menu
						$(menu).fadeIn(fadeInTime);
				}, menuFadeInOffset);
			});

			initMenu();

			endedSplashScreen();

            initialized = true;
        }
        else
        {
            renderOnce();
            $( "#splashScreen h1" ).css( "-webkit-animation-play-state", "paused" );
            $( "#splashScreen" ).fadeOut("fast");
            $( "#overlay" ).animate( {
                opacity: 0,
            }, fadeInTime, function ()
            {

                $( "#overlay" ).css( "display", "none" );

            } );
        }

		setQualityButtonsDisabled(false);
		$("#menuApply").val("Übernehmen");
	}
}