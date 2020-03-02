import React, {PureComponent} from "react";
import "./styles.css";
import Factory from "./Factory";
import {withSize} from 'react-sizeme'
import _ from 'lodash';

import stateFactory from "./scene.state";

class App extends PureComponent {

  constructor(props) {
    console.log('app created');
    super(props);
    this.stream = stateFactory(props);
    this.state = this.stream.value;
    console.log('made app');
  }

  componentDidMount() {
    this.mounted = true;
    this._sub = this.stream.subscribe((s) => {
      if (this.mounted) {
        this.setState(s.value);
      }
    }, (e) => {
      console.log('error in stream', e);
    });

    this.stream.do.cycle(0);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps) {
    console.log('component updated with ', prevProps, 'to', this.props);
    const size = _.get(this, 'props.size');
    if (!size) return;
    if (
      (_.get(size, 'width') !== _.get(prevProps, 'size.width')) ||
      (_.get(size, 'height') !== _.get(prevProps, 'size.height'))) {
      this.stream.do.setSize(size);
    }
  }

  render() {

    return (
      <div className="App">
        <Factory stream={this.stream}/>
      </div>)
  }
}

export default withSize({monitorHeight: true, monitorWidth: true})(App)
