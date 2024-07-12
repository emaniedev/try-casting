const eps = 10e-5;
const MINI_GRID_SIZE = 10;
export class Vector2 {
    x;
    y;
    constructor(x = 1, y = 1) {
        this.x = x;
        this.y = y;
    }
    len() {
        return this.x + this.y;
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    add(that) {
        this.x += that.x;
        this.y += that.y;
        return this;
    }
    sub(that) {
        this.x -= that.x;
        this.y -= that.y;
        return this;
    }
    scale(x) {
        this.x *= x;
        this.y *= x;
        return this;
    }
    norm() {
        const l = this.len();
        return l === 0 ? this : this.scale(1 / l);
    }
    setPolar(angle, len = 1) {
        this.x = Math.cos(angle) * len;
        this.y = Math.sin(angle) * len;
        return this;
    }
}
;
function showFps(ctx, dt) {
    const fps = Math.floor(1 / dt);
    const fontSize = Math.floor(ctx.canvas.height * 0.1);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = "white";
    ctx.fillText(fps.toString(), ctx.canvas.width - ctx.measureText(fps.toString()).width, fontSize);
}
;
;
export function createPlayer(position) {
    const velocity = new Vector2();
    const movingForward = false;
    const movingBackward = false;
    const turningLeft = false;
    const turningRight = false;
    const speed = 2;
    const direction = Math.PI * 0.95;
    const turningVelocity = Math.PI;
    return { position,
        velocity,
        speed,
        direction,
        turningVelocity,
        movingForward,
        movingBackward,
        turningLeft,
        turningRight,
    };
}
const map = [null, null, null, null, null, null, null, null, null, null,
    null, 1, 1, 1, null, null, null, null, null, null,
    null, null, 1, null, null, null, null, null, null, null,
    null, null, null, 1, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, 1, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, 1, null,
    null, null, null, null, null, null, null, null, null, null];
export function render(ctx, dt, player) {
    resetCanvas(ctx);
    showFps(ctx, dt);
    renderMiniMap(ctx, dt, player);
}
function canMoveThere(x, y, w, h) {
    let x1 = Math.floor(x - w * 0.5);
    let x2 = Math.floor(x + w * 0.5);
    let y1 = Math.floor(y - h * 0.5);
    let y2 = Math.floor(y + h * 0.5);
    console.log(x1, x2, y1, y2);
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            console.log(map[y * MINI_GRID_SIZE + x]);
            if (map[y * MINI_GRID_SIZE + x] !== null) {
                return false;
            }
        }
    }
    return true;
}
function renderMiniMap(ctx, dt, player) {
    ctx.save();
    const miniSize = 8;
    const miniPadding = ctx.canvas.width * 0.02;
    ctx.transform(miniSize / 16, 0, 0, miniSize / 9, miniPadding, miniPadding);
    resetCanvas(ctx);
    const cellWidth = ctx.canvas.width / MINI_GRID_SIZE;
    const cellHeight = ctx.canvas.height / MINI_GRID_SIZE;
    for (let i = 0; i < MINI_GRID_SIZE * MINI_GRID_SIZE; i++) {
        if (map[i] === 1) {
            let y = Math.floor(i / MINI_GRID_SIZE) * cellHeight;
            let x = Math.floor(i % MINI_GRID_SIZE) * cellWidth;
            ctx.fillStyle = "magenta";
            ctx.fillRect(x, y, cellWidth, cellHeight);
        }
    }
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    for (let y = cellHeight; y < MINI_GRID_SIZE * cellHeight; y += cellHeight) {
        ctx.moveTo(0, y);
        ctx.lineTo(MINI_GRID_SIZE * cellWidth, y);
    }
    for (let x = cellWidth; x < MINI_GRID_SIZE * cellWidth; x += cellWidth) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, MINI_GRID_SIZE * cellHeight);
    }
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.stroke();
    const playerWidth = cellWidth * 0.5;
    const playerHeight = cellHeight * 0.5;
    let angular = 0;
    player.velocity.scale(0);
    if (player.movingForward) {
        player.velocity.add(new Vector2().setPolar(player.direction, player.speed));
    }
    if (player.movingBackward) {
        player.velocity.sub(new Vector2().setPolar(player.direction, player.speed));
    }
    if (player.turningRight) {
        angular += player.turningVelocity;
    }
    if (player.turningLeft) {
        angular -= player.turningVelocity;
    }
    player.direction = player.direction + angular * dt;
    const newX = player.position.x + player.velocity.x * dt;
    const newY = player.position.y + player.velocity.y * dt;
    if (canMoveThere(newX, player.position.y, playerWidth / cellWidth, playerHeight / cellHeight))
        player.position.x = newX;
    if (canMoveThere(player.position.x, newY, playerWidth / cellWidth, playerHeight / cellHeight))
        player.position.y = newY;
    ctx.fillStyle = "blue";
    ctx.fillRect(player.position.x * cellWidth - playerWidth / 2, player.position.y * cellHeight - playerHeight / 2, playerWidth, playerHeight);
    ctx.beginPath();
    ctx.strokeStyle = "red";
    let currentPos = player.position.clone();
    ctx.moveTo(currentPos.x * cellWidth, currentPos.y * cellHeight);
    let ndir = new Vector2().setPolar(player.direction);
    const lineTo = ndir.add(player.position);
    ctx.lineTo(lineTo.x * cellWidth, lineTo.y * cellHeight);
    ctx.stroke();
    ctx.restore();
}
function resetCanvas(ctx) {
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
;
//# sourceMappingURL=game.js.map