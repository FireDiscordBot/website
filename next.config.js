// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  experimental: {
    swcFileReading: false,
  },
  async redirects() {
    return [
      {
        source: "/user",
        destination: "/user/account",
        permanent: true,
      },
    ]
  },
})
