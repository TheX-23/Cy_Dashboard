interface LocationData {
  lat: number;
  lng: number;
  country: string;
  city: string;
  region: string;
  isp: string;
  timezone: string;
}

interface GeolocationResponse {
  success: boolean;
  data?: LocationData;
  error?: string;
}

// Mock IP geolocation service (in production, use real API like ipapi.co, IPinfo, or MaxMind)
export class GeolocationService {
  private static cache = new Map<string, LocationData>();
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Mock IP location database
  private static readonly mockDatabase = new Map<string, LocationData>([
    ['203.0.113.42', { lat: 39.9042, lng: 116.4074, country: 'China', city: 'Beijing', region: 'Beijing Municipality', isp: 'China Telecom', timezone: 'Asia/Shanghai' }],
    ['172.16.0.1', { lat: 55.7558, lng: 37.6173, country: 'Russia', city: 'Moscow', region: 'Moscow Oblast', isp: 'Rostelecom', timezone: 'Europe/Moscow' }],
    ['189.4.128.45', { lat: -23.5505, lng: -46.6333, country: 'Brazil', city: 'São Paulo', region: 'São Paulo', isp: 'Telefonica Brazil', timezone: 'America/Sao_Paulo' }],
    ['103.21.244.10', { lat: 28.6139, lng: 77.2090, country: 'India', city: 'New Delhi', region: 'Delhi', isp: 'Reliance Jio', timezone: 'Asia/Kolkata' }],
    ['172.217.12.5', { lat: 34.0522, lng: -118.2437, country: 'United States', city: 'Los Angeles', region: 'California', isp: 'AT&T Services', timezone: 'America/Los_Angeles' }],
    ['46.4.23.78', { lat: 52.5200, lng: 13.4050, country: 'Germany', city: 'Berlin', region: 'Berlin', isp: 'Deutsche Telekom', timezone: 'Europe/Berlin' }],
    ['192.168.1.100', { lat: 40.7128, lng: -74.0060, country: 'United States', city: 'New York', region: 'New York', isp: 'Verizon Communications', timezone: 'America/New_York' }],
    ['10.0.0.50', { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', city: 'London', region: 'England', isp: 'BT Group', timezone: 'Europe/London' }],
    ['203.0.113.10', { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo', region: 'Kanto', isp: 'NTT Communications', timezone: 'Asia/Tokyo' }],
    ['192.168.2.1', { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney', region: 'New South Wales', isp: 'Telstra Corporation', timezone: 'Australia/Sydney' }],
  ]);

  static async getLocationFromIP(ip: string): Promise<GeolocationResponse> {
    try {
      // Check cache first
      const cached = this.cache.get(ip);
      if (cached) {
        return { success: true, data: cached };
      }

      // Try mock database first
      const mockLocation = this.mockDatabase.get(ip);
      if (mockLocation) {
        this.cache.set(ip, mockLocation);
        return { success: true, data: mockLocation };
      }

      // Generate realistic mock data for unknown IPs
      const mockData = this.generateMockLocation(ip);
      this.cache.set(ip, mockData);
      
      return { success: true, data: mockData };
    } catch (error) {
      return { success: false, error: 'Failed to geolocate IP' };
    }
  }

  private static generateMockLocation(ip: string): LocationData {
    const locations = [
      { lat: 40.7128, lng: -74.0060, country: 'United States', city: 'New York', region: 'New York', isp: 'Verizon', timezone: 'America/New_York' },
      { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', city: 'London', region: 'England', isp: 'BT', timezone: 'Europe/London' },
      { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris', region: 'Île-de-France', isp: 'Orange', timezone: 'Europe/Paris' },
      { lat: 52.5200, lng: 13.4050, country: 'Germany', city: 'Berlin', region: 'Berlin', isp: 'Deutsche Telekom', timezone: 'Europe/Berlin' },
      { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo', region: 'Kanto', isp: 'NTT', timezone: 'Asia/Tokyo' },
      { lat: 37.5665, lng: 126.9780, country: 'South Korea', city: 'Seoul', region: 'Seoul', isp: 'KT', timezone: 'Asia/Seoul' },
      { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore', region: 'Central', isp: 'Singtel', timezone: 'Asia/Singapore' },
      { lat: -23.5505, lng: -46.6333, country: 'Brazil', city: 'São Paulo', region: 'São Paulo', isp: 'Telefonica', timezone: 'America/Sao_Paulo' },
      { lat: 19.4326, lng: -99.1332, country: 'Mexico', city: 'Mexico City', region: 'Mexico City', isp: 'Telcel', timezone: 'America/Mexico_City' },
      { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney', region: 'New South Wales', isp: 'Telstra', timezone: 'Australia/Sydney' },
    ];

    return locations[Math.floor(Math.random() * locations.length)];
  }

  static async batchGeolocate(ips: string[]): Promise<Map<string, LocationData>> {
    const results = new Map<string, LocationData>();
    
    for (const ip of ips) {
      const response = await this.getLocationFromIP(ip);
      if (response.success && response.data) {
        results.set(ip, response.data);
      }
    }
    
    return results;
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheSize(): number {
    return this.cache.size;
  }
}

// In production, replace with real API calls:
/*
export class RealGeolocationService {
  private static readonly API_KEY = process.env.IPAPI_API_KEY;
  private static readonly BASE_URL = 'https://api.ipapi.com';

  static async getLocationFromIP(ip: string): Promise<GeolocationResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${ip}?access_key=${this.API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        return { success: false, error: data.error.info };
      }

      const locationData: LocationData = {
        lat: data.latitude,
        lng: data.longitude,
        country: data.country_name,
        city: data.city,
        region: data.region,
        isp: data.org,
        timezone: data.timezone.id
      };

      return { success: true, data: locationData };
    } catch (error) {
      return { success: false, error: 'Failed to fetch IP location' };
    }
  }
}
*/
