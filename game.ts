import { Vector2 } from "./vector.js";
// Minimap Options
const SHOW_PLAYER_DIRECTION = true;
const SHOW_PLAYER_FOV = true;
const SHOW_MINI_RAYCAST = false;

// RayCast Options
const NUMBER_OF_RAYS = 16*30;


interface Screen {
	width: number,
	height: number,
	ctx: CanvasRenderingContext2D,
	miniGridSize: number,
	miniGridWidth: number,
	miniGridHeight: number,
}

export function createScreen(ctx: CanvasRenderingContext2D, miniGridSize: number): Screen{
	const width = ctx.canvas.width;
	const height = ctx.canvas.height;

	const miniGridWidth= width/miniGridSize;
	const miniGridHeight= height/miniGridSize;

	return {
		width,
		height,
		ctx,
		miniGridSize,
		miniGridWidth,
		miniGridHeight,
	};
}


interface Player {
	position: Vector2,
	velocity: Vector2,
	speed: number,
	direction: number,
	turningVelocity: number,

	movingForward: boolean,
	movingBackward: boolean,
	turningLeft: boolean,
	turningRight: boolean,

	fov: number,
	near_screen: number,

};

export function createPlayer(position: Vector2, fov: number){
	const velocity = new Vector2();
	const movingForward = false;
	const movingBackward = false;
	const turningLeft = false;
	const turningRight = false;
	const speed = 2;
	const direction = Math.PI*0.95;
	const turningVelocity = Math.PI;
	const near_screen = 3.3;
	return {position,
		velocity,
		speed,
		direction,
		turningVelocity,
		movingForward,
		movingBackward,
		turningLeft,
		turningRight,
		fov,
		near_screen,
 };
}

type Cell = number | null;

const map: Array<Cell> =    [ null, null,null, null,null, null,null, null,null, null,
	null,    1,   1,    1,null, null,null, null,null, null,
	null, null,   1, null,null, null,null, null,null, null,
	null, null,null,    1,null, null,null, null,null, null,
	null, null,null, null,null, null,null, null,null, null,
	null, null,   1, null,null, null,null, null,null, null,
	null, null,null, null,null, null,null, null,null, null,
	null, null,null, null,null, null,null, null,null, null,
	null, null,null, null,null, null,null, null,   1, null,
	null, null,null, null,null, null,null, null,null, null];

export function render(screen: Screen , dt: number, player: Player){
	resetCanvas(screen.ctx);
	showFps(screen.ctx,dt);
	renderMiniMap(screen, dt, player);
	renderWalls(screen, dt, player);
}

function drawWalls(screen: Screen){
	const ctx = screen.ctx;
	const cellWidth = screen.miniGridWidth;
	const cellHeight = screen.miniGridHeight;
	const miniGridSize = screen.miniGridSize;

	for(let i = 0; i< miniGridSize*miniGridSize; i++){
		if (map[i] === 1){
			let y = Math.floor(i/miniGridSize)*cellHeight;
			let x = Math.floor(i%miniGridSize)*cellWidth;
			ctx.fillStyle = "magenta";
			ctx.fillRect(x, y, cellWidth, cellHeight);
		}
	}
}

function drawMiniMapLines(screen: Screen){
	const ctx = screen.ctx;
	const minimapGridSize = screen.miniGridSize;
	const cellWidth = screen.miniGridWidth;
	const cellHeight = screen.miniGridHeight;

	ctx.strokeStyle = "yellow";
	ctx.beginPath();
	for(let y = cellHeight; y < minimapGridSize*cellHeight; y += cellHeight ){
		ctx.moveTo(0,y);
		ctx.lineTo(minimapGridSize*cellWidth, y);
	}
	for(let x = cellWidth; x < minimapGridSize*cellWidth; x += cellWidth ){
		ctx.moveTo(x,0);
		ctx.lineTo( x,minimapGridSize*cellHeight);
	}
	ctx.strokeRect(0,0,ctx.canvas.width, ctx.canvas.height);
	ctx.stroke();
}

function canMoveThere(x: number, y: number, w: number, h: number){
    let x1 = Math.floor(x - w*0.5);
    let x2 = Math.floor(x + w*0.5);
	let y1 = Math.floor(y - h*0.5);
	let y2 = Math.floor(y + h*0.5);

	for(let y = y1; y <= y2; y++){
		for(let x = x1; x <= x2; x++){
			if (map[y*MINI_GRID_SIZE+x] !== null){
				return false;
			}
		}
	}
	return true;
}

function drawPlayer(screen: Screen, player: Player, dt: number){
	const ctx = screen.ctx;
	const cellWidth = screen.miniGridWidth;
	const cellHeight = screen.miniGridHeight;
	const playerWidth =cellWidth*0.5;
	const playerHeight = cellHeight*0.5;

	let angular = 0;
	player.velocity.scale(0);
	if (player.movingForward){
		player.velocity.add(new Vector2().setPolar(player.direction, player.speed));
	}
	if (player.movingBackward){
		player.velocity.sub(new Vector2().setPolar(player.direction, player.speed));
	} 
	if (player.turningRight){
		angular += player.turningVelocity;
	} 
	if (player.turningLeft){
		angular -= player.turningVelocity;
	} 
	player.direction = player.direction + angular * dt;

	// Rudimentary collision checker
	// Go through the four corners of the player.

	const newX = player.position.x + player.velocity.x * dt;
	const newY = player.position.y + player.velocity.y * dt;

	if (canMoveThere(newX, player.position.y, playerWidth/cellWidth, playerHeight/cellHeight)) player.position.x = newX;
	if (canMoveThere(player.position.x, newY, playerWidth/cellWidth, playerHeight/cellHeight)) player.position.y = newY;

	ctx.fillStyle = "blue";
	ctx.fillRect(player.position.x*cellWidth - playerWidth/2, player.position.y*cellHeight - playerHeight/2, playerWidth, playerHeight);
}

function drawPlayerDirection(screen: Screen, player: Player){
	const ctx = screen.ctx;
	const cellWidth = screen.miniGridWidth;
	const cellHeight = screen.miniGridHeight;
	
	ctx.beginPath();
	ctx.strokeStyle = "red"
	ctx.moveTo(player.position.x*cellWidth, player.position.y*cellHeight );
	let ndir = new Vector2().setPolar(player.direction, 0.5);
	const lineTo = ndir.add(player.position);
	ctx.lineTo(lineTo.x*cellWidth, lineTo.y*cellHeight);
	ctx.stroke();
}

function drawPlayerFov(screen: Screen, player: Player){
	const ctx = screen.ctx;
	const cellWidth = screen.miniGridWidth;
	const cellHeight = screen.miniGridHeight;
	let p1 = new Vector2().setPolar(player.direction - (player.fov/2) ).norm().scale(player.near_screen/Math.sin(player.fov)).add(player.position);
	let p2 = new Vector2().setPolar(player.direction + (player.fov/2)).norm().scale(player.near_screen/Math.sin(player.fov)).add(player.position);
	ctx.beginPath();
	ctx.strokeStyle = "red"
	ctx.moveTo(player.position.x*cellWidth, player.position.y*cellHeight );
	ctx.lineTo(p1.x*cellWidth, p1.y*cellHeight);
	ctx.lineTo(p2.x*cellWidth, p2.y*cellHeight);
	ctx.lineTo(player.position.x*cellWidth, player.position.y*cellHeight );
	ctx.stroke();
}
function rayCast(screen: Screen, player: Player){
	const ctx = screen.ctx;
	const rayAlpha = player.fov/NUMBER_OF_RAYS;
	const precision = 64;
	for(let i = 0; i<NUMBER_OF_RAYS; i++){
		ctx.beginPath();
		ctx.strokeStyle = "green"
		const [x,y] = rayEndPoint(screen, player, rayAlpha, i, precision);
		ctx.lineTo(x,y);
		ctx.stroke();
	}
}
function rayEndPoint(screen: Screen, player: Player, rayAlpha: number, i: number, precision: number): Array<number>{
	const cellWidth = screen.miniGridWidth;
	const cellHeight = screen.miniGridHeight;
	let raySin = Math.sin(rayAlpha * i + player.direction - (player.fov/2))/ precision ;
	let rayCos = Math.cos(rayAlpha * i+ player.direction - (player.fov/2)) / precision;
	screen.ctx.moveTo(player.position.x*cellWidth, player.position.y*cellHeight );
	let x = 0;
	let y = 0;
	for(let j = 0;j<900 ; j++){
		x = Math.floor((player.position.x + rayCos*j)*cellWidth);
		y = Math.floor((player.position.y + raySin*j)*cellHeight);
		let m = Math.floor(Math.floor(y/cellHeight)*MINI_GRID_SIZE+Math.floor(x/cellWidth));
		if( Math.floor(y/cellHeight)>MINI_GRID_SIZE || Math.floor(x/cellWidth)>MINI_GRID_SIZE ||
			map[m] !== null || map[m] === undefined || m > MINI_GRID_SIZE*MINI_GRID_SIZE){
			break;
		}
	}
	return [x,y];
}

function renderMiniMap(screen: Screen, dt:number, player: Player){
	const ctx = screen.ctx;
	ctx.save();
	{
		const miniSize = 3;
		const miniPadding = screen.width*0.02;
		screen.ctx.transform(miniSize/16,0,0,miniSize/9,miniPadding,miniPadding);
		
		resetCanvas(screen.ctx);
		drawWalls(screen);
		drawMiniMapLines(screen);
		drawPlayer(screen, player, dt);
		if (SHOW_PLAYER_DIRECTION) drawPlayerDirection(screen, player);
		if (SHOW_MINI_RAYCAST) rayCast(screen, player);
		if (SHOW_PLAYER_FOV) drawPlayerFov(screen, player);
	} ctx.restore();
}

function renderWalls(screen: Screen, dt: number, player: Player){
	const ctx = screen.ctx;
	const rayAlpha = player.fov/NUMBER_OF_RAYS;
	const precision = 64;
	// ctx.fillStyle = "red";
	// ctx.fillRect(screen.width/2, screen.height/2 ,50, 100);
	for(let i = 0; i<NUMBER_OF_RAYS; i++){
		const [x,y] = rayEndPoint(screen, player, rayAlpha, i, precision);
		let pd = new Vector2(x, y);
		let dist = player.position.distTo(pd);
		let stripHeight = screen.height/dist;
		ctx.strokeStyle = "magenta";
		ctx.strokeRect(i, screen.height/2 - stripHeight/2,10, stripHeight);
	}
}

function showFps(ctx: CanvasRenderingContext2D, dt: number){
	const fps = Math.floor(1/dt);

	const fontSize = Math.floor(ctx.canvas.height*0.1);

	ctx.font = `${fontSize}px sans-serif`;
	//ctx.font = "bold 48px serif";

	ctx.fillStyle = "white";
	ctx.fillText(fps.toString(),ctx.canvas.width - ctx.measureText(fps.toString()).width,  fontSize);
};


function resetCanvas(ctx: CanvasRenderingContext2D){
	ctx.fillStyle = "#181818";
	//ctx.fillStyle = "red";
	ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
