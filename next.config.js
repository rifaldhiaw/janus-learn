/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    return {
      ...config,
      plugins: [
        ...config.plugins,
        new webpack.ProvidePlugin({ adapter: ["webrtc-adapter", "default"] }),
      ],
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: require.resolve("janus-gateway"),
            loader: "exports-loader",
            options: {
              exports: "Janus",
            },
          },
        ],
      },
    };
  },
};
