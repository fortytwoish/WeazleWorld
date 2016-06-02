var appendToo = "#splashScreen";
var logo = "img/logo.png";



$(function(){
    $(appendToo + " *").remove();
    $(appendToo).append('<img src="' + logo + '" alt="Das Logo">');
    $(appendToo).append('<h1>Press Key or Mouse</h1>');

    var left = (($(document).width() / 2) - ($(appendToo).width() / 2));
    var top = ($(document).height() / 2) - ($(appendToo).height() / 2);

    $(appendToo).css({"left": left, "top": top});

    $("body").on("click", function(e){
        $("body").off("click");
        $("body").off("keyup");
        $(appendToo + " *").remove();
    });
    $("body").on("keyup", function(e){
        $("body").off("click");
        $("body").off("keyup");
        $(appendToo + " *").remove();
    });
});