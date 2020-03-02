import React, { PureComponent } from "react";
import _ from 'lodash';

export default class Factory extends PureComponent {
  constructor(props) {
    super(props);
    this.stream = props.stream;
    this.state = props.stream.value;
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.stream.do.setEle(this.ref.current);
    this._sub = this.stream.subscribe(
      stream => this.setState(stream.value),
      e => console.error(e)
    );
  }

  componentWillUnmount() {
    this._sub.unsubscribe();
  }

  render() {
    return <div ref={this.ref} className="fullscreen" >
    </div>;
  }
}
