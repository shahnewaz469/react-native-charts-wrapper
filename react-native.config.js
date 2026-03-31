module.exports = {
  dependency: {
    platforms: {
      android: {
        packageImportPath: 'import com.github.wuxudong.rncharts.MPAndroidChartPackage;',
        packageInstance: 'new MPAndroidChartPackage()',
      },
      ios: {
        podspecPath: './react-native-charts-wrapper.podspec',
      },
    },
  },
};
