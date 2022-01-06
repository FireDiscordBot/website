const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = {
  experimental: {
    swcFileReading: false
  }
}

module.exports = withBundleAnalyzer({})
