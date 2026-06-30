// ----------------------------------------------------------------------------
// Type-only module. Mock analytics data has been removed — all admin analytics
// now come from the live backend via commerceApi.ts (getAnalyticsOverview).
// ----------------------------------------------------------------------------

export interface RevenuePoint { date: string; iso: string; revenue: number; orders: number; aov: number }
export interface ChannelBreakdown { channel: string; revenue: number; orders: number; share: number }
export interface CategoryBreakdown { category: string; revenue: number; units: number }
export interface FunnelStep { stage: string; value: number; pct: number }
export interface CityBreakdown { city: string; orders: number; revenue: number }
export interface PaymentMethodBreakdown { gateway: string; success: number; failed: number; revenue: number; successRate: number }

export interface AnalyticsOverview {
  range: { start: string; end: string; days: number };
  kpis: {
    revenue: number;
    revenuePrev: number;
    orders: number;
    ordersPrev: number;
    customers: number;
    aov: number;
    conversionRate: number;
    refundRate: number;
    cartAbandonRate: number;
    paymentSuccessRate: number;
  };
  revenueSeries: RevenuePoint[];
  channels: ChannelBreakdown[];
  categories: CategoryBreakdown[];
  funnel: FunnelStep[];
  topCities: CityBreakdown[];
  paymentMethods: PaymentMethodBreakdown[];
  topProducts: { productId: string; name: string; units: number; revenue: number }[];
}
