export interface SeedCompanyData {
  name: string;
  subdomain: string;
  logoUrl: string | null;
  timezone: string;
  isActive: boolean;
  subscriptionPlan: string;
  subscriptionExpiresInDays: number;
  settings: {
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    country: string;
    taxId: string;
    registrationNumber: string;
    industry: string;
    companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  };
}

export const companyData: SeedCompanyData = {
  name: 'Hirely',
  subdomain: 'hirely',
  logoUrl: 'https://hirely.dev/assets/logo.svg',
  timezone: 'Europe/Riga',
  isActive: true,
  subscriptionPlan: 'business',
  subscriptionExpiresInDays: 365,
  settings: {
    email: 'team@hire.dev',
    phone: '+37120000000',
    website: 'https://hirely.dev',
    address: 'Brivibas iela 21',
    city: 'Riga',
    country: 'Latvia',
    taxId: 'LV40001234567',
    registrationNumber: '40203123456',
    industry: 'Software Development',
    companySize: '11-50',
  },
};
