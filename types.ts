
export interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface LineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  total: string;
  price: string;
}

export type OrderStatus = 'processing' | 'completed' | 'on-hold' | 'cancelled' | 'refunded' | 'pending' | 'failed';

export interface Order {
  id: number;
  number: string;
  status: OrderStatus;
  date_created: string;
  currency: string;
  total: string;
  customer_note: string;
  billing: Address;
  shipping: Address;
  line_items: LineItem[];
}