import * as u from "uuid";
import _ from "lodash";
import chroma from "chroma-js";
import { homedir } from "os";
const uuid = u.v4;
console.log("--- uuid: ", uuid);

export default class Shelf {
  constructor(stream, index) {
    this.stream = stream;
    this.index = index;
    this.id = uuid();
    console.log("shelf created: ", this.id);
    console.log("shelf color: ", this.color);
    this.init();
    this.shift = _.random(1, 10);
    this.advancing = true;
  }

  get grey() {
    if (!this._grey) {
      this._grey = _.random(this.index * 51, 255);
    }
    return this._grey;
  }

  get color() {
    if (!this._color) {
      this._color = chroma(this.grey, this.grey, this.grey).hex();
    }
    return this._color;
  }

  tweakColor() {
    if (this.advancing) {
      this._grey += this.shift;
      if (this._grey > 255) {
        this.advancing = !this.advancing;
        return this.tweakColor();
      }
    } else {
      this._grey -= this.shift;
      if (this._grey < 0) {
        this.advancing = !this.advancing;
        return this.tweakColor();
      }
    }
    this._color = null;
    this.g.attr("fill", this.color);
  }

  cycle(value) {
    console.log("cycling ", this, value);
    const offset = (100 * this.index) / this.stream.my.layers.length;
    const progress = ((value + offset) / 100) % 100;
    const angleRad = Math.PI * 2 * progress;
    const sin = Math.max(0, Math.sin(angleRad));
    this._grey = Math.round(255 * sin);
    this._color = null;
    this.g.attr("fill", this.color);
  }

  get g() {
    if (!this._g) {
      const svg = this.stream.my.svg;
      this._g = svg.group();
      this._g.attr("fill", this.color);
    }
    return this._g;
  }

  init() {
    const wHeight = this.stream.my.height;
    const gs = this.gridSize;
    try {
      const range = _.range(_.random(-gs, gs, true), wHeight, gs);
      range.forEach(height => {
        this.drawHoriz(height);
        let lastX = -gs;
        for (
          let x = _.random(-gs, gs);
          x < this.stream.my.width + 3 * gs;
          x += _.random(gs, gs * 2)
        ) {
          this.drawVert(height, x, lastX);
          lastX = x;
        }
      });
    } catch (e) {
      console.log("shelf init error: ", e);
    }
  }

  get gridSize() {
    return (this.stream.my.height + this.stream.my.width) / 20;
  }

  get strutWidth() {
    return this.gridSize / 20;
  }

  get shelfHeight() {
    return this.gridSize / 20;
  }

  drawHoriz(y) {
    try {
      const width = this.stream.my.width + 2 * this.gridSize;
      // shelf
      const r = this.g.rect(width, this.shelfHeight);
      r.move(-10, y);
    } catch (err) {
      console.log("drawHoriz error: ", err);
    }
  }

  drawVert(height, x, lastX) {
    try {
      // strut
      const r = this.g.rect(this.strutWidth, this.gridSize);
      r.move(x, height);

      const two = Math.random() > 0.8;
      // box
      this.makeBox(height, x, lastX, two);
      if (two) this.makeBox(height, x, lastX, two, true);
    } catch (err) {
      console.log("drawVert: err", err);
    }
  }

  makeBox(height, x, lastX, two, second) {
    const availWidth = x - lastX - this.strutWidth;
    const availHeight = this.gridSize - this.shelfHeight;
    const topGap = _.random(this.shelfHeight, (availHeight * 2) / 3);
    let boxSize = _.random(availWidth / 6, availWidth);
    let center = Math.random();
    if (two) {
      if (second) {
        center = Math.max(center, Math.random());
      } else {
        center = Math.min(center, Math.random());
      }
    }
    let leftGap = (availWidth - boxSize) * center;
    let rightGap = (availWidth - boxSize) * (1 - center);

    const box = this.g.rect(
      availWidth - (leftGap + rightGap),
      availHeight - topGap
    );
    box.move(
      lastX + this.strutWidth + leftGap,
      height + this.shelfHeight + topGap
    );
  }

  remove() {
    if (this.g) this.g.remove();
    if (this.si) clearInterval(this.si);
  }

  update(stream) {
    this.g.clear();
    this.init();
  }
}
