var appendToo = "#splashScreen";
var logo = "img/logo.png";
var mainGame = "#mainGame";

$(function () {
    $(mainGame).css("display", "none");
    $(appendToo + " *").remove();
    $(appendToo).append('<img src="' + logo + '" alt="Das Logo">');
    $(appendToo).append('<h1>Press Key or Mouse</h1>');

    var posX = (($(appendTo).parent().width() / 2) - ($(appendToo).width() / 2));
    var posY = (($(appendTo).parent().height() / 2) - ($(appendToo).height() / 2));

    $(appendToo).css({"left": posX, "top": posY});

    $(appendToo).on("click", function (e) {
        $(appendToo).off("click");
        $(appendToo).off("keyup");
        $(appendToo).css("display", "none");
        $(mainGame).css("display", "");
        initMenu();
    });
    $(appendToo).on("keyup", function (e) {
        $(appendToo).off("click");
        $(appendToo).off("keyup");
        $(appendToo).css("display", "none");
        $(mainGame).css("display", "");
        initMenu();
    });

    $(appendToo).focus();
});