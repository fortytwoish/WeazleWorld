/*
*   CONST
*/

var SIZE = [300, 400];
var APPENDTO = "#menu";
var DEBUG = true;

/*
*   OBJECTS
*/

var Menu = function (menu, title) {
	this.menu = menu;
	this.title = title;
}

var MenuEntry = function(id, html, init) {
	this.id = id;
	this.html = html.replace('<input', '<input id="' + id + '"');
	this.init = init;
}

/*
*   CREATE MENU
*/

var mainMenuEntries = new Array();
mainMenuEntries.push(new MenuEntry("menuNewGame", '<input type="button" value="Neues Spiel">', function ()
{
	$("#" + this.id).on("click", function ()
	{
		continueMainGame();
	});
}));
mainMenuEntries.push(new MenuEntry("menuContinue", '<input type="button" value="Fortsetzen">', function () {
	$("#" + this.id).attr("disabled", true);
}));
mainMenuEntries.push(new MenuEntry("menuOptions", '<input type="button" value="Optionen">', function () {
	$("#" + this.id).on("click", function () {
		drawMenu(optionMenu);
	});
}));

var optionEntries = new Array();
optionEntries.push(new MenuEntry("menuVolume", '<input type="range" min="0" max="100">', function () {
	$("<h2>Lautstärke</h2>").insertBefore("#" + this.id);
	$("#" + this.id).attr("value", getVolume());
	$("#" + this.id).on("change", function () {
		setVolume(this.value);
	});
}));
optionEntries.push(new MenuEntry("menuQuality", '<input type="range" min="1" max="5" value="1">', function () {
	$("<h2>Qualität</h2>").insertBefore("#" + this.id);
	$("#" + this.id).attr("value", getQuality());
	$("#" + this.id).on("change", function () {
		setQualityLevel(this.value);
	});
}));
optionEntries.push(new MenuEntry("menuCredits", '<input type="button" value="Credits">', function () {

}));
optionEntries.push(new MenuEntry("menuBack", '<input type="button" value="Zurück">', function () {
	$("#" + this.id).on("click", function () {
		drawMenu(mainMenu);
	});
}));

var mainMenu = new Menu(mainMenuEntries, "Hauptmenü");
var optionMenu = new Menu(optionEntries, "Optionen");

/*
*   GLOBAL FUNCTIONS
*/

hideMenu = function()
{
	$("#menu").css("visibility", "hidden");
}

showMenu = function()
{
	drawMenu(mainMenu);
	$("#menu").css("visibility", "visible");
}

/*
*   LOCAL FUNCTIONS
*/

var initMenu = function()
{
	drawMenu(mainMenu);
}

var drawMenu = function (toDraw)
{
	$(APPENDTO + " *").remove();
	if (DEBUG) console.log("Drawing '" + toDraw.title + "'.");
	$(APPENDTO).html("<h1>" + toDraw.title + "</h1>");
	for (i = 0; i < toDraw.menu.length; i++)
	{
		$(APPENDTO).append(toDraw.menu[i].html);
		if (DEBUG) console.log("Menu add '" + toDraw.menu[i].id + "'.");

		toDraw.menu[i].init();
		if (DEBUG) console.log("Exec init func for '" + toDraw.menu[i].id + "'.");
	}
}

var resizeMenu = function () {
	var posX = (($(APPENDTO).parent().width() / 2) - (SIZE[0] / 2));
	var posY = (($(APPENDTO).parent().height() / 2) - (SIZE[1] / 2));
	$(APPENDTO).css(
        {
        	"width": SIZE[0],
        	"height": SIZE[1],
        	"left": posX,
        	"top": posY
        }
    );
}

/*
*   INIT
*/

$(function ()
{
    resizeMenu();
});