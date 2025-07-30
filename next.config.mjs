/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'], // 이미지 호스팅 서비스
  },
}

export default nextConfig
