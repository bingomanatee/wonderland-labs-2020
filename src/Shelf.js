import * as u from "uuid";
import _ from "lodash";
import chroma from "chroma-js";
import {homedir} from "os";

const uuid = u.v4;
console.log("--- uuid: ", uuid);

const t10 = (n) => {
  if (!(typeof n === 'number')) return 0;
  return Math.floor(n / 10) * 10;
}

export default class Shelf {
  constructor(stream, index) {
    this.stream = stream;
    this.index = index;
    this.id = uuid();
    console.log("shelf created: ", this.id);
    this.init();
    this.shift = _.random(1, 10);
    this.advancing = true;
  }

  get grey() {
    if (!this._grey) {
      this._grey = 0;
    }
    return this._grey;
  }

  get color() {
    return chroma(this.grey, this.grey, this.grey).hex();
  }

  get layerCount() {
    return _.get(this, 'stream.my.layers.length', 1);
  }

  get angleOffset() {
    return 100 * this.index / Math.max(1, this.layerCount);
  }

  get repeats() {
    if (!this._count) {
      this._count = 0;
    }
    return this._count;
  }

  set repeats(v) {
    this._count = v;
  }

  get phase() {
    return Math.round((this.cyclePhase + this.angleOffset) % 100);
  }

  get angle() {
    return Math.round(this.phase * 360 / 100);
  }

  get sin() {
    return Math.sin((this.angle % 360)/ 360 * 2 * Math.PI) ;
  }

  cycle(value) {
    this.cyclePhase = value;
    this._grey = Math.round(_.clamp(255 * (1 + this.sin)/2, 0, 255));
    this.g.attr("fill", this.color);

   /* if (this.index === 8) {
      this.text.text(`phase: ${this.phase}, angle: ${this.angle}, grey: ${t10(this.grey)}`)
    }*/
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

  /*    if (this.index === 8) {
        this.text = this. g.text('stats');
        this.text.move(200, 200);
        this.text.attr('fill', 'red');
      }*/
    } catch (e) {
      console.log("shelf init error: ", e);
    }
  }

  get gridSize() {
    return (this.stream.my.height + this.stream.my.width) / (20 - this.index);
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
      const r = this.g.rect(this.strutWidth,this.gridSize - this.shelfHeight/4);
      r.move(x, height + this.shelfHeight/2);

      const two = Math.random() > 0.8;
      // box
      this.makeBox(height, x, lastX, two);
      if (two) {
        this.makeBox(height, x, lastX, two, true);
      }
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

    const boxWidth = availWidth - (leftGap + rightGap);
    if (boxWidth < 5) {
      return;
    }
    const box = this.g.rect(
      boxWidth,
      availHeight - topGap
    );
    box.move(
      lastX + this.strutWidth + leftGap,
      height + this.shelfHeight + topGap
    );
  }

  remove() {
    if (this.g) {
      this.g.remove();
    }
    if (this.si) {
      clearInterval(this.si);
    }
  }

  update(stream) {
    this.g.clear();
    this.init();
  }
}
