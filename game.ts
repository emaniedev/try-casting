const MINI_GRID_SIZE = 10;
const NUMBER_OF_RAYS = 16*30;


export class Vector2{
	x: number;
	y: number;
	constructor(x:number = 1, y:number = 1){
		this.x = x;
		this.y = y;
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
	dot(that: Vector2): number{
		const x = this.x * that.x;
		const y = this.y * that.y;
		return x + y;
	}
	scale(x:number){
		this.x *= x;
		this.y *= x;
		return this;
	}
	len(): number {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	distTo(that: Vector2): number{
		const dx = that.x - this.x;
		const dy = that.y - this.y;
		return Math.sqrt(dx*dx + dy*dy);
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
	lerp(that: Vector2, t: number): this {
		this.x += (that.x - this.x)*t;
		this.y += (that.y - this.y)*t;
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

export function render(ctx: CanvasRenderingContext2D, dt: number, player: Player){
	resetCanvas(ctx);
	showFps(ctx,dt);
	renderMiniMap(ctx, dt, player);
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

	// Draw player direction
	ctx.beginPath();
	ctx.strokeStyle = "red"
	ctx.moveTo(player.position.x*cellWidth, player.position.y*cellHeight );
	let ndir = new Vector2().setPolar(player.direction, 0.5);
	const lineTo = ndir.add(player.position);
	ctx.lineTo(lineTo.x*cellWidth, lineTo.y*cellHeight);
	ctx.stroke();

	// Draw player fov
	let p1 = new Vector2().setPolar(player.direction - (player.fov/2) ).norm().scale(player.near_screen/Math.sin(player.fov)).add(player.position);
	let p2 = new Vector2().setPolar(player.direction + (player.fov/2)).norm().scale(player.near_screen/Math.sin(player.fov)).add(player.position);
	ctx.beginPath();
	ctx.strokeStyle = "red"
	ctx.moveTo(player.position.x*cellWidth, player.position.y*cellHeight );
	ctx.lineTo(p1.x*cellWidth, p1.y*cellHeight);
	ctx.lineTo(p2.x*cellWidth, p2.y*cellHeight);
	ctx.lineTo(player.position.x*cellWidth, player.position.y*cellHeight );
	ctx.stroke();

	// Start RayCast
	const rayAlpha = player.fov*1.11/NUMBER_OF_RAYS;
	const precision = 64;
	for(let i = 0; i<NUMBER_OF_RAYS; i++){
		ctx.beginPath();
		ctx.strokeStyle = "green"
		let raySin = Math.sin(rayAlpha * i + player.direction - (player.fov/2))/ precision ;
		let rayCos = Math.cos(rayAlpha * i+ player.direction - (player.fov/2)) / precision;
		ctx.moveTo(player.position.x*cellWidth, player.position.y*cellHeight );
		let x = 0;
		let y = 0;
		for(let j = 0;j<1500 ; j++){
			x = Math.floor((player.position.x + rayCos*j)*cellWidth);
			y = Math.floor((player.position.y + raySin*j)*cellHeight);
			let m = Math.floor(Math.floor(y/cellHeight)*MINI_GRID_SIZE+Math.floor(x/cellWidth));
			if( Math.floor(y/cellHeight)>MINI_GRID_SIZE || Math.floor(x/cellWidth)>MINI_GRID_SIZE ||
				map[m] !== null || map[m] === undefined || m > MINI_GRID_SIZE*MINI_GRID_SIZE){
				console.log(m);
				break;
			}
			// const pd = p1.clone().lerp(p2, i/(NUMBER_OF_RAYS+1));
			// ctx.lineTo(pd.x*cellWidth, pd.y*cellHeight);
			// ctx.strokeStyle = "red";
			// ctx.arc(pd.x*cellWidth, pd.y*cellHeight, playerWidth/10, 0,2*Math.PI);
		}
		ctx.lineTo(x,y);
		ctx.stroke();
	}

	ctx.restore();
}


function resetCanvas(ctx: CanvasRenderingContext2D){
	ctx.fillStyle = "#181818";
	//ctx.fillStyle = "red";
	ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
