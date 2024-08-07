const FACTOR = 30;
const CANVAS_HEIGHT = 9*FACTOR;
const CANVAS_WIDTH = 16*FACTOR;
const MINI_GRID_SIZE = 10;


(async ()=> {
	const canvas = document.getElementById("game") as (HTMLCanvasElement | null);
	if (canvas === null) throw new Error("Canvas not supported");
	canvas.width = CANVAS_WIDTH;
	canvas.height= CANVAS_HEIGHT;
	const ctx = canvas.getContext("2d");
	if (ctx == null) throw new Error("Context 2D not supported");
	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = "#181818";
	// ctx.fillStyle = "red";
	ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);

	let game = await import("./game.js");
	const {Vector2} = await import("./vector.js");
	const isDev = window.location.hostname === "localhost";
	if (isDev) {
		const ws = new WebSocket("ws://localhost:6970");

		ws.addEventListener("message", async (event) => {
			// TODO: hot reloading should not break if the game crashes
			if (event.data === "hot") {
				console.log("Hot reloading module");
				game = await import("./game.js?date="+new Date().getTime());
			} else if (event.data === "cold") {
				window.location.reload()
			}
		});
	}
	

	let player = game.createPlayer(new Vector2(5.4,5.7), Math.PI*0.4);
	const screen = game.createScreen(ctx, MINI_GRID_SIZE);


	window.addEventListener("keydown", (e) =>{
		if (!e.repeat){
			switch (e.code){
				case 'KeyW': player.movingForward  = true; break;
				case 'KeyS': player.movingBackward = true; break;
				case 'KeyA': player.turningLeft    = true; break;
				case 'KeyD': player.turningRight   = true; break;
			}
		}
	});
	window.addEventListener("keyup", (e) =>{
		switch (e.code){
			case 'KeyW': player.movingForward  = false; break;
			case 'KeyS': player.movingBackward = false; break;
			case 'KeyA': player.turningLeft    = false; break;
			case 'KeyD': player.turningRight   = false; break;
		}
	});

	let prevTime: number = 0;
	const frame =  (timeStamp: number) =>{
		const delta = (timeStamp-prevTime)/1000;
		const time = timeStamp/1000;
		prevTime = timeStamp;
		game.render(screen, delta, player);
		window.requestAnimationFrame(frame);
	};
	

	window.requestAnimationFrame((timestamp) =>{
		prevTime = timestamp;
		window.requestAnimationFrame(frame);
	});
})()
