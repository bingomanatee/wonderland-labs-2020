import React, { useState, useEffect } from "react";
import "./styles.css";
import Factory from "./Factory";
import ReactResizeDetector from "react-resize-detector";
// ...
import stateFactory from "./scene.state";
export default function App(props) {
  const [sub, setSub] = useState(false);
  const [stream] = useState(stateFactory(props)); // note - stream is never re-created,
  // no need for a set function
  useEffect(sub => {
    setSub(
      stream.subscribe(
        stream => {},
        err => {
          console.log("error in stream:", err);
        }
      )
    );
    console.log("initial stream setting from props:", props);
    stream.do.cycle();
  }, []);

  useEffect(() => () => {
    if (sub) {
      stream.do.setActive(false);
      sub.unsubscribe();
    }
  });

  useEffect(() => {
    console.log("watching change in width, height:", props);
    if (typeof props.width === "number" && typeof props.height === "number")
      console.log("wh watcher reading ", props);
    stream.do.setSize({ width: props.width, height: props.height });
  }, ["width", "height"]);

  return (
    <div className="App">
      <Factory stream={stream} />
      <ReactResizeDetector
        handleWidth
        handleHeight
        onResize={(width, height) => {
          console.log("resized as ", width, height);
          stream.do.setSize({ width, height });
        }}
      />
    </div>
  );
}
