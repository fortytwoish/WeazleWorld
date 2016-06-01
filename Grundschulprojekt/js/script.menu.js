/*
*   CONST
*/

var appendTo = "#menu";
var debug = true;
var click = new Audio("audio/click.mp3");
var left = (($(document).width() / 2) - ($(appendTo).width() / 2));
var top = ($(document).height() / 2) - ($(appendTo).height() / 2);

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
mainMenu.push(new item("MinigameTest", "button"));
mainMenu.push(new item("Optionen", "button"));

var options = new Array();
options.push(new item("Lautstärke", "range"));
options.push(new item("Qualität", "range"));
options.push(new item("Credits", "button"));
options.push(new item("Hauptmenü", "button"));

/*
*   FUNCTIONS
*/

var drawMenu = function(menuArr)
{
    $(appendTo + " *").remove();
    for(i = 0; i < menuArr.length; i++)
    {
        
        if(menuArr[i].value == "range")
        {
			$(appendTo).append('<h1>' + menuArr[i].key + '</h1>');
			$(appendTo).append('<input type="' + menuArr[i].value + '" value="' + menuArr[i].key + '">');
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
			$(appendTo).append('<input type="' + menuArr[i].value + '" value="' + menuArr[i].key + '">');
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
}

var action = function(button)
{
    switch(button)
    {
        case "Optionen":
            drawMenu(options);
            debug ? console.log("action(" + button + ") was performed.") : false;
            break;
        case "Hauptmenü":
            drawMenu(mainMenu);
            debug ? console.log("action(" + button + ") was performed.") : false;
            break;
        case "MinigameTest":
            changeGameState(3);
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

$(function(){
    drawMenu(mainMenu);
    $(appendTo).css({"left": left, "top": top});
});