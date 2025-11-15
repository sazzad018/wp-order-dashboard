import { Order, OrderStatus } from '../types';

interface ConnectionConfig {
  url: string;
  token: string;
}

const getApiHeaders = (config: ConnectionConfig) => {
    if (!config || !config.token) {
        throw new Error("Connection token is missing.");
    }
    return {
      'X-Order-Dashboard-Token': config.token,
      'Content-Type': 'application/json',
    };
}

// Fetches all orders by paginating through the API results.
export const getOrders = async (config: ConnectionConfig): Promise<Order[]> => {
  if (!config || !config.url) {
    throw new Error("WooCommerce store URL is missing.");
  }

  const baseUrl = `${config.url.replace(/\/+$/, '')}/wp-json/order-dashboard/v1/orders`;
  let allOrders: Order[] = [];
  let page = 1;
  const perPage = 100; // Fetch 100 orders per page for efficiency.

  while (true) {
    const apiUrl = `${baseUrl}?per_page=${perPage}&page=${page}`;

    const response = await fetch(apiUrl, {
      headers: getApiHeaders(config),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || `Network response was not ok: ${response.statusText}`);
    }

    const data: Order[] = await response.json();
    
    if (data.length > 0) {
      allOrders = allOrders.concat(data);
      page++;
    } else {
      // No more orders to fetch, break the loop.
      break;
    }
    
    // If the number of returned orders is less than the number requested,
    // it must be the last page.
    if (data.length < perPage) {
        break;
    }
  }

  return allOrders;
};


// Updates the status of a specific order via the custom proxy endpoint.
export const updateOrderStatus = async (
  config: ConnectionConfig,
  orderId: number,
  data: { status: OrderStatus }
): Promise<Order> => {
   if (!config || !config.url) {
    throw new Error("WooCommerce store URL is missing.");
  }
  
  const apiUrl = `${config.url.replace(/\/+$/, '')}/wp-json/order-dashboard/v1/orders/${orderId}`;
  
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: getApiHeaders(config),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || `Network response was not ok: ${response.statusText}`);
  }

  return response.json();
};
