
import { OrderStatus } from './types';

export const STATUS_MAP: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
  'on-hold': {
    label: 'On Hold',
    color: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800',
    dot: 'bg-gray-500',
  },
  pending: {
    label: 'Pending',
    color: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-500',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-200 text-red-900',
    dot: 'bg-red-700',
  },
};