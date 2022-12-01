window.onload = function() {

	var canvasWidth = 900;
	var canvasHeight = 600;
	var blocSize = 30;
	var ctx;
	var delay = 200;
	var deeny;
	var pomme;
	var largeurBloc = canvasWidth/blocSize;
	var hauteurBloc = canvasHeight/blocSize;
	var score;
	var timeout;

	init();
	function init(){
		var canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "30px solid gray";
		canvas.style.margin = "50px auto";
		canvas.style.display = "block";
		canvas.style.backgroundColor = "#ddd"
		document.body.appendChild(canvas);
		ctx = canvas.getContext("2d");
		deeny = new Snake([[6,4], [5,4], [4,4]], "right");
		pomme = new Apple([10, 10]);
		score = 0;
		refrechCanvas();
	}

	function refrechCanvas(){
		deeny.advance();
		if(deeny.verifierCollision()){
			gameOver();
		}
		else{
			if(deeny.isEatingApple(pomme)){
				score++;
				deeny.ateApple = true;
				do{
					pomme.setNewPosition();
				}while(pomme.isOnSnake(deeny))	
			}
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			drawScore();
			deeny.draw();
			pomme.draw();
			timeout = setTimeout(refrechCanvas, delay)
		}
		
	}

	function gameOver(){
		ctx.save();
		ctx.font = "bold 70px sans-serif";
		ctx.fillStyle = "#000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		var centerX = canvasWidth / 2;
		var centerY = canvasHeight / 2;
		ctx.strokeText("Game Over", centerX, centerY - 180);
		ctx.fillText("Game Over",  centerX, centerY - 180);
		ctx.font = "bold 30px sans-serif";
		ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centerX, centerY - 120);
		ctx.fillText("Appuyer sur la touche Espace pour rejouer", centerX, centerY - 120);
		ctx.restore();
	}

	function restart(){
		deeny = new Snake([[6,4], [5,4], [4,4]], "right");
		pomme = new Apple([10, 10]);
		score = 0;
		clearTimeout(timeout);
		refrechCanvas();
	}

	function drawScore(){
		ctx.save();
		ctx.font = "bold 200px sans-serif";
		ctx.fillStyle = "gray";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var centerX = canvasWidth / 2;
		var centerY = canvasHeight / 2;
		ctx.fillText(score.toString(), centerX, centerY);
		ctx.restore();
	}

	function drawBlock(ctx, position){
		var x = position[0] * blocSize;
		var y = position[1] * blocSize;
		ctx.fillRect(x, y, blocSize, blocSize);
	}

	function Snake(body, direction){
		this.body = body;
		this.direction = direction;
		this.ateApple =false;

		this.draw = function(){
			ctx.save();
			ctx.fillStyle = "#ff0000";
			for(var i = 0; i < this.body.length; i++){
				drawBlock(ctx, this.body[i]);
			}
			ctx.restore();
		};

		this.advance = function(){
			var nextPosition = this.body[0].slice();
			// nextPosition[0] += 1;
			switch(this.direction){
				case "left":
					nextPosition[0] -= 1;
					break;
				case "right":
					nextPosition[0] += 1;
					break;
				case "up":
					nextPosition[1] -= 1;
					break;
				case "down":
					nextPosition[1] += 1;
					break;
				default:
					throw("Invalid Direction");
			}
			this.body.unshift(nextPosition);
			if(!this.ateApple)
				this.body.pop();
			else
				this.ateApple = false;
		};
		this.setDirection = function(newDirection){
			var allowedDirections;
			switch (this.direction) {

			case "left":
			case "right":
				allowedDirections = ["up", "down"];
				break;
			case "up":
			case "down":
				allowedDirections = ["left", "right"];
				break;
			default:
				throw("Invalid Direction");

			}
			if (allowedDirections.indexOf(newDirection) > -1) {
				this.direction = newDirection;
			}
		};

		this.verifierCollision = function(){
			var murCollision = false;
			var corpsCollision= false;
			var head = this.body[0];
			var rest = this.body.slice(1);
			var snakeX = head[0];
			var snakeY = head[1];
			var minX = 0;
			var minY = 0;
			var maxX = largeurBloc - 1;
			var maxY = hauteurBloc - 1;
			var nestPasEntreMurHorizontal = snakeX < minX || snakeX > maxX;
			var nestPasEntreMurVertical = snakeY < minY || snakeY > maxY;
			
			if(nestPasEntreMurHorizontal || nestPasEntreMurVertical){
				murCollision =true;
			}

			for(var i=0; i<rest.length; i++){
				if(snakeX === rest[i][0] && snakeY === rest[i][1]){
					corpsCollision = true;
				}
			}
			return murCollision || corpsCollision;
		};
		this.isEatingApple= function(appleToEat){
			var head = this.body[0];
			if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]){
				return true;
			}
			else
				return false;

		};
	}

	function Apple(position){
		this.position = position;
		this.draw = function(){
			ctx.save();
			ctx.fillStyle = "#33cc33";
			ctx.beginPath();
			var radius = blocSize/2;
			var x = this.position[0] * blocSize + radius;
			var y = this.position[1] * blocSize + radius;
			ctx.arc(x, y, radius, 0 ,Math.PI*2, true);
			ctx.fill();
			ctx.restore();
		};
		this.setNewPosition = function(){
			var newX = Math.round(Math.random() * (largeurBloc - 1));
			var newY = Math.round(Math.random() * (hauteurBloc - 1));
			this.position = [newX, newY];
		};

		this.isOnSnake = function(snakeToCheck){
			var isOnSnake = false;

			for(var i=0; i<snakeToCheck.body.length; i++){
				if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
					isOnSnake = true;
				}
			}
			return isOnSnake;
		};
	}

	document.onkeydown = function handleKeyDown(e){
		var key = e.keyCode;
		var newDirection;
		switch(key){
			case 37:
				newDirection = "left";
				break;
			case 38: 
				newDirection = "up";
				break;
			case 39: 
				newDirection = "right";
				break;
			case 40: 
				newDirection = "down";
				break;
			case 32:
				restart();
				return;
				break;
			default:
				return;
		}
		deeny.setDirection(newDirection);
	}
	
}