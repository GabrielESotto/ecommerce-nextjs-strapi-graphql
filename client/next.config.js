/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')
const isProd = process.env.NODE_ENV === 'production'

module.exports = withPWA({
  pwa: {
    dest: 'public',
    disable: !isProd
  }
})

const nextConfig = {
  reactStrictMode: false,
  compiler: {
    styledComponents: true
  }
}

module.exports = nextConfig
