/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Title is static; streaming metadata only causes a flash of the URL in the tab on navigation.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
