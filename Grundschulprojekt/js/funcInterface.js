//Init States
var GAME_STATES = { "SPLASH", "START", "MENU", "MAIN", "MINIGAME_1", "MINIGAME_2", "MINIGAME_3", "SCORE_SCREEN"},
var DIFFICULTIES = {"EASY", "NORMAL" , "HARD"};
var STATUE_STATES = { "NOT_STARTED", "IN_CONSTRUCTION", "CONSTRUCTED"};

var gameState = GAME_STATES.SPLASH;
var difficulty = DIFFICULTIES.NORMAL;

var statueModel = new int[];
var statueState = STATUE_STATES.NOT_STARTED;
///////////// ----MG1------ / ----MG2------ / -----MG3---------- /
//[0] possible [1] MG1Done  | [2] possible [3] MG2Done | [4] possible [5] MG3Done;
statueModel = {0,0,0,0,0,0};


//initializing Menu 
//INT 0<->1
var volume_level = 1;
var GRAPHIC_QUALITIES = { "VERY_LOW" ; "LOW" ; "MEDIUM"; "HIGH"; "MAXIMUM"};
var graphicQuality = GRAPHIC_QUALITIES.MEDIUM;

//Construction of MiniGame Database
//--------//--------//-------//---------------//
//	MG1 :  Played=>[0] Won => [1] Lost => [2] Accuracy=> [3]
//	MG2 :  Played=>[4] Won => [5] Lost => [6] Accuracy=> [7] 
//	MG3 :  Played=>[8] Won => [9] Lost =>[10] Accuracy=>[11]
var MINIGAME_STATE = new int[12];
MINIGAME_STATE = {0,0,0,0,0,0,0,0,0,0,0,0};

    function minigameWon(var minigameNumber, var points, var lostTries)
    {
        if(minigameNumber == 1){
        {
            MINIGAME_STATE[0] +=    tries+1;
            MINIGAME_STATE[1] +=    1;
            MINIGAME_STATE[2] +=    lostTries;
            MINIGAME_STATE[3] +=    points;
        }
        if(minigameNumber == 2)
        {
	        MINIGAME_STATE[4] +=    tries+1;
            MINIGAME_STATE[5] +=    1;
            MINIGAME_STATE[6] +=    lostTries;
            MINIGAME_STATE[7] +=    points;
        }
        if(minigameNumber == 3)
        {
            MINIGAME_STATE[8]  +=   tries+1;
            MINIGAME_STATE[9]  +=   1;
            MINIGAME_STATE[10] +=   lostTries;
            MINIGAME_STATE[11] +=   points;
        }	
    }

    function initialize_StatueModel(mg1Max, mg2Max, mg3Max){
        ///////////// ----MG1------ / ----MG2----------------- / -----MG3---------- /
        //[0] possible [1] MG1Done  | [2] possible [3] MG2Done | [4] possible [5] MG3Done;
        //statueModel = {0,0,0,0,0,0};
        statueModel[0] = mg1Max;
        statueModel[2] = mg2Max;
        statuteModel[4] = mg3Max;
    }

    function start_Minigame1(){
        //return html of mg1
    }

    function start_Minigame2(){
        //return html of mg2
    }
    function start_Minigame3(){
        //return html of mg3
    }

    function getMinigameStates(){
        int tmp[] = new int[12];
	
        for(var i = 0; i<12; i++){
            tmp[i] = MINIGAME_STATE[i]
        }
        return tmp;
    }

    function getMinigameOneState(){
        int tmp[] = new int[4];
        for(var i = 0; i<4; i++){
            tmp[i] = MINIGAME_STATE[i]
        }
        return tmp;
    }

    function getMinigameTwoState(){
        int tmp[] = new int[4];
        for(var i = 4; i<9; i++){
            tmp[i] = MINIGAME_STATE[i];
        }
        return tmp;
    }

    function getMinigameThreeState(){
        int tmp[] = new int[4];
        for(var i = 9; i<13; i++){
            tmp[i] = MINIGAME_STATE[i];
        }
        return tmp;
    }

    function getStatueState(){
        return statueState;
    }


    function getGameState()
        return gameState;
    }

    function click_SplashScreen(){
        gameState = GAME_STATES.START;
        //Start other scripts..		
    }

    //sets volume from 0-100
    function setVolume(var a){
        if(a>100) volume_level = 100;
        else if(a<0) volume_level = 0;
        else volume_level = a;
    }

    function setDifficulty(var _diff){
        difficulty = _diff;

        if(_diff = DIFFICULTIES.EASY){
            _diff = DIFFICULTIES.EASY;
        }
        else if(_diff == DIFFICULTIES.NORMAL){
            difficulty = DIFFICULTIES.NORMAL
        }
        else if (_diff == DIFFICULTIES.HARD){
            difficulty = DIFFICULTIES.HARD;
        }
    }

    //Param= Quality settings concept ( CONST In MAP GEN)
    function click_GameStart()
    {
        gameState = GAME_STATES.START;
        //start mapgenInit...
    }

    function showCreditsScreen(){
        //TODO
    } 

    function debug_PrintMinigameStates
    {
    //	MG1 :  Played=>[0] Won => [1] Lost => [2] Accuracy=> [3]
    //	MG2 :  Played=>[4] Won => [5] Lost => [6] Accuracy=> [7] 
    //	MG3 :  Played=>[8] Won => [9] Lost =>[10] Accuracy=>[11]
        console.log("Minigame1: Played: " + MINIGAME_STATE[0] + " Won: " + MINIGAME_STATE[1] + " Lost: " + MINIGAME_STATE[2] + " Accuracy " + MINIGAME_STATE[3]);
        console.log("Minigame2: Played: " + MINIGAME_STATE[4] + " Won: " + MINIGAME_STATE[5] + " Lost: " + MINIGAME_STATE[6] + " Accuracy " + MINIGAME_STATE[7]);
        console.log("Minigame3: Played: " + MINIGAME_STATE[8] + " Won: " + MINIGAME_STATE[9] + " Lost: " + MINIGAME_STATE[10] + " Accuracy " + MINIGAME_STATE[12]);
    }

    function debug_PrintGameState(){
        console.log("Game State: " + gameState);
    }

    function debug_PrintStatueState(){
        console.log("Statue State: " + statueState);
    }

    function debug_PrintSettings(){
        console.log("Difficulty : " + difficulty + " Volume Level: " + volumeLevel + " Graphic Quality : " + graphicQuality);
    }

    function initialize_StatueModel(){
        switch (difficulty){
            case "MEDIUM": 
                statueModel[0]=statueModel[2]=statueModel[4] = 3;
                //....
        }
    }

        /* Anfang: AUFBAU VON GAMETEXTS
        
        Willkommen auf Weazle Island,
        Dein Ziel ist die Unterstützung des Weazle Volks, welches auf dieser Insel gestrandet ist.
        Die Weazle werden Missstände ankündigen und Euer kluger Kopf wird ihre Probleme lösen.
        Viel Spaß und Erfolg!
    
        Nun schaut euch erst einmal in Ruhe auf der Insel um.
    
        Sobald über einem Weazle ein Ausrufezeichen erscheint, solltest Du mit ihr oder ihm sprechen. 
    
        Herzlichen Glückwunsch, Du hast die erste Aufgabe erfolgreich bewältigt! 
        Zu Deinen Ehren baut das Weazle Volk eine Statue. 
        Es ist von deinen Ergebnissen abhängig, wie hoch die Statue wird undaus welchem Material sie bestehen wird.