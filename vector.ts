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
