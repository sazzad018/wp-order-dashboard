
import React from 'react';
import { Order } from '../types';
import { Icon } from './Icon';
import StatusBadge from './StatusBadge';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(Number(amount));
}

const AddressCard: React.FC<{ title: string; address: Order['billing'] }> = ({ title, address }) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
            <Icon icon="location" className="w-5 h-5 mr-2 text-gray-500" />
            {title}
        </h4>
        <div className="text-sm text-gray-600">
            <p>{address.first_name} {address.last_name}</p>
            <p>{address.address_1}</p>
            {address.address_2 && <p>{address.address_2}</p>}
            <p>{address.city}, {address.postcode}</p>
            <p>{address.state}, {address.country}</p>
            {address.phone && <p>Phone: {address.phone}</p>}
            {address.email && <p>Email: {address.email}</p>}
        </div>
    </div>
);

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order #{order.number}</h2>
            <p className="text-sm text-gray-500">
              Date: {new Date(order.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon icon="close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center text-gray-500 mb-1"><Icon icon="user" className="w-5 h-5 mr-2"/>Customer</div>
                <p className="font-semibold text-gray-800">{order.billing.first_name} {order.billing.last_name}</p>
            </div>
             <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center text-gray-500 mb-1"><Icon icon="money" className="w-5 h-5 mr-2"/>Total Amount</div>
                <p className="font-semibold text-gray-800">{formatCurrency(order.total, order.currency)}</p>
            </div>
             <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center text-gray-500 mb-1">Status</div>
                <StatusBadge status={order.status} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AddressCard title="Billing Address" address={order.billing} />
            <AddressCard title="Shipping Address" address={order.shipping} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {order.line_items.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.price, order.currency)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.total, order.currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                     <tfoot className="bg-gray-50">
                        <tr>
                            <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-700">Grand Total</td>
                            <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(order.total, order.currency)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
          </div>

          {order.customer_note && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                <Icon icon="note" className="w-5 h-5 mr-2 text-gray-500" />
                Customer Note
              </h4>
              <p className="text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">{order.customer_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;