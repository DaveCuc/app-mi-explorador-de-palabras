import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.10.50", "localhost", "127.0.0.1", "0.0.0.0"],
};

export default nextConfig;
