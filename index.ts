


(async ()=> {
	let game = await import("./game.js");
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
})
