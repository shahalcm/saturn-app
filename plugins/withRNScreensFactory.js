const { withMainActivity } = require('@expo/config-plugins');

module.exports = (config) => {
  return withMainActivity(config, (modConfig) => {
    let contents = modConfig.modResults.contents;

    // 1. Add the import if not present
    const importCode = 'import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory';
    if (!contents.includes(importCode)) {
      contents = contents.replace(
        'import expo.modules.splashscreen.SplashScreenManager',
        `import expo.modules.splashscreen.SplashScreenManager\n${importCode}`
      );
    }

    // 2. Add supportFragmentManager.fragmentFactory = RNScreensFragmentFactory() inside onCreate before super.onCreate
    const factoryCode = 'supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()';
    if (!contents.includes(factoryCode)) {
      contents = contents.replace(
        'super.onCreate(',
        `${factoryCode}\n    super.onCreate(`
      );
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });
};
