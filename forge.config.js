const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    icon: './images/favicon', // Windows icon
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Muhammad Ahmad Hamid',
        description: 'DocAssist - Your ultimate document management solution',
        icon: './images/favicon.ico', // Windows icon
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        authors: 'Muhammad Ahmad Hamid',
        description: 'DocAssist - Your ultimate document management solution',
        icon: './images/logo.png', // Windows icon

      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        authors: 'Muhammad Ahmad Hamid',
        description: 'DocAssist - Your ultimate document management solution',
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {
        authors: 'Muhammad Ahmad Hamid',
        description: 'DocAssist - Your ultimate document management solution',
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
