import PropTypes from 'prop-types';
import React from 'react';
import {
  requireNativeComponent
} from 'react-native';
import ScrollEnhancer from "./ScrollEnhancer";

import BarLineChartBase from './BarLineChartBase';
import {bubbleData} from './ChartDataConfig';
import MoveEnhancer from './MoveEnhancer'
import ScaleEnhancer from "./ScaleEnhancer";
import HighlightEnhancer from "./HighlightEnhancer";

class BubbleChart extends React.Component {
  getNativeComponentName() {
    return 'RNBubbleChart'
  }

  getNativeComponentRef() {
    return this.nativeComponentRef
  }

  render() {
    return <RNBubbleChart {...this.props} ref={ref => this.nativeComponentRef = ref} />;
  }
}

BubbleChart.propTypes = {
  ...BarLineChartBase.propTypes,

  data: bubbleData
};

var RNBubbleChart = requireNativeComponent('RNBubbleChart')

export default ScrollEnhancer(HighlightEnhancer(ScaleEnhancer(MoveEnhancer(BubbleChart))))

