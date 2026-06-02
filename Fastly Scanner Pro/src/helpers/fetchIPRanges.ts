async function fetchIPRanges(): Promise<string[]> {
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
}

export default fetchIPRanges;