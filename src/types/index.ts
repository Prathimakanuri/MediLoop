export interface HealthcareFacility {
  id: string;
  name: string;
  type: string;
  tier: string;
  location: string;
  address: string;
  verified: boolean;
  contactPhone: string;
  contactEmail: string;
  rating: number;
  bedCapacity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  phone?: string | null;
  avatarUrl?: string | null;
  facilityId?: string | null;
  facility?: HealthcareFacility | null;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  _count?: {
    equipment: number;
  };
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  categoryId: string;
  category?: EquipmentCategory;
  providerId: string;
  provider?: HealthcareFacility;
  imageUrl: string;
  gallery?: string;
  description: string;
  pricePerDay: number;
  depositAmount: number;
  location: string;
  distanceKm: number;
  condition: string;
  yearOfManufacture: number;
  availability: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  verified: boolean;
  lastServiceDate: string;
  nextServiceDue: string;
  usageType: string;
  accessories?: string;
  deliveryAvailable: boolean;
  powerRequirements: string;
}

export interface EquipmentRequest {
  id: string;
  equipmentId: string;
  equipment?: Equipment;
  requesterId: string;
  requester?: User;
  providerId: string;
  provider?: HealthcareFacility;
  startDate: string;
  endDate: string;
  totalDays: number;
  estimatedCost: number;
  purpose: string;
  urgency: 'CRITICAL_EMERGENCY' | 'HIGH' | 'STANDARD';
  message?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  booking?: Booking | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  requestId: string;
  request?: EquipmentRequest;
  equipmentId: string;
  equipment?: Equipment;
  requesterId: string;
  requester?: User;
  providerId: string;
  provider?: HealthcareFacility;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
  deposit: number;
  status: 'CONFIRMED' | 'ACTIVE' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  deliveryAddress?: string | null;
  trackingNotes?: string | null;
  handoverDate?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  linkUrl?: string | null;
  createdAt: string;
}
