/*
*   CONST
*/

var SIZE = [300, 450];
var APPENDTO = "#menu";
var DEBUG = true;

/*
*   CONST
*/

var quality = -1;

/*
*   OBJECTS
*/

var Menu = function (menu, title) {
	this.menu = menu;
	this.title = title;
}

var MenuEntry = function(id, html, init) {
	this.id = id;
	this.html = html.replace('<input', '<input id="' + id + '"');
	this.init = init;
}

/*
*   CREATE MENU
*/

var mainMenuEntries = new Array();
mainMenuEntries.push(new MenuEntry("menuNewGame", '<input type="button" value="Neues Spiel">', function () {
	$("#" + this.id).on("click touchstart", function () {
	    drawMenu( startMenu );
	    $("#menuContinue").attr("disabled", false);
	    
	    soundMenu.pause();

	    isGameStarted = true;
	} );
    $( "#" + this.id ).attr( "disabled", isGameStarted );

} ) );

var isGameStarted = false;

mainMenuEntries.push( new MenuEntry( "menuContinue", '<input type="button" value="Fortsetzen">', function ()
{
    $( "#" + this.id ).attr( "disabled", !isGameStarted );

    $( "#" + this.id ).on( "click touchstart", function ()
    {
        continueMainGame();
    } );
}));
mainMenuEntries.push(new MenuEntry("menuOptions", '<input type="button" value="Optionen">', function () {
	$("#" + this.id).on("click touchstart", function () {
	    drawMenu( optionMenu );
	    document.getElementById( "mainGame" ).appendChild( stats.dom );
	    pauseRender = true;
	    resumeRendering();
	    controls.autoRotate = true;
	    controls.update();
	    if ( FIRST_TIME_PLAYING )
	    {
	        FIRST_TIME_PLAYING = false;
	        setQualityButtonsDisabled( true );
	        showMessageBox( ["Oben links siehst du deine FPS.", "Gehe langsam mit der Qualität hoch und klicke jeweils \"Übernehmen\".", "Wiederhole das, solange deine FPS über 30 bleiben.", "Wenn du die höchste Qualität gefunden hast und dein Abenteuer beginnen willst, klicke \"Zurück\"!"], "OK!",
                function ()
                {
                    setQualityButtonsDisabled( false );
                } );
	        $( "#menuNewGame" ).attr( "disabled", false );
	    }
	});
} ) );
mainMenuEntries.push( new MenuEntry( "menuEndGame", '<input type="button" value="Aufhören">', function ()
{
    $( "#" + this.id ).attr( "disabled", !isGameStarted );

    $( "#" + this.id ).on( "click touchstart", function ()
    {
        continueMainGame();
        showGameOver();
    } );
} ) );

function setQualityButtonsDisabled( val )
{
    $( "#menuVolume" ) .attr( "disabled", val );
    $( "#menuQuality" ).attr( "disabled", val );
    $( "#menuApply" )  .attr( "disabled", val );
    $( "#menuCredits" ).attr( "disabled", val );
    $( "#menuBack" )   .attr( "disabled", val );

}

var startEntries = new Array();
startEntries.push(new MenuEntry("menuName", '<input type="text" placeholder="Dein Name" autofocus>', function () {
    $( "<h2>Wie heißt du?</h2>" ).insertBefore( "#" + this.id );
}));
startEntries.push(new MenuEntry("menuStart", '<input type="button" value="Los geht\'s!">', function () {
	$("#" + this.id).on("click touchstart", function () {
	    if ( $( "#menuName" ).val() !== "" )
	    {
	        username = $( "#menuName" ).val();
	        $( "#menuContinue" ).attr( "disabled", false );
	        $( "#" + this.id ).attr( "disabled", true );

	        canClickObjects = false;
	        continueMainGame();

            //Show MessageBox Intro
	        showMessageBox(getIntroText(),"OK!",
                function () {
                    soundMenu.pause();
                    soundMaingame.play();
                    canClickObjects = true;
                });

	        $("#menuNewGame").attr("disabled", false);       
			showButtons();
	    }
		if (DEBUG)
			console.log(username);
	});
}));

var optionEntries = new Array();
optionEntries.push(new MenuEntry("menuVolume", '<input type="range" min="0" max="100">', function ()
{
	var volume = getVolume();
	$('<h2><span class="left">Lautstärke:</span><span id="menuVolumeHeader" class="right">' + volume + '</span></h2>').insertBefore("#" + this.id);
	$("#" + this.id).attr("value", volume);
	$( "#" + this.id ).on( "mouseup", function () //IE 10
	{
		$("#menuVolumeHeader").text(this.value); 
		setVolume(this.value);
	} );
	$( "#" + this.id ).on( "input", function () //Vernünftige Browser
	{
	    $( "#menuVolumeHeader" ).text( this.value );
	} );
}));
optionEntries.push(new MenuEntry("menuQuality", '<input type="range" min="1" max="20" value="1">', function ()
{
	$('<h2><span class="left">Qualität:</span><span id="menuQualityHeader" class="right">' + currentQuality + '</span></h2>').insertBefore("#" + this.id);
	$("#" + this.id).attr("value", currentQuality);
	$( "#" + this.id ).on( "mouseup touchend", function () //IE 10
	{
		$("#menuQualityHeader").text(this.value);
	    quality = parseInt(this.value);
	} );
	$( "#" + this.id ).on( "input", function () //Vernünftige Browser
	{
	    $( "#menuQualityHeader" ).text( this.value );
	} );
}));
optionEntries.push(new MenuEntry("menuApply", '<input type="button" value="Übernehmen">', function () {
    $( "#" + this.id ).on( "click touchstart", function ()
    {
        if ( quality !== -1 && quality !== currentQuality )
        {
            setQualityButtonsDisabled( true );

            $( "#menuApply" ).val( "Lädt..." );

            $( "#overlay" ).show();
            $( "#overlay" ).animate( {
                opacity: 1,
            }, 500 );

            $( "#splashScreen h1" ).html( "Weazles wechseln die Insel ..." );

            $( "#splashScreen h1" ).css( "-webkit-animation-play-state", "running" );
            $( "#splashScreen" ).fadeIn( "fast" );

            setTimeout( function ()
            {
                if ( quality !== -1 )
                {
                    setQualityLevel( quality );
                }
                else if ( currentQuality !== -1 )
                {
                    quality = currentQuality;
                    setQualityLevel( currentQuality );
                }
            }, 500 );
        }
        if (DEBUG)
        	console.log("Apply Quality: " + quality);
	});
}));
optionEntries.push(new MenuEntry("menuCredits", '<input type="button" value="Credits">', function () {

}));
optionEntries.push(new MenuEntry("menuBack", '<input type="button" value="Zurück">', function () {
	$("#" + this.id).on("click touchstart", function () {
	    drawMenu( mainMenu );
	    document.getElementById( "mainGame" ).removeChild( stats.dom );
	    pauseRender = false;
	    pauseRendering();
	    controls.autoRotate = false;
	    controls.update();
	});
}));

var startMenu = new Menu(startEntries, "Neues Spiel");;
var mainMenu = new Menu(mainMenuEntries, "Hauptmenü");
var optionMenu = new Menu(optionEntries, "Optionen");

/*
*   GLOBAL FUNCTIONS
*/

hideMenu = function()
{
    controls.autoRotate = false;
    controls.enabled = true;
	$("#menu").css("visibility", "hidden");
}

showMenu = function()
{
    controls.autoRotate = true;
    controls.enabled = false;
	drawMenu(mainMenu);
	$("#menu").css("visibility", "visible");
}

/*
*   LOCAL FUNCTIONS
*/

var initMenu = function()
{
    controls.autoRotate = true;
	drawMenu(mainMenu);
}

var drawMenu = function (toDraw)
{
	$(APPENDTO + " *").remove();
	if (DEBUG) console.log("Drawing '" + toDraw.title + "'.");
	$(APPENDTO).html("<h1>" + toDraw.title + "</h1>");
	for (i = 0; i < toDraw.menu.length; i++)
	{
		$(APPENDTO).append(toDraw.menu[i].html);
		if (DEBUG) console.log("Menu add '" + toDraw.menu[i].id + "'.");

		toDraw.menu[i].init();
		if (DEBUG) console.log("Exec init func for '" + toDraw.menu[i].id + "'.");
	}
	$(APPENDTO + " h1, " + APPENDTO + " h2").on("selectstart", function () {
		return false;
	});
}

var resizeMenu = function () {
	var posX = (($(APPENDTO).parent().width() / 2) - (SIZE[0] / 2));
	var posY = (($(APPENDTO).parent().height() / 2) - (SIZE[1] / 2));
	$(APPENDTO).css(
        {
        	"width": SIZE[0],
        	"height": SIZE[1],
        	"left": posX,
        	"top": posY
        }
    );
}

/*
*   INIT
*/

$(function ()
{
    resizeMenu();
} );