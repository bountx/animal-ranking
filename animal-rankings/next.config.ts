/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'yzqzdvfqczmwdsbcbihx.supabase.co',
                port: '', // Leave empty if the server doesn't specify a port
                pathname: '/storage/v1/object/public/animal_photos/**', // Match the path pattern for your Supabase storage
            },
        ], domains: ['yzqzdvfqczmwdsbcbihx.supabase.co'],

    },
};

module.exports = nextConfig;
