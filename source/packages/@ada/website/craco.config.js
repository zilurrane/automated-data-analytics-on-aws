/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0 */
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CracoAlias = require('craco-alias');

// Override create-react-app default webpack config to transpile all @ada/ packages depended upon, not just @ada/website
module.exports = {
  eslint: {
    // prevent "craco:  *** Cannot find ESLint plugin (ESLintWebpackPlugin). ***" since we already do linting
    enable: false,
  },
  plugins: [
    {
      // https://github.com/risenforces/craco-alias
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.aliases.json',
      },
    },
  ],
  webpack: {
    configure: (webpackConfig) => ({
      ...webpackConfig,
      plugins: [
        ...webpackConfig.plugins,
        new BundleAnalyzerPlugin({
          analyzerMode: process.env.BUNDLE_ANALYZER_MODE || 'disabled',
        }),
      ],
      resolve: {
        ...webpackConfig.resolve,
        alias: {
          ...(webpackConfig.resolve || {}).alias,
          'ajv': path.resolve(__dirname, 'src/overrides/ajv'),
        }
      },
      module: {
        ...webpackConfig.module,
        rules: [
          ...webpackConfig.module.rules.map((rule) => {
            if (!rule.oneOf) return rule;
            return {
              ...rule,
              oneOf: rule.oneOf.map((ruleObject) => {
                if (!new RegExp(ruleObject.test).test('.ts') || !ruleObject.include) return ruleObject;
                return { ...ruleObject, include: path.resolve(__dirname, '..') };
              }),
            };
          }),
        ],
      },
    }),
  },
};
