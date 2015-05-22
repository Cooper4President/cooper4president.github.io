///<reference path="pixi.js" />

//graphics and rendering setup
var rendererCanvas = document.getElementById("gameCanvas");

var rendererOptions = {
	view:rendererCanvas
};

var renderer = new PIXI.autoDetectRenderer(800, 800, rendererOptions);
var stageScale = 1.0;
var stage = new PIXI.Container();

var bgTexture = PIXI.Texture.fromImage("images/background.png");
var bgSprite = new PIXI.Sprite(bgTexture);
bgSprite.position.x = 0;
bgSprite.position.y = 0;
stage.addChild(bgSprite);

draw();

function draw(){
	requestAnimationFrame(draw);

	renderer.render(stage);
}

window.onresize = resizeHandler;
resizeHandler();
//handles scaling when window is resized
function resizeHandler() {
	var cw = document.body.clientWidth;
	var ch = document.body.clientHeight;
	if(cw < ch){
		if(cw < 800){
			stageScale = 0.5;
		}
		else if(cw < 1600){
			stageScale = 1.0;
		}
		else{
			stageScale = 2.0;
		}
	}
	else{
		if(ch < 800){
			stageScale = 0.5;
		}
		else if(ch < 1600){
			stageScale = 1.0;
		}
		else{
			stageScale = 2.0;
		}
	}
	
	stage.scale.x = stageScale;
	stage.scale.y = stageScale;
}

//preloaded textures
var texBlue = PIXI.Texture.fromImage("images/tileBlue.png");
var texGreen = PIXI.Texture.fromImage("images/tileGreen.png");
var texRed = PIXI.Texture.fromImage("images/tileRed.png");
var texYellow = PIXI.Texture.fromImage("images/tileYellow.png");

//generic tile object
var TilePrefab = function(color){
	var container = new PIXI.Container();
	
	var sprite;
	switch (color) {
		case "blue":
			sprite = new PIXI.Sprite(texBlue);
			break;
		case "green":
			sprite = new PIXI.Sprite(texGreen);
			break;
		case "red":
			sprite = new PIXI.Sprite(texRed);
			break;
		case "yellow":
			sprite = new PIXI.Sprite(texYellow);
			break;
	}
	
	container.addChild(sprite);
	
	var tileObj = new Object();
	tileObj.container = container;
	tileObj.color = color;
	var count = 1;
	tileObj.count = count;
	var solved = false;
	tileObj.solved = solved;
	
	return tileObj;
}

//generate random int in range, non-inclusive of max
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}


//main game logic is below


//highest single-tile count the player has achieved in the current game
var highestCount = 1;
//current 'state' the game is in. possible: menu, playing, lose
var gameState = "menu";

//a 2d array to hold the tiles on the board (5 x 5)
var tileArray = new Array(5);
for(var i = 0; i < 5; i++){
	tileArray[i] = new Array(5);
}

var textArray = new Array(5);
for(var i = 0; i < 5; i++){
	textArray[i] = new Array(5);
}

//initialize game the first time
generateText();
stateMenu();

function generateText() {
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			var text = new PIXI.Text("0", { font: "50px Arial", fill: "white" });
			text.position.x = 88 + (156 * i);
			text.position.y = 88 + (156 * j);
			text.anchor.x = 0.5;
			text.anchor.y = 0.5;
			stage.addChild(text);
			textArray[i][j] = text;
		}
	}
}

//updates visual positions of tiles
function updateTilePositions() {
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			if (tileArray[i][j] != null) {
				tileArray[i][j].container.position.x = 18 + (156 * i);
				tileArray[i][j].container.position.y = 18 + (156 * j);
				
				if(tileArray[i][j].count > highestCount){
					highestCount = tileArray[i][j].count;
				}
				
				//ensure text is rendered on top
				stage.removeChild(textArray[i][j]);
				stage.addChild(textArray[i][j]);
				textArray[i][j].text = tileArray[i][j].count;
			} else{
				textArray[i][j].text = "";
			}
		}
	}
}

//used for randomly seeding the board with tiles at start of the game
function seedBoard(){

	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			//random chance to generate tile
			var randoPresent = randomInt(0, 100);
			if (randoPresent < 20) {
				//generate tile
				var tempTile;
				var randoColor = randomInt(1, 5);
				switch (randoColor) {
					case 1:
						tempTile = TilePrefab("blue");
						break;
					case 2:
						tempTile = TilePrefab("green");
						break;
					case 3:
						tempTile = TilePrefab("red");
						break;
					case 4:
						tempTile = TilePrefab("yellow");
						break;
				}
				
				stage.addChild(tempTile.container); //adds tile graphics container to stage so it can be rendered
				tileArray[i][j] = tempTile;
			}
			else {
				//board position is empty
				tileArray[i][j] = null;
			}
		}
	}

}

//handles user input events
window.addEventListener("keydown", handleInput);
function handleInput(event) {
	
	if(gameState != "playing"){
		return;
	}
	//for compatibility with as many browsers as possible
	event = event || window.event;
	
	//directional intent of the users input (up, down, left, or right)
	var controlDirection = "null";

	if (event.key) {
		switch (event.key) {
			case "w":
			case "W":
			case "ArrowUp":
				controlDirection = "up";
				break;
			case "s":
			case "S":
			case "ArrowDown":
				controlDirection = "down";
				break;
			case "a":
			case "A":
			case "ArrowLeft":
				controlDirection = "left";
				break;
			case "d":
			case "D":
			case "ArrowRight":
				controlDirection = "right";
				break;
			default:
				controlDirection = "null";
				break;
		}
	}
	//this is for browsers which dont supply KeyboardEvent.key events
	else if (event.which) {
		switch (event.which) {
			case 87: //'w' key
				controlDirection = "up";
				break;
			case 83: //'s' key
				controlDirection = "down";
				break;
			case 65: //'a' key
				controlDirection = "left";
				break;
			case 68: //'d' key
				controlDirection = "right";
				break;
			default:
				controlDirection = "null";
				break;
		}
	}
	//again, for legacy browser compatibility
	else if(event.keyCode){
		switch (event.keyCode) {
			case 87: //'w' key
				controlDirection = "up";
				break;
			case 83: //'s' key
				controlDirection = "down";
				break;
			case 65: //'a' key
				controlDirection = "left";
				break;
			case 68: //'d' key
				controlDirection = "right";
				break;
			default:
				controlDirection = "null";
				break;
		}
	}

	//respond to input accordingly
	switch (controlDirection) {
		case "up":
		case "down":
		case "left":
		case "right":
			shiftTiles(controlDirection);
			spawnTiles();
			updateTilePositions();
			checkLose();
			break;
		default:
			//alert("key pressed, but not wasd or arrowkey");
			break;
	}

}

//shifts all tiles on board as far as possible in the direction specified
function shiftTiles(direction){
	
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			if(tileArray[i][j] != null){
				tileArray[i][j].solved = false;
			}
		}
	}
	
	var loop = true;
	while (loop) {
		var allSolved = true;

		for (var i = 0; i < 5; i++) {
			for (var j = 0; j < 5; j++) {
				if (tileArray[i][j] == null) {
					//ignore this position if there is not a tile here
					continue;
				}
				else if (tileArray[i][j].solved == false) {
					allSolved = false;
					//direction should be one of the following strings: up, down, left, right
					switch (direction) {
						case "up":
							shiftUp(i, j);
							break;
						case "down":
							shiftDown(i, j);
							break;
						case "left":
							shiftLeft(i, j);
							break;
						case "right":
							shiftRight(i, j);
							break;
					}
				}
			}
		}
		
		if(allSolved == true){
			loop = false;
			break;
		}
	}
	
	updateTilePositions();
	
	//tile shift logic functions, one for each of the four directions
	function shiftUp(i, j){
		if(j == 0){
			tileArray[i][j].solved = true;
			return;
		}
		if(tileArray[i][j - 1] == null){
			tileArray[i][j - 1] = tileArray[i][j];
			tileArray[i][j] = null;
			return;
		} else{
			if(tileArray[i][j - 1].color == tileArray[i][j].color || tileArray[i][j - 1].count == tileArray[i][j].count){
				tileArray[i][j - 1].count += tileArray[i][j].count;
				stage.removeChild(tileArray[i][j].container);
				tileArray[i][j] = null;
				return;
			}else{
				if(tileArray[i][j - 1].solved == true){
					tileArray[i][j].solved = true;
				}
			}
		}
	}
	
	function shiftDown(i, j){
		if(j == 4){
			tileArray[i][j].solved = true;
			return;
		}
		if(tileArray[i][j + 1] == null){
			tileArray[i][j + 1] = tileArray[i][j];
			tileArray[i][j] = null;
			return;
		} else{
			if(tileArray[i][j + 1].color == tileArray[i][j].color || tileArray[i][j + 1].count == tileArray[i][j].count){
				tileArray[i][j + 1].count += tileArray[i][j].count;
				stage.removeChild(tileArray[i][j].container);
				tileArray[i][j] = null;
				return;
			}else{
				if(tileArray[i][j + 1].solved == true){
					tileArray[i][j].solved = true;
				}
			}
		}
	}
	
	function shiftLeft(i, j){
		if(i == 0){
			tileArray[i][j].solved = true;
			return;
		}
		if(tileArray[i - 1][j] == null){
			tileArray[i - 1][j] = tileArray[i][j];
			tileArray[i][j] = null;
			return;
		} else{
			if(tileArray[i - 1][j].color == tileArray[i][j].color || tileArray[i - 1][j].count == tileArray[i][j].count){
				tileArray[i - 1][j].count += tileArray[i][j].count;
				stage.removeChild(tileArray[i][j].container);
				tileArray[i][j] = null;
				return;
			}else{
				if(tileArray[i - 1][j].solved == true){
					tileArray[i][j].solved = true;
				}
			}
		}
	}
	
	function shiftRight(i, j){
		if(i == 4){
			tileArray[i][j].solved = true;
			return;
		}
		if(tileArray[i + 1][j] == null){
			tileArray[i + 1][j] = tileArray[i][j];
			tileArray[i][j] = null;
			return;
		} else{
			if(tileArray[i + 1][j].color == tileArray[i][j].color || tileArray[i + 1][j].count == tileArray[i][j].count){
				tileArray[i + 1][j].count += tileArray[i][j].count;
				stage.removeChild(tileArray[i][j].container);
				tileArray[i][j] = null;
				return;
			}else{
				if(tileArray[i + 1][j].solved == true){
					tileArray[i][j].solved = true;
				}
			}
		}
	}
}

//randomly spawn tiles in empty locations
function spawnTiles() {
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			if (tileArray[i][j] == null) {
				
				var spawnChancePercentage;
				if(highestCount > 1500){
					spawnChancePercentage = 30;
				}
				else if(highestCount > 300){
					spawnChancePercentage = 23;
				}
				else {
					spawnChancePercentage = 15;
				}
				
				var randoSpawn = randomInt(0, 100);
				if (randoSpawn < spawnChancePercentage) {
					//generate tile
					var tempTile;
					var randoColor = randomInt(1, 5);
					switch (randoColor) {
						case 1:
							tempTile = TilePrefab("blue");
							break;
						case 2:
							tempTile = TilePrefab("green");
							break;
						case 3:
							tempTile = TilePrefab("red");
							break;
						case 4:
							tempTile = TilePrefab("yellow");
							break;
					}
					
					if(highestCount > 2000){
						tempTile.count = randomInt(1, 33);
					}
					else if(highestCount > 500){
						tempTile.count = randomInt(1, 17);
					}
					else if(highestCount > 100){
						tempTile.count = randomInt(1, 9);
					}
					else{
						tempTile.count = randomInt(1, 5);
					}
					
					stage.addChild(tempTile.container); //adds tile graphics container to stage so it can be rendered
					tileArray[i][j] = tempTile;
				}
			}
		}
	}
}

//checks to see if player has lost
function checkLose(){
	var boardFull = true;
	
	for(var i = 0; i < tileArray.length; i++){
		for(var j = 0; j < tileArray[i].length; j++){
			if(tileArray[i][j] == null){
				boardFull = false;
				break;
			}
		}
		if(boardFull == false){
			break;
		}
	}
	
	if(boardFull == true){
		//activate loss gamestate
		stateLose();
	}
}

//main menu, for starting new game
function stateMenu(){
	gameState = "menu";
	
	//temporary. to be replaced by proper ui
	alert("Click OK to start new game\n(Dialog is placeholder for a real UI)");
	
	highestCount = 0;
	seedBoard();
	updateTilePositions();
	gameState = "playing";
}

//player has lost the game
function stateLose(){
	gameState = "lose";
	
	//temporary. should be replaced by proper 'Game Over' overlay
	alert("You lose! Your highest tile score was: " + highestCount + "\n(Dialog is placeholder for a real UI)");
	
	//clear the board
	for(var i = 0; i < tileArray.length; i++){
		for(var j = 0; j < tileArray[i].length; j++){
			if(tileArray[i][j] != null){
				stage.removeChild(tileArray[i][j].container);
				tileArray[i][j] = null;
			}
		}
	}
	
	//go back to main menu
	stateMenu();
}