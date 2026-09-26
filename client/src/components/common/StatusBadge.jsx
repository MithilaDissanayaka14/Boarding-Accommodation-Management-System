import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let badgeClass = 'badge-neutral';
  let label = status;

  switch (normalized) {
    case 'pending':
      badgeClass = 'badge-pending';
      label = 'Pending Review';
      break;
    case 'accepted':
    case 'verified':
    case 'resolved':
    case 'completed':
    case 'available':
      badgeClass = 'badge-success';
      label = status.charAt(0).toUpperCase() + status.slice(1);
      break;
    case 'rejected':
    case 'cancelled':
    case 'unpaid':
    case 'occupied':
      badgeClass = 'badge-danger';
      label = status.charAt(0).toUpperCase() + status.slice(1);
      break;
    case 'in_progress':
      badgeClass = 'badge-info';
      label = 'In Progress';
      break;
    case 'submitted':
      badgeClass = 'badge-pending';
      label = 'Slip Uploaded';
      break;
    default:
      badgeClass = 'badge-neutral';
      label = status;
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};
