// NFC API service functions for interfacing with the FastAPI backend

const BASE_URL = 'http://192.168.0.171:8000';

// Request/Response types matching the FastAPI models
export interface WriteHexRequest {
  hex_string: string;
}

export interface ReadHexResponse {
  uid: string;
  hex_data: string;
  total_bytes: number;
  successful_blocks: number;
  message: string;
}

export interface WriteHexResponse {
  uid: string;
  hex_string: string;
  total_bytes: number;
  total_blocks: number;
  message: string;
}

export interface CreateItemRequest {
  name: string;
  price: number;
  id?: string;
}

export interface ItemResponse {
  id: string;
  name: string;
  price: number;
}

export interface CreateItemResponse {
  id: string;
  name: string;
  price: number;
  message: string;
}

export interface CreatePkRequest {
  // Add any required fields for create-pk endpoint
  [key: string]: any;
}

export interface CreatePkResponse {
  private_key?: string;
  public_key?: string;
  address?: string;
  uid?: string;
  message: string;
  [key: string]: any;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

// API service class
export class NFCApiService {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Helper method for making API requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.error || errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Get API information
  async getApiInfo() {
    return this.makeRequest('/');
  }

  // Read hex data from NFC tag
  async readHexFromNFC(): Promise<ReadHexResponse> {
    return this.makeRequest<ReadHexResponse>('/read-pk');
  }

  // Write hex data to NFC tag
  async writeHexToNFC(hexString: string): Promise<WriteHexResponse> {
    return this.makeRequest<WriteHexResponse>('/write-pk', {
      method: 'POST',
      body: JSON.stringify({ hex_string: hexString }),
    });
  }

  // Create item and write to NFC tag
  async createItem(itemData: CreateItemRequest): Promise<CreateItemResponse> {
    return this.makeRequest<CreateItemResponse>('/create-item', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  // Read item data from NFC tag
  async readItemFromNFC(): Promise<ItemResponse> {
    return this.makeRequest<ItemResponse>('/read-items');
  }

  // Create private key card
  async createPkCard(data?: CreatePkRequest): Promise<CreatePkResponse> {
    return this.makeRequest<CreatePkResponse>('/create-pk', {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Utility method to convert string to hex
  static stringToHex(str: string): string {
    return str
      .split('')
      .map((char: string) => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  // Utility method to convert hex to string
  static hexToString(hex: string): string {
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    }
    return result;
  }

  // Utility method to validate hex string
  static isValidHex(hex: string): boolean {
    return /^[0-9a-fA-F]*$/.test(hex) && hex.length % 2 === 0;
  }
}

// Export a default instance
export const nfcApi = new NFCApiService();
