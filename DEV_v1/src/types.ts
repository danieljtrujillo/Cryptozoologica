export interface Cryptid {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
  location: string;
  habitat: string;
  status: 'confirmed' | 'unconfirmed' | 'mythical' | 'extinct';
  imageUrl?: string;
  lastSighting?: string;
  tags: string[];
}

export interface Observation {
  id: string;
  userId: string;
  cryptidName: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  timestamp: any;
  imageUrl?: string;
  videoUrl?: string;
}
