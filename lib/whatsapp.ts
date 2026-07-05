import { apiFetch } from "@/lib/api";

export type ConversationStatus = "PENDING" | "ASSIGNED" | "CLOSED";

export type WhatsAppConversation = {
  id: string;
  storeId: string;
  customerPhone: string;
  customerName?: string;
  vendorId?: string;
  vendorName?: string;
  status: ConversationStatus;
  assignedAt?: string;
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type VendorAvailability = {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  phone: string;
  isAvailable: boolean;
  updatedAt: string;
};

export type BusinessHours = {
  id: string;
  storeId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isActive: boolean;
};

export type WhatsAppConfig = {
  phone?: string;
  isConnected: boolean;
  connectedAt?: string;
  timezone: string;
  closedMessage?: string;
  status: {
    isConnected: boolean;
    connectedAt?: string;
    phone?: string;
  };
  vendors: VendorAvailability[];
  businessHours: BusinessHours[];
};

export type WhatsAppMetrics = {
  total: number;
  pending: number;
  assigned: number;
  closed: number;
  avgResponseTimeMinutes: number;
};

export type VendorPerformance = {
  vendorId: string;
  vendorName: string;
  totalConversations: number;
  avgResponseTimeMinutes: number;
};

export type User = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
};

export type ConnectionStatus = {
  isConnected: boolean;
  connectedAt?: string;
  phone?: string;
  baileysConnected?: boolean;
};

export const whatsappApi = {
  getConfig: () => apiFetch<WhatsAppConfig>("/whatsapp/config"),

  generateQR: () => apiFetch<{ qr: string }>("/whatsapp/config/qr", { method: "POST" }),

  generateQRWithPhone: (phone: string) => apiFetch<{ qr: string }>("/whatsapp/config/qr/phone", {
    method: "POST",
    body: JSON.stringify({ phone }),
  }),

  getConnectionStatus: () => apiFetch<ConnectionStatus>("/whatsapp/config/status"),

  disconnect: () => apiFetch<{ success: boolean }>("/whatsapp/config/disconnect", { method: "POST" }),

  updateSettings: (data: { timezone?: string; closedMessage?: string }) =>
    apiFetch<WhatsAppConfig>("/whatsapp/config/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getStoreUsers: () => apiFetch<User[]>("/whatsapp/config/users"),

  addVendor: (userId: string, phone: string) =>
    apiFetch<VendorAvailability[]>("/whatsapp/config/vendors", {
      method: "POST",
      body: JSON.stringify({ userId, phone }),
    }),

  removeVendor: (userId: string) =>
    apiFetch<VendorAvailability[]>(`/whatsapp/config/vendors/${userId}`, {
      method: "DELETE",
    }),

  setVendorAvailability: (userId: string, isAvailable: boolean) =>
    apiFetch<VendorAvailability[]>(`/whatsapp/config/vendors/${userId}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable }),
    }),

  setBusinessHours: (dayOfWeek: number, openTime: string, closeTime: string, isActive: boolean) =>
    apiFetch<BusinessHours[]>("/whatsapp/config/business-hours", {
      method: "POST",
      body: JSON.stringify({ dayOfWeek, openTime, closeTime, isActive }),
    }),

  setDefaultBusinessHours: () =>
    apiFetch<BusinessHours[]>("/whatsapp/config/business-hours/default", {
      method: "POST",
    }),

  getConversations: (filters?: {
    status?: ConversationStatus;
    vendorId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.vendorId) params.set("vendorId", filters.vendorId);
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    const query = params.toString();
    return apiFetch<WhatsAppConversation[]>(`/whatsapp/conversations${query ? `?${query}` : ""}`);
  },

  getConversation: (id: string) =>
    apiFetch<WhatsAppConversation>(`/whatsapp/conversations/${id}`),

  closeConversation: (id: string, closedBy?: string) =>
    apiFetch<WhatsAppConversation>(`/whatsapp/conversations/${id}/close`, {
      method: "PATCH",
      body: closedBy ? JSON.stringify({ closedBy }) : "{}",
    }),

  getMetrics: (dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const query = params.toString();
    return apiFetch<WhatsAppMetrics>(`/whatsapp/metrics${query ? `?${query}` : ""}`);
  },

  getVendorPerformance: (dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const query = params.toString();
    return apiFetch<VendorPerformance[]>(`/whatsapp/metrics/vendor-performance${query ? `?${query}` : ""}`);
  },

  getActiveCount: () => apiFetch<{ count: number }>("/whatsapp/metrics/active-count"),
};
