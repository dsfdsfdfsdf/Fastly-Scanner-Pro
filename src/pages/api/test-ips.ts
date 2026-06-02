import type { NextApiRequest, NextApiResponse } from "next";
import http from "http";

type IPResult = {
    ip: string;
    latency: number;
    valid: boolean;
};

function testSingleIP(ip: string, timeout: number): Promise<IPResult> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const req = http.get(
            {
                hostname: ip,
                port: 80,
                path: "/",
                timeout: timeout,
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    Host: "www.fastly.com",
                },
            },
            (res) => {
                const latency = Date.now() - startTime;
                const serverHeader = res.headers["server"] || "";
                const servedBy = res.headers["x-served-by"] || "";
                const via = res.headers["via"] || "";
                const cache = res.headers["x-cache"] || "";

                const isFastly =
                    String(serverHeader).toLowerCase().includes("fastly") ||
                    String(servedBy).startsWith("cache-") ||
                    String(via).toLowerCase().includes("fastly") ||
                    !!String(cache).match(/HIT|MISS/);


                resolve({ ip, latency, valid: isFastly });
            }
        );

        req.on("error", () => {
            resolve({ ip, latency: 9999, valid: false });
        });

        req.on("timeout", () => {
            req.destroy();
            resolve({ ip, latency: 9999, valid: false });
        });
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { ips, timeout = 3000 } = req.body as {
        ips: string[];
        timeout?: number;
    };

    if (!ips || !Array.isArray(ips) || ips.length === 0) {
        return res.status(400).json({ error: "No IPs provided" });
    }

    // Limit server-side batch size to 20 to prevent overwhelming the server
    const batch = ips.slice(0, 20);

    const results = await Promise.all(
        batch.map((ip) => testSingleIP(ip, timeout))
    );

    return res.status(200).json(results);
}
