const eps = 10e-5;
const MINI_GRID_SIZE = 10;


export class Vector2{
	x: number;
	y: number;
	constructor(x:number = 1, y:number = 1){
		this.x = x;
		this.y = y;
	}
	len(){
		return this.x + this.y;
	}
	clone(){
		return new Vector2(this.x,this.y);
	}
	add(that: Vector2){
		this.x += that.x;
		this.y += that.y;
		return this;
	}
	sub(that: Vector2){
		this.x -= that.x;
		this.y -= that.y;
		return this;
	}
	scale(x:number){
		this.x *= x;
		this.y *= x;
		return this;
	}
	norm(): this {
		const l = this.len();
		return l === 0 ? this : this.scale(1/l);
	}
	setPolar(angle: number, len: number = 1): this {
		this.x = Math.cos(angle)*len;
		this.y = Math.sin(angle)*len;
		return this;
	}
};

function showFps(ctx: CanvasRenderingContext2D, dt: number){
	const fps = Math.floor(1/dt);

	const fontSize = Math.floor(ctx.canvas.height*0.1);

	ctx.font = `${fontSize}px sans-serif`;
       //ctx.font = "bold 48px serif";

	ctx.fillStyle = "white";
	ctx.fillText(fps.toString(),ctx.canvas.width - ctx.measureText(fps.toString()).width,  fontSize);
};


interface Player {
	position: Vector2,
	velocity: number,
	direction: number,
	turningVelocity: number,

	movingForward: boolean,
	movingBackward: boolean,
	turningLeft: boolean,
	turningRight: boolean,

};

export function createPlayer(position: Vector2){
	const movingForward = false;
	const movingBackward = false;
	const turningLeft = false;
	const turningRight = false;
	const velocity = 2;
	const direction = Math.PI*0.95;
	const turningVelocity = Math.PI;
	return {position,
		velocity,
		direction,
		turningVelocity,
		movingForward,
		movingBackward,
		turningLeft,
		turningRight,
 };
}

type Cell = number | null;

const map: Array<Cell> =      [ null, null,null, null,null, null,null, null,null, null,
				null,    1,   1,    1,null, null,null, null,null, null,
				null, null,   1, null,null, null,null, null,null, null,
				null, null,null,    1,null, null,null, null,null, null,
				null, null,null, null,null, null,null, null,null, null,
				null, null,   1, null,null, null,null, null,null, null,
				null, null,null, null,null, null,null, null,null, null,
				null, null,null, null,null, null,null, null,null, null,
				null, null,null, null,null, null,null, null,   1, null];
export function render(ctx: CanvasRenderingContext2D, dt: number, player: Player){
	resetCanvas(ctx);
	showFps(ctx,dt);
	renderMiniMap(ctx, dt, player);
}

function renderMiniMap(ctx: CanvasRenderingContext2D, dt:number, player: Player){
	ctx.save();
	const miniSize = 8;
	const miniPadding = ctx.canvas.width*0.02;
	ctx.transform(miniSize/16,0,0,miniSize/9,miniPadding,miniPadding);

	resetCanvas(ctx);

	const cellWidth = ctx.canvas.width/MINI_GRID_SIZE;
	const cellHeight = ctx.canvas.height/MINI_GRID_SIZE;

	// Draw walls
	for(let i = 0; i< MINI_GRID_SIZE*MINI_GRID_SIZE; i++){
		if (map[i] === 1){
			let y = Math.floor(i/MINI_GRID_SIZE)*cellHeight;
			let x = Math.floor(i%MINI_GRID_SIZE)*cellWidth;

			ctx.fillStyle = "magenta";
			ctx.fillRect(x, y, cellWidth, cellHeight);
		}
	}

	// draw minimap lines
	ctx.strokeStyle = "yellow";
	ctx.beginPath();
	for(let y = cellHeight; y < MINI_GRID_SIZE*cellHeight; y += cellHeight ){
		ctx.moveTo(0,y);
		ctx.lineTo(MINI_GRID_SIZE*cellWidth, y);
	}
	for(let x = cellWidth; x < MINI_GRID_SIZE*cellWidth; x += cellWidth ){
		ctx.moveTo(x,0);
		ctx.lineTo( x,MINI_GRID_SIZE*cellHeight);
	}
	ctx.strokeRect(0,0,ctx.canvas.width, ctx.canvas.height);
	ctx.stroke();


	// draw player rect
	const playerWidth =cellWidth*0.5;
	const playerHeight = cellHeight*0.5;


	let angular = 0;
	let lineal = 0;
	if (player.turningRight){
		angular += player.turningVelocity;
	} 
	if (player.turningLeft){
		angular -= player.turningVelocity;
	} 
	player.direction = player.direction + angular * dt;

	let ndir = new Vector2().setPolar(player.direction, player.velocity*dt);
	if (player.movingForward){
		lineal += player.velocity;
	}
	if (player.movingBackward){
		lineal -= player.velocity;
	} 

	// Rudimentary collision checker
	const newPos = player.position.clone().add(ndir.scale(lineal));
	const x = Math.floor(newPos.x);
	const y = Math.floor(newPos.y);
	if (map[y*MINI_GRID_SIZE+x] === null) {
		player.position = newPos; 
	}

	

	ctx.fillStyle = "blue";
	ctx.fillRect(player.position.x*cellWidth - playerWidth/2, player.position.y*cellHeight - playerHeight/2, playerWidth, playerHeight);

	// Draw player direction
	ctx.beginPath();
	ctx.strokeStyle = "red"
	let currentPos = player.position.clone(); 
	ctx.moveTo(currentPos.x*cellWidth, currentPos.y*cellHeight );
	ndir = new Vector2().setPolar(player.direction);
	const lineTo = ndir.add(player.position);
	ctx.lineTo(lineTo.x*cellWidth, lineTo.y*cellHeight);
	ctx.stroke();




	ctx.restore();
}


function resetCanvas(ctx: CanvasRenderingContext2D){
	ctx.fillStyle = "#181818";
	//ctx.fillStyle = "red";
	ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
