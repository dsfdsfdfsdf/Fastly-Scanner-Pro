import Head from "next/head";
import React from "react";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonical?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = "Scanner Pro | Fastly Optimizer",
    description = "High-performance IP discovery and latency analysis for the Fastly network. Find the fastest Fastly nodes with ease.",
    keywords = "Fastly, IP Scanner, Network Optimizer, Latency Test, Fastly Speed Test, mehdisedighinasab",
    ogImage = "/og-image.png", // Assuming an image exists or will be added
    ogType = "website",
    canonical = "https://yourdomain.com",
}) => {
    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="theme-color" content="#ff0062" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />

            {/* Canonical */}
            <link rel="canonical" href={canonical} />

            {/* Favicon */}
            <link rel="icon" type="image/png" href="/favicon.png" />
        </Head>
    );
};

export default SEO;
