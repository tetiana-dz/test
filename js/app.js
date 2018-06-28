"use strict";
const mycelium = {
	hyphae: [],
	load(setup) {
		for (let k in setup) this[k] = setup[k];
		return new Promise(resolve => {
			const img = new Image();
			img.crossOrigin = "Anonymous";
			img.addEventListener("load", e => resolve(img));
			img.src = setup.src;
		});
	},
	reset() {
		this.width = this.canvas.width = this.canvas.offsetWidth;
		this.height = this.canvas.height = this.canvas.offsetHeight;
		this.rw = this.width / this.imageWidth;
		this.rh = this.height / this.imageHeight;
		this.hyphae.length = 0;
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0, 0, this.width, this.height);
		for (let i = 0; i < this.numHyphae; i++) {
			this.hyphae.push(new this.Hypha(this));
		}
	},
	start(img) {
		this.canvas = document.querySelector("canvas");
		this.ctx = this.canvas.getContext("2d");
		const source = document.createElement("canvas");
		this.imageWidth = source.width = img.width;
		this.imageHeight = source.height = img.height;
		const ict = source.getContext("2d");
		ict.drawImage(img, 0, 0);
		this.imageData = ict.getImageData(0, 0, source.width, source.height).data;
		this.reset();
		this.draw();
		["click", "touchdown"].forEach(event => {
			document.addEventListener(event, e => mycelium.reset(), false);
		});
	},
	draw() {
		requestAnimationFrame(this.draw.bind(this));
		for (const line of this.hyphae) {
			line.draw(this.ctx);
		}
	},
	Hypha: class {
		constructor(parent) {
			this.parent = parent;
			this.init();
		}
		init() {
			this.a = Math.random() * 2 * Math.PI;
			do {
				this.x = Math.random() * this.parent.imageWidth;
				this.y = Math.random() * this.parent.imageHeight;
				this.l = this.pixelValue(this.x, this.y);
			} while (this.l < this.parent.minColor);
			this.l *= this.parent.lengthLine;
			this.c = this.pixelColor(this.x, this.y);
		}
		draw(ctx) {
			const p = this.parent;
			this.l--;
			if (
				this.l < 0 ||
				this.x < 0 ||
				this.x > p.imageWidth ||
				this.y < 0 ||
				this.y > p.imageHeight
			) {
				this.init();
				return;
			}
			let b = 0,
				vm = 0;
			for (
				let a = -p.maxTurn;
				a <= p.maxTurn;
				a += p.step
			) {
				const v = this.pixelValue(
					this.x + p.distScan * Math.cos(this.a + a),
					this.y + p.distScan * Math.sin(this.a + a)
				);
				if (Math.random() > 0.5) {
					if (v > vm) {
						vm = v;
						b = a;
					}
				} else {
					if (v >= vm) {
						vm = v;
						b = a;
					}
				}
			}
			ctx.beginPath();
			ctx.strokeStyle = this.c;
			ctx.moveTo(this.x * p.rw, this.y * p.rh);
			this.a += b;
			this.x += Math.cos(this.a);
			this.y += Math.sin(this.a);
			ctx.lineTo(this.x * p.rw, this.y * p.rh);
			ctx.stroke();
		}
		pixelIndex(x, y) {
			return Math.floor(x) * 4 + Math.floor(y) * 4 * this.parent.imageWidth;
		}
		pixelValue(x, y) {
			const i = this.pixelIndex(x, y);
			return (
				0.299 * this.parent.imageData[i] +
				0.587 * this.parent.imageData[i + 1] +
				0.114 * this.parent.imageData[i + 2]
			);
		}
		pixelColor(x, y) {
			const i = this.pixelIndex(x, y);
			return `rgb(${this.parent.imageData[i]},${this.parent.imageData[i + 1]},${
				this.parent.imageData[i + 2]
			})`;
		}
	}
};

mycelium
	.load({
		src: "https://images.unsplash.com/photo-1530089542225-c4645f98cbe4?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=f9e7dee94ad6509cefa2b0122bf7e7b5&auto=format&fit=crop&w=1350&q=80",
		numHyphae: 400,
		maxTurn: 0.4,
		step: 0.1,
		distScan: 2,
		lengthLine: 0.2,
		minColor: 0
	})
	.then(img => mycelium.start(img));