const { withProjectBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const JITPACK_MAVEN = "        maven { url 'https://www.jitpack.io' }";

function withRNChartsWrapper(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('jitpack.io')) {
      return config;
    }

    // Add JitPack after mavenCentral() inside allprojects.repositories
    config.modResults.contents = config.modResults.contents.replace(
      /(allprojects\s*\{[\s\S]*?repositories\s*\{[\s\S]*?mavenCentral\(\))/,
      `$1\n${JITPACK_MAVEN}`
    );

    return config;
  });
}

module.exports = createRunOncePlugin(
  withRNChartsWrapper,
  'react-native-charts-wrapper',
  '1.0.0'
);
