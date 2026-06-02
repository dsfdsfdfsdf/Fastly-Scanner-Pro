import { rangeToIpArray } from "~/helpers/rangeToIpArray";

export const getAllIPRanges = async (): Promise<string[]> => {
  try {
    const response = await fetch('https://api.fastly.com/public-ip-list');
    if (!response.ok) {
      throw new Error(`Failed to fetch IP ranges: ${response.status} ${response.statusText}`);
    }
    const data = await response.json() as { addresses: string[] };
    return data.addresses || [];
  } catch (error) {
    console.error('Error fetching Fastly IP ranges:', error);
    return [];
  }
};

// Export a function to generate a specified number of random IPs from the Fastly ranges
export const generateRandomIPs = async (count: number = 1000): Promise<string[]> => {
  try {
    const ipRanges = await getAllIPRanges();
    
    // Randomly select ranges to sample from
    const selectedRanges = ipRanges.sort(() => 0.5 - Math.random()).slice(0, Math.min(count / 10, ipRanges.length));
    
    const result: string[] = [];
    
    for (const range of selectedRanges) {
      const parts = range.split('/');
      if (parts.length !== 2) continue;
      
      const baseIPStr = parts[0];
      const maskStr = parts[1];
      
      if (!baseIPStr || !maskStr) continue;
      
      const mask = parseInt(maskStr, 10);
      
      if (isNaN(mask)) continue;
      
      if (baseIPStr.includes(':')) continue; // Skip IPv6 for random generation
      
      // Calculate the number of IPs in this subnet
      const numIPsInSubnet = Math.pow(2, 32 - mask);
      
      // Generate random IPs within this range
      const ipsToGenerate = Math.min(Math.floor(count / selectedRanges.length) + 1, 256);
      
      for (let i = 0; i < ipsToGenerate && result.length < count; i++) {
        const randomOffset = Math.floor(Math.random() * Math.min(numIPsInSubnet, 65536));
        const baseIPParts = baseIPStr.split('.').map(Number);
        
        if (baseIPParts.length !== 4 || baseIPParts.some(isNaN)) continue;
        
        const [octet1, octet2, octet3, octet4] = baseIPParts as [number, number, number, number];
        const baseIPNum = (octet1 << 24) + (octet2 << 16) + (octet3 << 8) + octet4;
        const newIPNum = baseIPNum + randomOffset;
        const newIP = [
          (newIPNum >> 24) & 255,
          (newIPNum >> 16) & 255,
          (newIPNum >> 8) & 255,
          newIPNum & 255
        ].join('.');
        
        result.push(newIP);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error generating random IPs:', error);
    return [];
  }
};

// Export a function to get all IPs that fetches from Fastly's URL
// NOTE: This function can be very slow and memory-intensive with full ranges
export const getAllIps = async (): Promise<string[]> => {
  try {
    const ipRanges = await getAllIPRanges();
    
    const limitedRanges = ipRanges.filter(range => {
      const parts = range.split('/');
      if (parts.length !== 2) return false;
      const baseIP = parts[0];
      const maskStr = parts[1];
      if (!baseIP || !maskStr) return false;
      const mask = parseInt(maskStr, 10);
      if (isNaN(mask)) return false;
      return mask >= 24;
    });
    
    return limitedRanges.flatMap(range => rangeToIpArray(range));
  } catch (error) {
    console.error('Error fetching IP ranges:', error);
    // Return empty array if fetch fails, since user wants no hardcoded IPs
    return [];
  }
};
