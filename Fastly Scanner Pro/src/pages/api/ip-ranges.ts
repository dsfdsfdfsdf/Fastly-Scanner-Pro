import type { NextApiRequest, NextApiResponse } from "next";

const FALLBACK_RANGES = [
    "23.235.32.0/20", "43.249.72.0/22", "103.244.50.0/24",
    "103.245.222.0/23", "103.245.224.0/24", "104.156.80.0/20",
    "140.248.64.0/18", "140.248.128.0/17", "146.75.0.0/17",
    "151.101.0.0/16", "157.52.64.0/18", "167.82.0.0/17",
    "167.82.128.0/20", "167.82.160.0/20", "167.82.224.0/20",
    "172.111.64.0/18", "185.31.16.0/22", "199.27.72.0/21",
    "199.232.0.0/16",
];

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("https://api.fastly.com/public-ip-list", {
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json() as { addresses: string[] };
        if (data.addresses && data.addresses.length > 0) {
            res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");
            return res.status(200).json(data.addresses);
        }
        throw new Error("Empty addresses array");
    } catch (error) {
        console.error("Error fetching Fastly IP ranges, using fallback:", error);
        res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
        return res.status(200).json(FALLBACK_RANGES);
    }
}
