const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer({
  images: {
    loader: "imgix",
    // cf pages uses "next export" which requires a loader when using next/image
    // so all images have a fake loader and optimizations disabled but apparently you
    // need to set something here too so fuck you have this random loader that will do nothing
  },
})
