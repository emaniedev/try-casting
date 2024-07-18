export class Vector2 {
    x;
    y;
    constructor(x = 1, y = 1) {
        this.x = x;
        this.y = y;
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
    dot(that) {
        const x = this.x * that.x;
        const y = this.y * that.y;
        return x + y;
    }
    scale(x) {
        this.x *= x;
        this.y *= x;
        return this;
    }
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    distTo(that) {
        const dx = that.x - this.x;
        const dy = that.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
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
    lerp(that, t) {
        this.x += (that.x - this.x) * t;
        this.y += (that.y - this.y) * t;
        return this;
    }
}
;
//# sourceMappingURL=vector.js.map