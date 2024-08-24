/** @type {import('next').NextConfig} */

const nextConfig = {
    // // Works, but need to replace with serverExternalPackages later
    // webpack: (
    //     config,
    //     { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
    // ) => {
    //     // add externals
    //     config.externals = config.externals || [];
    //     config.externals.push(
    //         "puppeteer-extra",
    //         "puppeteer-extra-plugin-stealth",
    //         "puppeteer-extra-plugin-adblocker",
    //         "puppeteer-extra-plugin-block-resources",
    //         "turndown",
    //     );

    //     return config;
    // },
    experimental: {
        serverComponentsExternalPackages: [
            'puppeteer',
            'puppeteer-extra',
            'puppeteer-extra-plugin-stealth',
        ],
        serverMinification: false, // required by DEFER platform
    },
};

export default nextConfig;
