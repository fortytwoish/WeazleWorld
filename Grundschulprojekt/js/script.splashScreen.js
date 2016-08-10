var appendToo = "#splashScreen";
var logo = "img/logo.png";
var mainGame = "#mainGame";

$(function () {
    //$(mainGame).css("display", "none");
    $(menu).hide();
    $(appendToo + " *").remove();
    $(appendToo).append('<img src="' + logo + '" alt="Das Logo">');
    $(appendToo).append('<h1>Press Key or Mouse</h1>');

    resizeSplashScreen();

    $( appendToo ).on( "click touchstart", function ( e )
    {
        splashscreenInteract();
    });
    $(appendToo).on("keyup", function (e) {
        splashscreenInteract()
    } );

    $(appendToo).focus();
});

function splashscreenInteract()
{
    $(appendToo).off("click");
    $(appendToo).off("touchstart");
    $(appendToo).off("keyup");
    $(appendToo).css("display", "none");
    $(menu).show();
    initMenu();
}

function resizeSplashScreen()
{
    var posX = (($(appendTo).parent().width() / 2) - ($(appendToo).width() / 2));
    var posY = (($(appendTo).parent().height() / 2) - ($(appendToo).height() / 2));

    $(appendToo).css({ "left": posX, "top": posY });
}