const {
  withProjectBuildGradle,
  withSettingsGradle,
  withMainApplication,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const JITPACK_MAVEN = `        maven { url 'https://www.jitpack.io' }`;
const RN_CHARTS_IMPORT_JAVA = 'import com.github.wuxudong.rncharts.MPAndroidChartPackage;';
const RN_CHARTS_IMPORT_KOTLIN = 'import com.github.wuxudong.rncharts.MPAndroidChartPackage';

function addImport(contents, importLine, anchorImport) {
  if (contents.includes(importLine)) {
    return contents;
  }
  if (anchorImport && contents.includes(anchorImport)) {
    return contents.replace(anchorImport, `${anchorImport}\n${importLine}`);
  }
  return contents.replace(/^package\s+.+$/m, (match) => `${match}\n\n${importLine}`);
}

function patchMainApplicationKotlin(contents) {
  if (contents.includes('MPAndroidChartPackage()')) {
    return contents;
  }

  contents = addImport(contents, RN_CHARTS_IMPORT_KOTLIN, 'import com.facebook.react.ReactPackage');

  if (contents.includes('PackageList(this).packages.apply {')) {
    return contents.replace(
      'PackageList(this).packages.apply {\n',
      'PackageList(this).packages.apply {\n          if (none { it is MPAndroidChartPackage }) {\n            add(MPAndroidChartPackage())\n          }\n'
    );
  }

  if (contents.includes('val packages = PackageList(this).packages') && contents.includes('return packages')) {
    return contents.replace(
      'return packages',
      'if (packages.none { it is MPAndroidChartPackage }) {\n      packages.add(MPAndroidChartPackage())\n    }\n    return packages'
    );
  }

  return contents;
}

function patchMainApplicationJava(contents) {
  if (contents.includes('new MPAndroidChartPackage()')) {
    return contents;
  }

  contents = addImport(contents, RN_CHARTS_IMPORT_JAVA, 'import com.facebook.react.ReactPackage;');

  if (contents.includes('List<ReactPackage> packages = new PackageList(this).getPackages();')) {
    return contents.replace(
      'List<ReactPackage> packages = new PackageList(this).getPackages();',
      `List<ReactPackage> packages = new PackageList(this).getPackages();\n    boolean hasRNCharts = false;\n    for (ReactPackage pkg : packages) {\n      if (pkg instanceof MPAndroidChartPackage) {\n        hasRNCharts = true;\n        break;\n      }\n    }\n    if (!hasRNCharts) {\n      packages.add(new MPAndroidChartPackage());\n    }`
    );
  }

  return contents;
}

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

  // Step 3: Add a fallback manual package registration for Expo CNG + New Architecture,
  // in case Android autolinking misses this dependency in some install modes.
  config = withMainApplication(config, (config) => {
    if (config.modResults.language === 'java') {
      config.modResults.contents = patchMainApplicationJava(config.modResults.contents);
    } else {
      config.modResults.contents = patchMainApplicationKotlin(config.modResults.contents);
    }
    return config;
  });

  return config;
}

module.exports = createRunOncePlugin(
  withRNChartsWrapper,
  'react-native-charts-wrapper',
  '1.1.0'
);
