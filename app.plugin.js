const { withProjectBuildGradle, withSettingsGradle, createRunOncePlugin } = require('@expo/config-plugins');

const JITPACK_MAVEN = `        maven { url 'https://www.jitpack.io' }`;

/**
 * Modern Expo (SDK 50+ / RN 0.71+) uses dependencyResolutionManagement
 * in settings.gradle instead of allprojects.repositories in build.gradle.
 * We try settings.gradle first, then fall back to build.gradle.
 */
function withRNChartsWrapper(config) {
  // Step 1: Inject into settings.gradle (modern Expo / RN 0.71+)
  config = withSettingsGradle(config, (config) => {
    if (config.modResults.contents.includes('jitpack.io')) {
      return config;
    }
    // Insert after mavenCentral() inside dependencyResolutionManagement { repositories { ... } }
    config.modResults.contents = config.modResults.contents.replace(
      /(\bmavenCentral\(\))/,
      `$1\n${JITPACK_MAVEN}`
    );
    return config;
  });

  // Step 2: Also inject into build.gradle (older RN / allprojects pattern)
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('jitpack.io')) {
      return config;
    }
    config.modResults.contents = config.modResults.contents.replace(
      /(\bmavenCentral\(\))/,
      `$1\n${JITPACK_MAVEN}`
    );
    return config;
  });

  return config;
}

module.exports = createRunOncePlugin(
  withRNChartsWrapper,
  'react-native-charts-wrapper',
  '1.0.0'
);
