//Initial_ StateINIT>>>>>>>>>:
    var currentMessageBoxValue = 1;

    var GAME_STATES = { 1:"SPLASH", 2:"START", 3:"MENU", 4:"MAIN", 5:"MINIGAME_1", 6:"MINIGAME_2", 7:"MINIGAME_3", 8:"SCORE_SCREEN"};
    var DIFFICULTIES = { 1:"EASY", 2:"NORMAL" , 3:"HARD"};
    var STATUE_STATES = { 1:"NOT_STARTED", 2:"IN_CONSTRUCTION", 3:"CONSTRUCTED"};

    var gameState = GAME_STATES.SPLASH;
    var difficulty = DIFFICULTIES.NORMAL;

    var statueModel;
    var statueState = STATUE_STATES.NOT_STARTED;

    ///////////// ----MG1------ / ----MG2------ / -----MG3---------- /
    ///////////// [0] MG1Done [1] accuracy  | [2] MG2Done [3] accuracy  | [4] MG3Done [5] accuracy;
    statueModel = {MG1Done:0 , MG1Accuracy:0 , MG2Done:0 , MG2Accuracy:0 , MG3Done:0 , MG3Accuracy:0};

    //initializing Menu 
    //INT 0<->1
    var volume_level = 1;
    var GRAPHIC_QUALITIES = { 1:"VERY_LOW" , 2:"LOW" , 3:"MEDIUM", 4:"HIGH", 5:"MAXIMUM"};
    var graphicQuality = GRAPHIC_QUALITIES.MEDIUM;

    var MINIGAME_STATE;
    //Construction of MiniGame Database
    //-----//--------------//-----------//--------//----------//--------------//
    //	MG1         : Possible=>[0]    Played=>[1]    Won => [2]  Lost => [3]  Accuracy=> [4]
    //	MG2         : Possible=>[5]    Played=>[6]    Won => [7]  Lost => [8]  Accuracy=> [9] 
    //	MG3         : Possible=>[10]   Played=>[11]    Won =>[12] Lost =>[13]  Accuracy=>[14]
    MINIGAME_STATE = {MG1Possible: 0 , MG1Played: 0 , MG1Won: 0 , MG1Lost: 0 , MG1Accuracy: 0 ,
                      MG2Possible: 0 , MG2Played: 0 , MG2Won: 0 , MG2Lost: 0 , MG1Accuracy: 0 ,
                      MG3Possibel: 0 , MG3Played: 0 , MG3Won: 0 , MG3Lost: 0 , MG2Accuracy: 0
    };

//INITIALIZES>>>>>>>>>>>>>>>>:
       
    //Function to initialize the statue Model(possibles) according to prior set Difficulty
    function initialize_StatueModel() {
        switch (difficulty) {
            case DIFFICULTIES.EASY:
                MINIGAME_STATE.MG1Possible = MINIGAME_STATE.MG1Possible = MINIGAME_STATE.MG1Possible = 2;
            case DIFFICULTIES.MEDIUM:
                MINIGAME_STATE.MG1Possible = MINIGAME_STATE.MG1Possible = MINIGAME_STATE.MG1Possible = 3;
            case DIFFICULTIES.HARD:
                MINIGAME_STATE.MG1Possible = MINIGAME_STATE.MG1Possible = MINIGAME_STATE.MG1Possible = 4;
            default:
                console.log("Init of StatueModel Possibilities Failed (Wrong Difficulty)");
        }
    }

    //Construction of MiniGame Database
    //-------------//--------------//---------------//----------//-----------//--------------//
    //	MG1         : Possible=>[0]    Played=>[1]    Won => [2]  Lost => [3]  Accuracy=> [4]
    //	MG2         : Possible=>[5]    Played=>[6]    Won => [7]  Lost => [8]  Accuracy=> [9] 
    //	MG3         : Possible=>[10]   Played=>[11]   Won =>[12]  Lost =>[13]  Accuracy=>[14]
    function initialize_MinigameStateModel(mg1Possible, mg2Possible, mg3Possible) {
        MINIGAME_STATE.MG1Possible = mg1Possible;
        MINIGAME_STATE.MG2Possible = mg2Possible;
        MINIGAME_STATE.MG3Possible = mg3Possible;
    }
    
//CLICK-HANDLES>>>>>>>>>>>>>>:

        //draft <-<
    function click_SplashScreen(){
        gameState = GAME_STATES.START;
        //Start other scripts..		
    }

    //Param= Quality settings concept ( CONST In MAP GEN)
    function click_MapGenStart(terrainRes)
    {
        gameState = GAME_STATES.START;
        
        if (terrainRes != null && terrainRes >= 7 && terrainRes <= 12) {
            console.log("Creating new terrain: " + terrainRes);

            //Generate new terrain
            setQuality_TerrainResDependant(terrainRes);
            controls.update(); //Necessary to bring the camera into bounds

            //      ISLAND
            var islandGeom = GenerateIsland(terrainRes, WATERLEVEL);

            /* texture test */
            var islandMat = new THREE.MeshPhongMaterial({ map: GenerateShadowMapTexture(islandGeom, SUN_POSITION) });
            islandMat.shading = THREE.FlatShading;

            scene.remove(islandMesh);
            islandMesh = new THREE.Mesh(islandGeom, islandMat);
            scene.add(islandMesh);
        }
    }

//METHODS>>>>>>>>>>>>>>>>>>>>>>>>>:

    function show_MessageBox(message) {
       
        $("# ")
 
    }

//GETTER AND SETTER>>>>>>>>>>>>>>>:

    function minigameWon(minigameNumber, points, lostTries) {
        if (minigameNumber == 1) {
            MINIGAME_STATE[1] += tries + 1;
            MINIGAME_STATE[2] += 1;
            MINIGAME_STATE[3] += lostTries;
            MINIGAME_STATE[4] += points;
        }
        if (minigameNumber == 2) {
            MINIGAME_STATE[6] += tries + 1;
            MINIGAME_STATE[7] += 1;
            MINIGAME_STATE[8] += lostTries;
            MINIGAME_STATE[9] += points;
        }
        if (minigameNumber == 3) {
            MINIGAME_STATE[11] += tries + 1;
            MINIGAME_STATE[12] += 1;
            MINIGAME_STATE[13] += lostTries;
            MINIGAME_STATE[14] += points;
        }
    }

    //<<draft>> starting Minigame via minigameID
    function start_Minigame(minigameID) {
        $("#minigame").css("visibility", "visible");

        $("#menuButton").css("visibility", "hidden");
        $("#minigameButton").css("visibility", "hidden");
        $("#newMapButton").css("visibility", "hidden");
        console.log("minigame button clicked.");

        console.log("Reading: " + "html/minigame" + minigameID + ".html");
        $.get("html/minigame" + minigameID + ".html", function (data) {
            console.log("Contents: " + data);
            $("#minigame").html(data);
        });
    }

    function showCreditsScreen() {
        //TODO:
    }

    //returns value of possible Minigames starts depending on minigameID
    function canStartMinigame(minigameID) {
        switch (minigameID) {
            case "1":
                return MINIGAME_STATE.MG1Possible - MINIGAME_STATE.MG1Played;
            case "2":
                return MINIGAME_STATE.MG2Possible - MINIGAME_STATE.MG2Played;
            case "3":
                return MINIGAME_STATE.MG3Possible - MINIGAME_STATE.MG3Played;
            default:
                console.log("Error in minigameID ( canstartMinigame..)");
                return;
        }
    }

    //Returns: int[15]
    //	MG1         : Possible=>[0]    Played=>[1]    Won => [2]  Lost => [3]  Accuracy=> [4]
    //	MG2         : Possible=>[5]    Played=>[6]    Won => [7]  Lost => [8]  Accuracy=> [9] 
    //	MG3         : Possible=>[10]   Played=>[11]   Won =>[12]  Lost =>[13]  Accuracy=>[14]
    //-------------//--------------//---------------//----------//-----------//--------------//
    function getMinigameStates() {
        tmp = new int[15];

        for (var i = 0; i < 15; i++) {
            tmp[i] = MINIGAME_STATE[i]
        }
        return tmp;
    }

    //Returns: int[5]
    //	MG1         : Possible=>[0]    Played=>[1]    Won => [2]  Lost => [3]  Accuracy=> [4]
    //-------------//--------------//---------------//----------//-----------//--------------//
    function getMinigameOneState() {
        tmp = new int[5];
        for (var i = 0; i < 5; i++) {
            tmp[i] = MINIGAME_STATE[i]
        }
        return tmp;
    }

    //Returns: int[5]
    //	MG2         : Possible=>[5]    Played=>[6]    Won => [7]  Lost => [8]  Accuracy=> [9] 
    //-------------//--------------//---------------//----------//-----------//--------------//
    function getMinigameTwoState() {
        tmp = new int[5];
        for (var i = 5; i < 10; i++) {
            tmp[i] = MINIGAME_STATE[i];
        }
        return tmp;
    }

    //Returns: int[5]
    //	MG3         : Possible=>[10]   Played=>[11]   Won =>[12]  Lost =>[13]  Accuracy=>[14]
    //-------------//--------------//---------------//----------//-----------//--------------//
    function getMinigameThreeState() {
        tmp = new int[4];
        for (var i = 10; i < 15; i++) {
            tmp[i] = MINIGAME_STATE[i];
        }
        return tmp;
    }

    //returns current StatueState
    function getStatueState() {
        return statueState;
    }

    //returns current GameState
    function getGameState() {
        return gameState;
    }

    //sets volume from 0-100
    function setVolume(volume) {
        if (volume > 100) volume_level = 100;
        else if (volume < 0) volume_level = 0;
        else volume_level = volume;
    }

    //sets difficulty DIFFICULTY.EASY//.MEDIUM//.HARD
    function setDifficulty(_diff) {
        difficulty = _diff;
    }

    function getNextMessageBoxText() {
        if (currentMessageBoxValue > 9)
            currentMessageBoxValue = 1;
        return messageBoxTexte[currentMessageBoxValue++];
    }

//DEBUG>>>>>>>>>>>>>>>>>>>>>>:    

    //Construction of MiniGame Database
    //-----//--------------//-----------//--------//----------//--------------//
    //	MG1         : Possible=>[0]    Played=>[1]    Won => [2]  Lost => [3]  Accuracy=> [4]
    //	MG2         : Possible=>[5]    Played=>[6]    Won => [7]  Lost => [8]  Accuracy=> [9] 
    //	MG3         : Possible=>[10]   Played=>[11]   Won =>[12]  Lost =>[13]  Accuracy=>[14]
    function debug_PrintMinigameStates() {
        console.log("Minigame1: Possible: " + MINIGAME_STATE[0] + " Played: " + MINIGAME_STATE[1] + " Won: " + MINIGAME_STATE[2] + " Lost " + MINIGAME_STATE[3] + " Accuracy:" + MINIGAME_STATE[4]);
        console.log("Minigame1: Possible: " + MINIGAME_STATE[5] + " Played: " + MINIGAME_STATE[6] + " Won: " + MINIGAME_STATE[7] + " Lost " + MINIGAME_STATE[8] + " Accuracy:" + MINIGAME_STATE[9]);
        console.log("Minigame1: Possible: " + MINIGAME_STATE[10] + " Played: " + MINIGAME_STATE[11] + " Won: " + MINIGAME_STATE[12] + " Lost " + MINIGAME_STATE[13] + " Accuracy:" + MINIGAME_STATE[14]);

    }

    //Print Debug: GameState
    function debug_PrintGameState() {
        console.log("Game State: " + gameState);
    }

    //Print Debug: StatueState
    function debug_PrintStatueState() {
        console.log("Statue State: " + statueState);
    }

    //Print Debug: Settings
    function debug_PrintSettings() {
        console.log("Difficulty : " + difficulty + " Volume Level: " + volumeLevel + " Graphic Quality : " + graphicQuality);
    }
    
//<draft>: AUFBAU GAMETEXTS>>:

    var messageBoxTexte = { 1:"Willkommen auf Weazle Island",
        2:"Dein Ziel ist die Unterstützung des Weazle Volks, welches auf dieser Insel gestrandet ist.",
        3:"Die Weazle werden Missstände ankündigen und Euer kluger Kopf wird ihre Probleme lösen.",
        4:"Viel Spaß und Erfolg!",
        5:"Nun schaut euch erst einmal in Ruhe auf der Insel um.",
        6:"Sobald über einem Weazle ein Ausrufezeichen erscheint, solltest Du mit ihr oder ihm sprechen.",
        7:"Herzlichen Glückwunsch, Du hast die erste Aufgabe erfolgreich bewältigt!",
        8:"Zu Deinen Ehren baut das Weazle Volk eine Statue. ",
        9:"Es ist von deinen Ergebnissen abhängig, wie hoch die Statue wird undaus welchem Material sie bestehen wird."};
        