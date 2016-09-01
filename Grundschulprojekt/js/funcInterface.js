//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//INTERNAL|INTERNAL|INTERNAL|INTERNAL|INTERNAL|INTERNAL|INTERNAL|INTERNAL|INTERNAL|INTERNAL//
/////DO NOT MODIFY|DO NOT MODIFY|DO NOT MODIFY|DO NOT MODIFY|DO NOT MODIFY|DO NOT MODIFY/////
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

const TRIES_PER_MINIGAME = 4;

username = "[Username not set]";
showTutorials = true;

    //Initial_ StateINIT>>>>>>>>>:
        currentMessageBoxValue = 1
        currentMessageBoxTexte = [""];
        currentMessageBoxEndText = "";
        currentMessageBoxCompleteFunction = null;

        var GAME_STATES   = { 1:"SPLASH", 2:"START", 3:"MENU", 4:"MAIN", 5:"MINIGAME", 66:"SCORE_SCREEN"};
        var DIFFICULTIES  = { 1:"EASY", 2:"NORMAL" , 3:"HARD"};
        var STATUE_STATES = { 1:"NOT_STARTED", 2:"IN_CONSTRUCTION", 3:"CONSTRUCTED"};

        var gameState  = GAME_STATES.SPLASH;
        var difficulty = DIFFICULTIES.NORMAL;

        var statueModel;
        var statueState = STATUE_STATES.NOT_STARTED;

        ///////////// ----MG1------ / ----MG2------ / -----MG3---------- /
        ///////////// [0] MG1Done [1] accuracy  | [2] MG2Done [3] accuracy  | [4] MG3Done [5] accuracy;
        statueModel = [0,          0,              0,          0,              0,          0];

        //INT 0<->1
        var volume_level      = 1;
        var GRAPHIC_QUALITIES = { 1: "VERY_LOW", 2: "LOW", 3: "MEDIUM", 4: "HIGH", 5: "MAXIMUM" };
        var graphicQuality    = GRAPHIC_QUALITIES.MEDIUM;

        var MINIGAME_STATE;
        //Construction of MiniGame Database
        //-----//--------------//-----------//--------//----------//--------------//
        //	MG1         : Possible=>[0]    Played=>[1]    Won => [2]  Lost => [3]  Accuracy=> [4]
        //	MG2         : Possible=>[5]    Played=>[6]    Won => [7]  Lost => [8]  Accuracy=> [9] 
        //	MG3         : Possible=>[10]   Played=>[11]   Won =>[12]  Lost =>[13]  Accuracy=>[14]
        MINIGAME_STATE = [0,               0,             0,          0,           0,
                          0,               0,             0,          0,           0,
                          0,               0,             0,          0,           0];
        
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//INITIALIZES|INITIALIZES|INITIALIZES|INITIALIZES|INITIALIZES|INITIALIZES|INITIALIZES////////
//REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY///////
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

    //INITIALIZES>>>>>>>>>>>>>>>>:
        
        //Function to initialize the statue Model(possibles) according to prior set Difficulty
        function initialize_StatueModel() {
            switch (difficulty) {
                case DIFFICULTIES.EASY:
                    MINIGAME_STATE[0] = MINIGAME_STATE[5] = MINIGAME_STATE[10] = 12;
                case DIFFICULTIES.MEDIUM:                                                      
                    MINIGAME_STATE[0] = MINIGAME_STATE[5] = MINIGAME_STATE[10] = 8;
                case DIFFICULTIES.HARD:                                                        
                    MINIGAME_STATE[0] = MINIGAME_STATE[5] = MINIGAME_STATE[10] = 4;
                default:
                    console.log("Init of StatueModel Possibilities Failed (Wrong Difficulty)");
            }
        }
        
        //  default
        difficulty = DIFFICULTIES.HARD;
        initialize_StatueModel();
    
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//HANDLES|HANDLES|HANDLES|HANDLES|HANDLES|HANDLES|HANDLES|HANDLES|HANDLES|HANDLES|HANDLES////
//REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY///////
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

    //------------------------------------------------------//
    //                  IN MENU                             //
    //------------------------------------------------------//
        function endedSplashScreen()
        {
            gameState = GAME_STATES.START;
        }

function continueMainGame()
{
    isInMenu = false;
    resumeRendering();
    hideMenu();
    $( ".hiddenInMenu" ).css( "visibility", "visible" );
    $( "#messageBox" ).css( "visibility", "visible" );
    $( "#messageBox" ).hide();
}

    //------------------------------------------------------//
    //                  IN MAIN GAME                        //
    //------------------------------------------------------//

        function openMenu()
        {
            isInMenu = true;
            pauseRendering();
	        showMenu();

            hideButtons();
        }

        function startMinigame( minigameID )
        {
            if ( !mgPossible( minigameID ) )
            {
                alert(  "BUG:\n"
                      + "Minigame " + minigameID + " kann nicht (mehr?) gestartet werden!\n\n"
                      + "(Es sollte also garnicht verfügbar sein...)");
                return;
            }

            isInMenu = true;

            hideButtons();

            //console.log( "Reading: " + "html/minigame" + minigameID + ".html" );
            $.get( "html/minigame" + minigameID + ".html", function ( data )
            {
                //console.log( "Contents: " + data );
                $( "#minigame" ).html( data );
                $( "#minigame" ).css( "visibility", "visible" );
            } );

        }
    
        function click_MessageBox()
        {
            console.log( "Toggling Messagebox" );
            //$( "#messageBox" ).css( "visibility", "visible" );
            $( "#messageBox" ).toggle( "slow" );
        }

        function click_MessageBoxWeiter()
        {
            if ( currentMessageBoxValue == currentMessageBoxTexte.length - 1 )
            {
                $( "#messageBoxButton" ).val( currentMessageBoxEndText );
            }
            else if ( currentMessageBoxValue == currentMessageBoxTexte.length )
            {
                exitMessageBox();
            }
            $( "#messageBoxContentParagraph" ).text( getNextMessageBoxText() );
        }

    //------------------------------------------------------//
    //                  IN MINIGAME                         //
    //------------------------------------------------------//

        function exitMinigame()
        {
            isInMenu = false;
            $( "#minigame" ).css( "visibility", "hidden" );
    
            showButtons();
        }

        function minigamePlayed( minigameNumber )
        {
            exitMinigame();

            var played = getMinigameState( minigameNumber, 1 ) + 1;

            setMinigameState( minigameNumber, 1, played ); //  Played++

            if( played == 1)
            {
                MinigameAvailabilityChanged( minigameNumber + 1, true );
            }
            else if( getMinigameState( minigameNumber, 0) ==  played)
            {
                MinigameAvailabilityChanged( minigameNumber, false );
            }
        }

        function minigameWon( minigameNumber/*, points, lostTries*/ )
        {
            minigamePlayed( minigameNumber );

            var won = getMinigameState( minigameNumber, 2 ) + 1;

            setMinigameState( minigameNumber, 2, won ); //  Won   ++

            updateStatueModel( minigameNumber, 1, won );
        }

        function minigameLost( minigameNumber/*, points, lostTries*/ )
        {
            //  The first game (tutorial) can't be lost
            var played = getMinigameState( minigameNumber, 1 );
            if ( played == 0 )
            {
                exitMinigame();
                return;
            }

            minigamePlayed( minigameNumber );

            var lost = getMinigameState( minigameNumber, 3 ) + 1;

            setMinigameState( minigameNumber, 3, lost );   //  Lost  ++
        }

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//METHODS|METHODS|METHODS|METHODS|METHODS|METHODS|METHODS|METHODS|METHODS|METHODS|METHODS////
//REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY///////
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

        function hideButtons()
        {
            $( "#menuButton" ).css( "visibility", "hidden" );
            $( "#minigameButton" ).css( "visibility", "hidden" );
            $( "#newMapButton" ).css( "visibility", "hidden" );
        }

        function showButtons()
        {
            $( "#menuButton" ).css( "visibility", "visible" );
            $( "#minigameButton" ).css( "visibility", "visible" );
            $( "#newMapButton" ).css( "visibility", "visible" );
        }

        function showMessageBox( messageArr, endText, completeFunction )
        {
            hideButtons();
            $( "#messageBoxButton" ).val( "weiter" );
            $( "#messageBox" ).show("slow");
            currentMessageBoxTexte = messageArr;
            currentMessageBoxEndText = endText;
            currentMessageBoxCompleteFunction = completeFunction;
            currentMessageBoxValue = 0;

            click_MessageBoxWeiter();
        }

        function exitMessageBox()
        {
            $( "#messageBox" ).hide( "slow",  function(){showButtons()} );
            currentMessageBoxCompleteFunction();
        }

        function showCreditsScreen()
        {
            //TODO:
        }

    //------------------------------------------------------//
    //                  EVENTS                              //
    //------------------------------------------------------//
        function StatueModelChanged( minigameID )
        {
            OnStatueModelChanged( minigameID );
        }

        function StatueStateChanged()
        {
            OnStatueStateChanged();
        }

        function MinigameAvailabilityChanged( minigameID, isAvailable )
        {
            OnMinigameAvailabilityChanged( minigameID, isAvailable );
        }

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//GETTER_SETTER|GETTER_SETTER|GETTER_SETTER|GETTER_SETTER|GETTER_SETTER|GETTER_SETTER|///////
//REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY///////
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

        //  Minigames can be started if:
        //      1. They were played less than their "possible" value allows
        //      2. The previous minigame has been played at least once (if there is a previous)
        function mgPossible( minigameID )
        {
                      //   Possible                       //   Played
            return    getMinigameState( minigameID, 0 ) > getMinigameState( minigameID, 1 ) 
                   && (minigameID == 1 || getMinigameState( minigameID - 1, 2 ) > 0);
        }

        //Returns: int[15]
        //	MG1         : Possible=>[0]    Played=>[1]    Won => [2]  Lost => [3]  Accuracy=> [4]
        //	MG2         : Possible=>[5]    Played=>[6]    Won => [7]  Lost => [8]  Accuracy=> [9] 
        //	MG3         : Possible=>[10]   Played=>[11]   Won =>[12]  Lost =>[13]  Accuracy=>[14]
        //-------------//--------------//---------------//----------//-----------//--------------//
        function getMinigameStates() {
            tmp = new int[15];

            for ( var i = 0; i < 15; i++ )
            {
                tmp[i] = MINIGAME_STATE[i];
            }
            return tmp;
        }

        function getStatueModelIndex( minigameID )
        {
            return ( minigameID - 1 ) * 2;
        }

        //Returns: int[5]
        //	MG[id]      : Possible=>[0]    Played=>[1]    Won => [2]  Lost => [3]  Accuracy=> [4]
        //-------------//--------------//---------------//----------//-----------//--------------//
        function getMinigameState( id, propertyID )
        {
            var ind = ( id - 1 ) * 5;

            return MINIGAME_STATE[ind + propertyID];
        }

        function setMinigameState( id, propertyID, value )
        {
            var ind = ( id - 1 ) * 5;
            
            MINIGAME_STATE[ind + propertyID] = value;
        }

        //returns current StatueState
        function getStatueState() {
            return statueState;
        }

        function setStatueState( state )
        {
            var oldState = statueState;
            statueState  = state;

            if(oldState != statueState)
            {
                StatueStateChanged();
            }
        }

        function getStatueModel()
        {
            return statueModel;
        }

        function updateStatueModel( minigameID, propertyID, value )
        {
            if ( statueModel[getStatueModelIndex( minigameID ) + propertyID] != value )
            {
                statueModel[getStatueModelIndex( minigameID ) + propertyID] = value;
                StatueModelChanged( minigameID );
            }
        }

        //returns current GameState
        function getGameState()
        {
            return gameState;
        }

        //sets volume from 0-100
        function setVolume( volume )
        {
            if (volume > 100) volume_level = 100;
            else if (volume < 0) volume_level = 0;
            else volume_level = volume;
        }

        //sets difficulty DIFFICULTY.EASY//.MEDIUM//.HARD
        function setDifficulty( _diff )
        {
            difficulty = _diff;
        }

        function getNextMessageBoxText()
        {
            //  TODO if next text is last one, change button text to exit
            if ( currentMessageBoxValue > currentMessageBoxTexte.length )
            {
                //  TODO exit message box here
                currentMessageBoxValue = 0;
            }

            return currentMessageBoxTexte[currentMessageBoxValue++];
        }

        function getVolume()
        {
            return volume_level;
        }

        function getQuality()
        {
            return graphicQuality;
        }

        function getResourceFromMinigameID( minigameID )
        {
            switch(minigameID)
            {
                case 1:
                    return "Stein";
                    break;
                case 2:
                    return "Wasser";
                    break;
                case 3:
                    return "Holz";
                    break;
            }
        }


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG|DEBUG//
//REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY|REPORT IF MODIFY///////
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

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


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//GAME TEXTS|GAME TEXTS|GAME TEXTS|GAME TEXTS|GAME TEXTS|GAME TEXTS|GAME TEXTS|GAME TEXTS|///
//GOGO NEED SOME IDEAS|GOGO NEED SOME IDEAS|GOGO NEED SOME IDEAS|GOGO NEED SOME IDEAS////////
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

    //<draft>: AUFBAU GAMETEXTS>>:

        function getMaingameStartedText()
        {
            var text = [];
            text[0]= "Hallo, " + username + "!",
            text[1]= "Willkommen auf Weazle Island",
            text[2]= "Dein Ziel ist die Unterstützung des Weazle Volks, welches auf dieser Insel gestrandet ist.",
            text[3]= "Die Weazle werden Missstände ankündigen und Euer kluger Kopf wird ihre Probleme lösen.",
            text[4]= "Viel Spaß und Erfolg!",
            text[5]= "Nun schaut euch erst einmal in Ruhe auf der Insel um.",
            text[6]= "Sobald über einem Weazle ein Ausrufezeichen erscheint, solltest Du mit ihr oder ihm sprechen.",
            text[7]= "Herzlichen Glückwunsch, Du hast die erste Aufgabe erfolgreich bewältigt!",
            text[8]= "Zu Deinen Ehren baut das Weazle Volk eine Statue. ",
            text[9]= "Es ist von deinen Ergebnissen abhängig, wie hoch die Statue wird und aus welchem Material sie bestehen wird."
        };

        function getFirstSegmentBuiltText(minigameID)
        {
            var text = [];
            var ind = 0;
            text[ind++] = "Glückwunsch, du hast deinen Weazles ihr erstes Stück " + getResourceFromMinigameID( minigameID ) + " beschafft!";
            text[ind++] = "Allerdings brauchen sie noch ein wenig mehr. Je mehr du ihnen bringst, desto dankbarer werden deine Weazles sein.";
            if ( minigameID < 3 )
            {
                text[ind++] = "Du kannst ihnen aber auch " + getResourceFromMinigameID( minigameID ) + " bringen, welches sie ebenfalls sehr dringend brauchen!";
            }
            if ( minigameID == 1 )
            {
                text[ind++] = "Schau mal, die Weazles fangen an, eine Statue zu deinen Ehren zu bauen!";
            }
            else
            {
                text[ind++] = "Schau mal, die Weazles fangen an, einen neuen Teil der Statue zu deinen Ehren zu bauen!";
            }
            return text;
        }

        function getNextSegmentBuiltText(minigameID)
        {
            var text = [];
            text[0] = "Gut gemacht! Aus Dank für das weitere Stück " + getResourceFromMinigameID( minigameID ) + " werden die Weazles einen Teil der Statue weiter ausbauen!";
            text[1] = "Wenn du ihnen noch mehr bringst, werden sie es sicherlich noch weiter verschönern!";
            return text;
        }

        function getLastSegmentBuiltText(minigameID)
        {
            var score = getMinigameState(minigameID, 2);

            var score_text  = score == 4
                            ? "das außerordentlich viele"
                            : score == 3
                            ? "das viele"
                            : score == 2
                            ? "die paar Stücke"
                            : score == 1
                            ? "das eine Stück"
                            : "[ACHTUNG, UNMÖGLICHER WERT]";

            var text = [];
            text[0] = "Glückwunsch, die Weazles werden zum Dank für " + score_text + " " + getResourceFromMinigameID( minigameID ) + " das Segment der Statue zu deinen Ehren fertigstellen!";
            text[1] = "Sie haben jetzt genug " + getResourceFromMinigameID( minigameID ) + ". Aber bestimmt kannst du ihnen noch andere Dinge bringen!";
            return text;
        }

        segmentBuiltEndText = "Zeig's mir!";

        