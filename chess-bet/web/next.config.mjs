/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // thirdweb → Base Account → Coinbase CDP SDK тянет необязательные модули x402 (платежи),
    // которые нам не нужны и не установлены. Заменяем их пустыми заглушками, чтобы сборка проходила.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/core": false,
      "@x402/evm": false,
      "@x402/svm": false,
    };
    return config;
  },
};
export default nextConfig;