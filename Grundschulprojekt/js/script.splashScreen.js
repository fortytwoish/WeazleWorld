var appendToo = "#splashScreen";
var logo = "img/Splashscreen.png";
var mainGame = "#mainGame";

$( function ()
{
    initSounds();

    if (!isMenuSoundPlaying) {
        isMenuSoundPlaying = true;
        soundMenu.play();
    }

    window.addEventListener( 'resize', resizeSplashScreen, false );


    //$(mainGame).css("display", "none");
    $(menu).hide();
    $(appendToo + " *").remove();
    $(appendToo).append('<img src="' + logo + '" alt="Das Logo">');
    $(appendToo).append('<h1>Start</h1>');

    resizeSplashScreen();

    $("#resetQualityButton").on("click", function (e)
    {
    	$(this).css("display", "none");
    	if ( typeof ( storage ) !== "undefined" )
    	{
    	    storage.quality = 1;
    	}
    });

    $(appendToo).on("click touchstart keyup", function (e)
    {
    	$("#resetQualityButton").css("display", "none");
    	splashscreenInteract();
    });

    $(appendToo).focus();
});

function splashscreenInteract()
{
    $( "#splashScreen h1" ).css( "-webkit-animation-play-state", "paused" );
    $( "#splashScreen h1" ).html( "L&auml;dt..." );
    $( "#splashScreen h1" ).css( "-webkit-animation-play-state", "running" );

    $( appendToo ).off( "click" );
    $( appendToo ).off( "touchstart" );
    $( appendToo ).off( "keyup" );

    setTimeout( function ()
    {
        main();
        
    }, 500 );
    


}

function resizeSplashScreen()
{
    var posX = (($(APPENDTO).parent().width() / 2) - ($(appendToo).width() / 2));
    var posY = (($(APPENDTO).parent().height() / 2) - ($(appendToo).height() / 2));

    $(appendToo).css({ "left": posX, "top": posY });
}