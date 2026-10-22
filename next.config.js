/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // headers() removed - not supported in static export, configure in firebase.json instead
};

module.exports = nextConfig;
