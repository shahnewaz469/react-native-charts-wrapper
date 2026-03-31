import PropTypes from 'prop-types';
import React from 'react';
import {
  requireNativeComponent
} from 'react-native';

import BarLineChartBase from './BarLineChartBase';
import {candleData} from './ChartDataConfig';
import MoveEnhancer from './MoveEnhancer'
import ScaleEnhancer from "./ScaleEnhancer";
import HighlightEnhancer from "./HighlightEnhancer";
import ScrollEnhancer from "./ScrollEnhancer";

class CandleStickChart extends React.Component {
  getNativeComponentName() {
    return 'RNCandleStickChart'
  }

  getNativeComponentRef() {
    return this.nativeComponentRef
  }

  render() {
    return <RNCandleStickChart {...this.props} ref={ref => this.nativeComponentRef = ref} />;
  }

}

CandleStickChart.propTypes = {
  ...BarLineChartBase.propTypes,

  data: candleData
};

var RNCandleStickChart = requireNativeComponent('RNCandleStickChart');

export default ScrollEnhancer(HighlightEnhancer(ScaleEnhancer(MoveEnhancer(CandleStickChart))))
