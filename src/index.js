import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import ReactResizeDetector from "react-resize-detector";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <ReactResizeDetector handleWidth handleHeight>
    {props => <App {...props} />}
  </ReactResizeDetector>,
  rootElement
);
