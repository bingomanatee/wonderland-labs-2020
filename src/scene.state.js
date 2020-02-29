import { ValueStream } from "@wonderlandlabs/looking-glass-engine";
import SVG from "svg.js";

export default ({ size, width, height }) => {
  return new ValueStream("sceneManager")
    .property("size", size || { width: 100, height: 100 })
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
        if (s.my.init) return;

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
    .method("draw", (s, init) => {
      console.log("---- draw", init);
      if (!s.my.svg) return;
      try {
        if (init) {
          s.my.layers.forEach(lg => lg.remove());
          s.do.setLayers([]);
          const g = s.my.svg.group();
          const r1 = g
            .rect()
            .attr("radius", 20)
            .attr("fill", "black")
            .attr("width", s.my.width * 0.4)
            .attr("height", s.my.height * 0.4)
            .move(s.my.width * 0.1, s.my.height * 0.1);
          const t = g.text("width: " + s.my.width).attr("fill", "red");
          const r2 = g
            .rect()
            .attr("radius", 20)
            .attr("fill", "black")
            .attr("width", s.my.width * 0.4)
            .attr("height", s.my.height * 0.4)
            .move(s.my.width * 0.5, s.my.height * 0.5);
          s.my.layers.push({ g, r1, r2, t });
        } else {
          s.my.layers.forEach(({ g, r1, r2, t }) => {
            if (r1) {
              r1.move(s.my.width * 0.1, s.my.height * 0.1).size(
                s.my.width * 0.4,
                s.my.height * 0.4
              );
            }
            if (r2) {
              r2.move(s.my.width * 0.5, s.my.height * 0.5).size(
                s.my.width * 0.4,
                s.my.height * 0.4
              );
            }
            if (t) t.text("width: " + s.my.width);
          });
        }
      } catch (err) {
        console.log("draw error: ", err);
      }
    })
    .on("resize", s => {
      if (!s.my.init) s.do.tryInit();
      s.do.draw();
    })
    .watchFlat("size", "onSize")
    .method(
      "onSize",
      (s, size) => {
        if (!(size && typeof size === "object")) return;
        try {
          const { width, height } = size;
          if (typeof width === "number") s.do.setWidth(width);
          if (typeof height === "number") s.do.setHeight(height);
          s.emit("resize", size);
        } catch (err) {
          console.log("error in onSize: ", err);
        }
      },
      true
    );
};
