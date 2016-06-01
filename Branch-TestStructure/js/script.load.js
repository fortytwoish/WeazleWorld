$(function(){
    changeGameState(1);
    loadScript("js/engine.js");
});

var loadCSS = function(css)
{
    $("head").append('<link rel="stylesheet" type="text/css" href="' + css + '">');
}

var loadScript = function(script)
{
    $("head").append('<script type="text/javascript" src="' + script + '"></script>');
}

changeGameState = function(state)
{
    $("body section").css("display", "none");
    switch(state)
    {
        case 1:
            $("#splashScreen").css("display", "inherit");
			         loadCSS("css/splashScreen.css");
            loadScript("js/script.splashScreen.js");
            break;
        case 2:
            loadCSS("css/menu.css");
            loadScript("js/script.menu.js");
            $("#menu").css("display", "inherit");
            break;
    }
    $("#main-game").css("display", "inherit");
}