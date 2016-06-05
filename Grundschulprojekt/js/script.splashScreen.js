var appendToo = "#splashScreen";
var logo = "img/logo.png";
var mainGame = "#mainGame";

$(function () {
    $(mainGame).css("display", "none");
    $(appendToo + " *").remove();
    $(appendToo).append('<img src="' + logo + '" alt="Das Logo">');
    $(appendToo).append('<h1>Press Key or Mouse</h1>');

    var posX = ((window.innerWidth / 2) - ($(appendToo).width() / 2));
    var posY = ((window.innerHeight / 2) - ($(appendToo).height() / 2));

    $(appendToo).css({"left": posX, "top": posY});

    $("body").on("click", function(e){
        $("body").off("click");
        $("body").off("keyup");
        $(appendToo + " *").remove();
        $(mainGame).css("display", "");
        initMenu();
    });
    $("body").on("keyup", function(e){
        $("body").off("click");
        $("body").off("keyup");
        $(appendToo + " *").remove();
        $(mainGame).css("display", "");
        initMenu();
    });

    $("body") - focus();
});