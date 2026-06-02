import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const filename = path.join(dirname, "./consts/ip-ranges.json");

const isValidCIDR = (cidr) => {
  const parts = cidr.split("/");
  if (parts.length !== 2) return false;
  const [ip, mask] = parts;
  const maskInt = parseInt(mask, 10);
  
  if (ip.includes(".")) {
    return (
      maskInt >= 0 &&
      maskInt <= 32 &&
      ip.split(".").length === 4 &&
      ip.split(".").every((octet) => {
        const num = parseInt(octet, 10);
        return num >= 0 && num <= 255;
      })
    );
  }

  if (ip.includes(":")) {
    return maskInt >= 0 && maskInt <= 128;
  }

  return false;
};

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
};

fetchJson("https://api.fastly.com/public-ip-list")
  .then((data) => {
    const allRanges = (data.addresses || []).filter(isValidCIDR);

    const json = JSON.stringify(allRanges);

    fs.writeFile(filename, json, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`File Updated: ${filename}`);
        console.log(`Total Ranges: ${allRanges.length}`);
      }
    });
  })
  .catch((err) => {
    console.error("Error fetching Fastly IPs:", err);
  });
