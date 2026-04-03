/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/sky-pup-rescue-quest" : "",
};
export default nextConfig;
