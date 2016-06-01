$(function () {
    var theme = new Audio("audio/theme.mp3");
    changeGameState(1);
    loadScript("js/MapGeneration.js");
    loadScript("js/MainScript.js");
    theme.play();
});

var loadScript = function(script)
{
    if ($("[href='" + script + "']").length == 0)
        $("head").append('<script type="text/javascript" src="' + script + '"></script>');
}

var loadMiniGame = function (html)
{
    $("#mini-game *").remove();
    $.get("html/" + html + ".html", function (data) {
        $("#mini-game").html(data);
    });
}

changeGameState = function(state)
{
    $("body section").css("display", "none");
    switch(state)
    {
        case 1:
            $("#splashScreen").css("display", "inherit");
            loadScript("js/script.splashScreen.js");
            break;
        case 2:
            loadScript("js/script.menu.js");
            $("#menu").css("display", "inherit");
            break;
        case 3:
            loadMiniGame("minigame3");
            $("#mini-game").css("display", "inherit");
            break;
    }
    $("#main-game").css("display", "inherit");
}