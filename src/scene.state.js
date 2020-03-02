import {ValueStream} from "@wonderlandlabs/looking-glass-engine";
import SVG from "svg.js";
import Shelf from "./Shelf";
import _ from 'lodash';

const PHASE = 12000;

export default ({size}) => {
  const width = _.get(size, 'width', 100);
  const height = _.get(size, 'height', 100);
  return new ValueStream("sceneManager")
    .property("size", size || {width: 100, height: 100})
    .property("width", width || 100, "number")
    .property("height", height || 100, "number")
    .property("ele", null)
    .property("svg", null)
    .watchFlat("ele", (s, e) => {
      console.log("ele set to ", e);
      if (e && s.my.width > 100 && s.my.height > 100) {
        console.log("ele set to ", e);
        s.do.tryInit();
      }
    })
    .method(
      "tryInit",
      s => {
        console.log("---- tryInit");
        if (s.my.init) {
          return;
        }

        if (!(s.my.ele && s.my.width > 100 && s.my.height > 100)) {
          console.log("init aborted - bad state");
          return;
        }

        const svg = SVG(s.my.ele);
        s.do.setSvg(svg);
        console.log("svg is ", svg);
        s.do.draw(true);
        s.do.setInit(true);
      },
      true
    )
    .property("init", false, "boolean")
    .property("layers", [], "array")
    .property("active", true, "boolean")
    .property('cycleStart', Date.now())
    .method("cycle", (s) => {
      if (!s.my.active) {
        console.log('ending cycle');
        return;
      }
      const value = 100 * ( (Date.now() - s.my.cycleStart) % PHASE) / PHASE;
      try {
        s.my.layers.forEach(shelf => shelf.cycle(value));
      } catch (err) {
        console.log("error in shelf cycle: ", err);
      }
      requestAnimationFrame(s.do.cycle);
    })
    .method("draw", (s, init) => {
      console.log("---- draw", init);
      if (!s.my.svg) {
        return;
      }
      try {
        if (init) {
          s.my.layers.forEach(lg => lg.remove());
          s.do.setLayers([
            new Shelf(s, 0),
            new Shelf(s, 1),
            new Shelf(s, 2),
            new Shelf(s, 3),
            new Shelf(s, 4),
            new Shelf(s, 5),
            new Shelf(s, 6),
            new Shelf(s, 7),
            new Shelf(s, 8),
          ]);
        } else {
          s.my.layers.forEach(layer => {
            layer.update(s);
          });
        }
      } catch (err) {
        console.log("draw error: ", err);
      }
    })
    .on("resize", s => {
      if (!s.my.init) {
        s.do.tryInit();
      }
      s.do.draw();
    })
    .watchFlat("size", "onSize")
    .method(
      "onSize",
      (s, size) => {
        if (!(size && typeof size === "object")) {
          return;
        }
        try {
          const {width, height} = size;
          if (typeof width === "number") {
            s.do.setWidth(width);
          }
          if (typeof height === "number") {
            s.do.setHeight(height);
          }
          s.emit("resize", size);
        } catch (err) {
          console.log("error in onSize: ", err);
        }
      },
      true
    );
};
