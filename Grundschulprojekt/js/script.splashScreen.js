var appendTo = "#splashScreen";
var logo = "img/logo.png";



$(function(){
    $(appendTo + " *").remove();
    $(appendTo).append('<img src="' + logo + '" alt="Das Logo">');
    $(appendTo).append('<h1>Press Key or Mouse</h1>');

    var left = (($(document).width() / 2) - ($(appendTo).width() / 2));
    var top = ($(document).height() / 2) - ($(appendTo).height() / 2);

    $(appendTo).css({"left": left, "top": top});

    $("body").on("click", function(e){
        $("body").off("click");
        $("body").off("keyup");
        $(appendTo + " *").remove();
        changeGameState(2);
    });
    $("body").on("keyup", function(e){
        $("body").off("click");
        $("body").off("keyup");
        $(appendTo + " *").remove();
        changeGameState(2);
    });
});