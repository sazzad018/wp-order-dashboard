
import React from 'react';
import { OrderStatus } from '../types';
import { STATUS_MAP } from '../constants';

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusInfo = STATUS_MAP[status] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800',
    dot: 'bg-gray-500',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
    >
      <span className={`w-2 h-2 mr-2 rounded-full ${statusInfo.dot}`}></span>
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;
