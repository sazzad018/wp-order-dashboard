import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, OrderStatus } from './types';
import { getOrders, updateOrderStatus } from './services/wooCommerceService';
import OrderDetailModal from './components/OrderDetailModal';
import ConnectionModal from './components/ConnectionModal';
import { STATUS_MAP } from './constants';
import { Icon } from './components/Icon';

interface ConnectionConfig {
  url: string;
  token: string;
}

const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(Number(amount));
}

interface OrderListItemProps {
    order: Order;
    isUpdating: boolean;
    onSelectOrder: (order: Order) => void;
    onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
}


const OrderListItem: React.FC<OrderListItemProps> = ({ order, isUpdating, onSelectOrder, onStatusChange }) => {
    const statusInfo = STATUS_MAP[order.status] || {
        label: 'Unknown',
        color: 'bg-gray-200 text-gray-800',
    };

    const handleStatusSelectorClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent modal from opening when clicking the select
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusChange(order.id, e.target.value as OrderStatus);
    };

    return (
        <tr className="hover:bg-gray-100 cursor-pointer" onClick={() => onSelectOrder(order)}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">#{order.number}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{order.billing.first_name} {order.billing.last_name}</div>
                <div className="text-sm text-gray-500">{order.billing.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                 <div className="relative flex items-center">
                    <select
                        value={order.status}
                        onChange={handleStatusChange}
                        onClick={handleStatusSelectorClick}
                        disabled={isUpdating}
                        className={`text-xs font-medium border-0 rounded-full pl-3 pr-8 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity ${statusInfo.color} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.25em 1.25em',
                        }}
                        aria-label={`Change status for order #${order.number}`}
                    >
                        {Object.keys(STATUS_MAP).map((statusKey) => (
                            <option key={statusKey} value={statusKey}>
                                {STATUS_MAP[statusKey as OrderStatus].label}
                            </option>
                        ))}
                    </select>
                    {isUpdating && <div className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-800">
                {formatCurrency(order.total, order.currency)}
            </td>
        </tr>
    );
};

const Loader: React.FC = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">Loading orders...</p>
    </div>
);

const App: React.FC = () => {
    const [connection, setConnection] = useState<ConnectionConfig | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isConnectionModalOpen, setConnectionModalOpen] = useState(false);
    const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<number | null>(null);

    const fetchOrders = useCallback(async (config: ConnectionConfig) => {
        try {
            setError(null);
            setIsLoading(true);
            const fetchedOrders = await getOrders(config);
            setOrders(fetchedOrders);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching orders. Check your connection details.');
            setOrders([]); // Clear orders on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        try {
            const savedConfig = localStorage.getItem('wooCommerceConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                setConnection(config);
                fetchOrders(config);
            } else {
                setIsLoading(false);
                setConnectionModalOpen(true); // Open settings if no config is saved
            }
        } catch (e) {
            console.error("Failed to parse config from localStorage", e);
            setIsLoading(false);
            setConnectionModalOpen(true);
        }
    }, [fetchOrders]);
    
    const handleSaveConnection = (config: ConnectionConfig) => {
        localStorage.setItem('wooCommerceConfig', JSON.stringify(config));
        setConnection(config);
        setConnectionModalOpen(false);
        fetchOrders(config);
    };

    const handleDisconnect = () => {
        localStorage.removeItem('wooCommerceConfig');
        setConnection(null);
        setOrders([]);
        setConnectionModalOpen(true);
    }

    const handleStatusChange = useCallback(async (orderId: number, newStatus: OrderStatus) => {
        if (!connection) return;

        const originalOrders = [...orders];
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (orderToUpdate && orderToUpdate.status === newStatus) return;

        setUpdatingStatusOrderId(orderId);
        
        // Optimistic UI update
        setOrders(currentOrders =>
            currentOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );

        try {
            await updateOrderStatus(connection, orderId, { status: newStatus });
        } catch (err: any) {
            console.error("Failed to update order status:", err);
            setError(`Failed to update status for order #${orderToUpdate?.number}. ${err.message}`);
            setOrders(originalOrders); // Revert on failure
        } finally {
            setUpdatingStatusOrderId(null);
        }
    }, [connection, orders]);

    const filteredAndSortedOrders = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        return orders
            .filter(order => {
                const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
                if (!matchesStatus) return false;

                if (lowercasedQuery === '') return true;

                const customerName = `${order.billing.first_name} ${order.billing.last_name}`.toLowerCase();
                const orderNumber = order.number.toLowerCase();
                
                return orderNumber.includes(lowercasedQuery) || customerName.includes(lowercasedQuery);
            })
            .sort((a, b) => {
                const dateA = new Date(a.date_created).getTime();
                const dateB = new Date(b.date_created).getTime();
                return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            });
    }, [orders, filterStatus, sortOrder, searchQuery]);

    const handleSelectOrder = useCallback((order: Order) => {
        setSelectedOrder(order);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedOrder(null);
    }, []);

    const NotConnectedView = () => (
        <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-700">Not Connected</h2>
            <p className="text-gray-500 mt-2 mb-4">Please connect to your WooCommerce store to view orders.</p>
            <button
                onClick={() => setConnectionModalOpen(true)}
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
                Connect Now
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">WordPress Order Dashboard</h1>
                    {connection && (
                        <button onClick={() => setConnectionModalOpen(true)} className="text-gray-500 hover:text-gray-800" aria-label="Connection Settings">
                            <Icon icon="settings" className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                 {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                 )}
                <div className="bg-white p-4 rounded-lg shadow">
                   {connection ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon icon="search" className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                    type="text"
                                    placeholder="Search by order number or customer name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-72 bg-white text-gray-900 border-gray-300 rounded-md shadow-sm pl-10 pr-4 py-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                            />
                        </div>
                            <div className='flex items-center gap-4'>
                                <div className="flex items-center gap-3">
                                    <label htmlFor="status-filter" className="text-sm font-medium">Status:</label>
                                    <select
                                        id="status-filter"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
                                        className="bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm py-2 pl-3 pr-10"
                                    >
                                        <option value="all">All</option>
                                        {Object.keys(STATUS_MAP).map(status => (
                                            <option key={status} value={status}>{STATUS_MAP[status as OrderStatus].label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label htmlFor="sort-order" className="text-sm font-medium">Sort:</label>
                                    <select
                                        id="sort-order"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                        className="bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm py-2 pl-3 pr-10"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr><td colSpan={5}><Loader /></td></tr>
                                    ) : filteredAndSortedOrders.length > 0 ? (
                                        filteredAndSortedOrders.map(order => (
                                            <OrderListItem 
                                                key={order.id} 
                                                order={order} 
                                                isUpdating={updatingStatusOrderId === order.id}
                                                onSelectOrder={handleSelectOrder}
                                                onStatusChange={handleStatusChange} 
                                            />
                                        ))
                                    ) : (
                                        <tr><td colSpan={5} className="text-center py-10 text-gray-500">No orders found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                     </>
                   ) : (
                        <NotConnectedView />
                   )}
                </div>
            </main>
            <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} />
            {isConnectionModalOpen && (
                <ConnectionModal 
                    isOpen={isConnectionModalOpen}
                    onClose={() => setConnectionModalOpen(false)}
                    onSave={handleSaveConnection}
                    onDisconnect={handleDisconnect}
                    currentConfig={connection}
                />
            )}
        </div>
    );
};

export default App;