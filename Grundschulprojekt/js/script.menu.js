
/*
*   CONST
*/

var size = [300, 400];
var appendTo = "#menu";
var debug = true;
var click = new Audio("audio/click.mp3");

/*
*   ITEM
*/

var item = function(key, value)
{
    this.key = key;
    this.value = value;
}

/*
*   CREATE MENU
*/

var mainMenu = new Array();
mainMenu.push(new item("Start", "button"));
mainMenu.push(new item("Optionen", "button"));

var options = new Array();
options.push(new item("Lautstärke", "range"));
options.push(new item("Qualität", "range"));
options.push(new item("Credits", "button"));
options.push(new item("Hauptmenü", "button"));

/*
*   FUNCTIONS
*/

function initMenu()
{
    drawMenu(mainMenu);
}

var drawMenu = function(menuArr)
{
    $(appendTo + " *").remove();
    for(i = 0; i < menuArr.length; i++)
    {

        if(menuArr[i].value == "range")
        {
            $(appendTo).append('<h1 class="menuAnimate">' + menuArr[i].key + '</h1>');
            $(appendTo).append('<input class="menuAnimate" type="' + menuArr[i].value + '" value="' + menuArr[i].key + '">');
            debug ? console.log("Menu added '" + menuArr[i].key + "' slider.") : false;
            $("[value=" + menuArr[i].key + "]").on("change", function(e){
                var entryName = $(this).attr("value");
                action(entryName);
                click.play();
                debug ? console.log("You changed '" + entryName + "' to " + $(this).val()) : false;
            });
            debug ? console.log("Eventhandler added to '" + menuArr[i].key + "' slider.") : false;
        }
        else
        {
            $(appendTo).append('<input class="menuAnimate" type="' + menuArr[i].value + '" value="' + menuArr[i].key + '">');
            debug ? console.log("Menu added '" + menuArr[i].key + "' entry.") : false;
            $("[value=" + menuArr[i].key + "]").on("click", function(e){
                var entryName = $(this).attr("value");
                action(entryName);
                click.play();
                debug ? console.log("You clicked on '" + entryName + "'") : false;
            });
            debug ? console.log("Eventhandler added to '" + menuArr[i].key + "' entry.") : false;
        }
    }
    $(appendTo + " *").animate(
    {
        "opacity": "1",
        "bottom": "0"
    },
    500);
}

/*
*   BUTTON FUNCTIONS
*/

var action = function(button)
{
    switch(button)
    {
        case "Start":
            isInMenu = false;
            //printMenuState();
            $("#menu").css("visibility", "hidden");
            $("#menuButton").css("visibility", "visible");
            debug ? console.log("action(" + button + ") was performed.") : false;
            break;
        case "Optionen":
            drawMenu(options);
            debug ? console.log("action(" + button + ") was performed.") : false;
            break;
        case "Hauptmenü":
            drawMenu(mainMenu);
            debug ? console.log("action(" + button + ") was performed.") : false;
            break;
        default:
            debug ? console.log("action() no action defined") : false;
            break;
    }
}

/*
*   INIT
*/

$(function () {
    var posX = (($(appendTo).parent().width() / 2) - (size[0] / 2));
    var posY = (($(appendTo).parent().height() / 2) - (size[1] / 2));
    $(appendTo).css(
        {
            "width": size[0],
            "height": size[1],
            "left": posX,
            "top": posY
        }
    );
});