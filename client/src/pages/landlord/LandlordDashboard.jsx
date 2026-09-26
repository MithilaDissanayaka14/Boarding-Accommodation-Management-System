import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../../services/listingService';
import { bookingService } from '../../services/bookingService';
import { invoiceService } from '../../services/invoiceService';
import { maintenanceService } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Building,
  Users,
  CreditCard,
  Wrench,
  Plus,
  Check,
  X,
  Eye,
  Bed,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  User,
} from 'lucide-react';

export const LandlordDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bookings');

  // Slip Verification Modal State
  const [selectedSlipInvoice, setSelectedSlipInvoice] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  // Issue Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);
  const [billingMonth, setBillingMonth] = useState('November 2026');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceError, setInvoiceError] = useState('');

  // Maintenance Note State
  const [maintenanceNoteModalOpen, setMaintenanceNoteModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [targetStatus, setTargetStatus] = useState('in_progress');
  const [landlordNote, setLandlordNote] = useState('');

  // 1. Fetch Landlord Properties
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['landlord-properties'],
    queryFn: listingService.getMyListings,
  });

  // 2. Fetch Incoming Booking Requests
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['landlord-bookings'],
    queryFn: bookingService.getLandlordIncomingBookings,
  });

  // 3. Fetch Landlord Rent Invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['landlord-invoices'],
    queryFn: invoiceService.getLandlordInvoices,
  });

  // 4. Fetch Landlord Maintenance Tickets
  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['landlord-maintenance'],
    queryFn: maintenanceService.getLandlordRequests,
  });

  // Booking Status Mutation with Optimistic Updates
  const bookingStatusMutation = useMutation({
    mutationFn: ({ bookingId, status, rejectionReason }) =>
      bookingService.updateBookingStatus(bookingId, { status, rejectionReason }),
    onMutate: async ({ bookingId, status }) => {
      await queryClient.cancelQueries(['landlord-bookings']);
      const previousBookings = queryClient.getQueryData(['landlord-bookings']);

      queryClient.setQueryData(['landlord-bookings'], (old) => {
        if (!old?.data?.bookings) return old;
        return {
          ...old,
          data: {
            ...old.data,
            bookings: old.data.bookings.map((b) =>
              b._id === bookingId ? { ...b, status } : b
            ),
          },
        };
      });

      return { previousBookings };
    },
    onError: (err, variables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(['landlord-bookings'], context.previousBookings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['landlord-bookings']);
      queryClient.invalidateQueries(['landlord-properties']);
    },
  });

  // Invoice Verification Mutation with Optimistic Updates
  const verifySlipMutation = useMutation({
    mutationFn: ({ invoiceId, status, rejectionReason }) =>
      invoiceService.verifyPaymentSlip(invoiceId, { status, rejectionReason }),
    onMutate: async ({ invoiceId, status }) => {
      await queryClient.cancelQueries(['landlord-invoices']);
      const previousInvoices = queryClient.getQueryData(['landlord-invoices']);

      queryClient.setQueryData(['landlord-invoices'], (old) => {
        if (!old?.data?.invoices) return old;
        return {
          ...old,
          data: {
            ...old.data,
            invoices: old.data.invoices.map((inv) =>
              inv._id === invoiceId ? { ...inv, status } : inv
            ),
          },
        };
      });

      return { previousInvoices };
    },
    onError: (err, variables, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(['landlord-invoices'], context.previousInvoices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['landlord-invoices']);
      setSlipModalOpen(false);
      setRejectReason('');
    },
  });

  // Create Rent Invoice Mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (payload) => invoiceService.createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['landlord-invoices']);
      setInvoiceModalOpen(false);
      setInvoiceError('');
    },
    onError: (err) => {
      setInvoiceError(err.response?.data?.message || 'Failed to issue rent invoice');
    },
  });

  // Maintenance Status Update Mutation
  const updateMaintenanceMutation = useMutation({
    mutationFn: ({ ticketId, status, landlordNote }) =>
      maintenanceService.updateRequestStatus(ticketId, { status, landlordNote }),
    onSuccess: () => {
      queryClient.invalidateQueries(['landlord-maintenance']);
      setMaintenanceNoteModalOpen(false);
      setLandlordNote('');
    },
  });

  const listings = listingsData?.data?.listings || [];
  const bookings = bookingsData?.data?.bookings || [];
  const invoices = invoicesData?.data?.invoices || [];
  const tickets = maintenanceData?.data?.tickets || [];

  const activeTenancies = bookings.filter((b) => b.status === 'accepted');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const pendingSlips = invoices.filter((i) => i.status === 'submitted');
  const pendingTickets = tickets.filter((t) => t.status === 'pending' || t.status === 'in_progress');

  const handleIssueInvoice = (e) => {
    e.preventDefault();
    if (!selectedBookingForInvoice) {
      setInvoiceError('Please select a student tenancy');
      return;
    }
    createInvoiceMutation.mutate({
      bookingId: selectedBookingForInvoice._id,
      billingMonth,
      amount: Number(invoiceAmount || selectedBookingForInvoice.listingId?.rentAmount),
      dueDate,
    });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header Profile & Actions */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
            }}
          >
            {user?.name?.charAt(0) || 'L'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name}</h1>
              <span className="badge badge-info">Verified Landlord</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {listings.length} Registered Accommodations • {user?.phone} • {user?.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link
            to="/profile"
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <User size={15} />
            Edit Profile
          </Link>
          <Link to="/landlord/create-listing" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
            <Plus size={16} strokeWidth={2.5} /> Post New Listing
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Inquiries</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {pendingBookings.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Slips to Verify</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {pendingSlips.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Repair Tickets</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {pendingTickets.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Confirmed Tenancies</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {activeTenancies.length}
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.875rem',
            backgroundColor: activeTab === 'bookings' ? 'var(--primary-subtle)' : 'transparent',
            color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-secondary)',
            border: activeTab === 'bookings' ? '1px solid var(--primary-border)' : '1px solid transparent',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Users size={16} />
          Booking Inbox ({pendingBookings.length} new)
        </button>

        <button
          onClick={() => setActiveTab('rent')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.875rem',
            backgroundColor: activeTab === 'rent' ? 'var(--primary-subtle)' : 'transparent',
            color: activeTab === 'rent' ? 'var(--primary)' : 'var(--text-secondary)',
            border: activeTab === 'rent' ? '1px solid var(--primary-border)' : '1px solid transparent',
            transition: 'all var(--transition-fast)',
          }}
        >
          <CreditCard size={16} />
          Rent & Slip Desk ({pendingSlips.length} to verify)
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.875rem',
            backgroundColor: activeTab === 'maintenance' ? 'var(--primary-subtle)' : 'transparent',
            color: activeTab === 'maintenance' ? 'var(--primary)' : 'var(--text-secondary)',
            border: activeTab === 'maintenance' ? '1px solid var(--primary-border)' : '1px solid transparent',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Wrench size={16} />
          Maintenance Manager ({tickets.length})
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.875rem',
            backgroundColor: activeTab === 'properties' ? 'var(--primary-subtle)' : 'transparent',
            color: activeTab === 'properties' ? 'var(--primary)' : 'var(--text-secondary)',
            border: activeTab === 'properties' ? '1px solid var(--primary-border)' : '1px solid transparent',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Building size={16} />
          My Properties ({listings.length})
        </button>
      </div>

      {/* TAB 1: INCOMING BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          {bookingsLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading booking requests...</p>
          ) : bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                  }}
                >
                  <div style={{ maxWidth: '520px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {b.studentId?.name || 'Undergraduate Student'}
                      </h3>
                      <StatusBadge status={b.status} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {b.studentId?.university || 'University Student'}
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Accommodation: <strong>{b.listingId?.title}</strong> • Move-in date: <strong>{new Date(b.moveInDate).toLocaleDateString()}</strong>
                    </div>

                    {b.message && (
                      <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.875rem', backgroundColor: 'var(--bg-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                        "{b.message}"
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      Contact: {b.studentId?.phone} • {b.studentId?.email}
                    </div>
                  </div>

                  <div>
                    {b.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            bookingStatusMutation.mutate({
                              bookingId: b._id,
                              status: 'accepted',
                            })
                          }
                          disabled={bookingStatusMutation.isLoading}
                        >
                          <Check size={15} /> Accept Request
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            const reason = prompt('Optional rejection note for student:');
                            bookingStatusMutation.mutate({
                              bookingId: b._id,
                              status: 'rejected',
                              rejectionReason: reason || 'Landlord declined request',
                            });
                          }}
                          disabled={bookingStatusMutation.isLoading}
                        >
                          <X size={15} /> Reject
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status Handled</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                          {b.status}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No Inquiries Yet"
              description="When students browse your rooms and request reservations, their details and move-in dates will arrive here for approval."
            />
          )}
        </div>
      )}

      {/* TAB 2: RENT & SLIP DESK */}
      {activeTab === 'rent' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Monthly Rent Invoicing & Slip Verification
            </h2>
            <button
              className="btn btn-primary btn-sm"
              disabled={activeTenancies.length === 0}
              onClick={() => {
                if (activeTenancies.length > 0) {
                  setSelectedBookingForInvoice(activeTenancies[0]);
                  setInvoiceAmount(activeTenancies[0].listingId?.rentAmount || '');
                }
                setInvoiceModalOpen(true);
              }}
            >
              <Plus size={15} /> Issue Monthly Invoice
            </button>
          </div>

          {activeTenancies.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Note: You can issue monthly rent statements once you have confirmed an active student tenancy.
            </div>
          )}

          {invoicesLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading statements...</p>
          ) : invoices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {invoices.map((inv) => (
                <div
                  key={inv._id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {inv.billingMonth} - Rs. {inv.amount.toLocaleString()}
                      </h3>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Tenant: <strong>{inv.studentId?.name}</strong> • Accommodation: {inv.listingId?.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Due Date: {new Date(inv.dueDate).toLocaleDateString()}
                      {inv.transactionRef && ` • Bank Reference: ${inv.transactionRef}`}
                    </div>
                  </div>

                  <div>
                    {inv.status === 'submitted' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedSlipInvoice(inv);
                          setSlipModalOpen(true);
                        }}
                      >
                        <Eye size={15} /> Inspect Slip & Verify
                      </button>
                    ) : inv.status === 'verified' ? (
                      <div style={{ color: 'var(--status-success-text)', fontSize: '0.85rem', fontWeight: 700 }}>
                        ✓ Verified on {new Date(inv.verifiedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Awaiting student payment slip
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No Invoices Issued"
              description="Click 'Issue Monthly Invoice' to bill your confirmed tenants for the upcoming billing cycle."
            />
          )}
        </div>
      )}

      {/* TAB 3: MAINTENANCE ISSUES */}
      {activeTab === 'maintenance' && (
        <div>
          {maintenanceLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading tickets...</p>
          ) : tickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tickets.map((t) => (
                <div key={t._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.title}</h3>
                        <StatusBadge status={t.status} />
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: t.priority === 'urgent' ? '#E11D48' : 'var(--text-muted)', fontWeight: 700 }}>
                          [{t.priority}]
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Reported by {t.tenantId?.name} ({t.tenantId?.phone}) • {t.listingId?.title}
                      </div>
                    </div>

                    {/* Status Update Button */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {t.status !== 'resolved' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedTicket(t);
                            setTargetStatus(t.status === 'pending' ? 'in_progress' : 'resolved');
                            setMaintenanceNoteModalOpen(true);
                          }}
                        >
                          Update Status & Add Note
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                    {t.description}
                  </p>

                  {t.landlordNote && (
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--primary-subtle)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--primary-hover)' }}>
                      <strong>Your update to tenant:</strong> {t.landlordNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wrench}
              title="Zero Maintenance Issues"
              description="No repair requests from any of your student tenants at this time."
            />
          )}
        </div>
      )}

      {/* TAB 4: MY PROPERTIES */}
      {activeTab === 'properties' && (
        <div>
          {listingsLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading properties...</p>
          ) : listings.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {listings.map((l) => (
                <div key={l._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img
                      src={l.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80'}
                      alt={l.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-neutral">{l.roomType}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: l.availableBeds > 0 ? 'var(--primary)' : 'var(--status-danger-text)' }}>
                      <Bed size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {l.availableBeds}/{l.totalBeds} Beds Free
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {l.title}
                  </h3>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {l.nearestUniversity} • {l.city}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Rs. {l.rentAmount.toLocaleString()}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}> / mo</span>
                    </div>
                    <Link to={`/listings/${l._id}`} className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building}
              title="No Accommodations Published"
              description="Publish your first student room or annex to begin receiving booking requests."
              actionLabel="Create Listing"
              onAction={() => setActiveTab('properties')}
            />
          )}
        </div>
      )}

      {/* Slip Verification Lightbox Modal */}
      <Modal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        title={`Verify Payment Slip: ${selectedSlipInvoice?.billingMonth}`}
        maxWidth="620px"
      >
        {selectedSlipInvoice && (
          <div>
            <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student Tenant:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedSlipInvoice.studentId?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Invoice Amount:</span>
                <strong style={{ color: 'var(--primary)' }}>Rs. {selectedSlipInvoice.amount.toLocaleString()}</strong>
              </div>
              {selectedSlipInvoice.transactionRef && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bank Reference:</span>
                  <span>{selectedSlipInvoice.transactionRef}</span>
                </div>
              )}
            </div>

            {/* Slip Preview Image */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', backgroundColor: '#F1F5F9', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
              {selectedSlipInvoice.paymentSlipUrl ? (
                <img
                  src={selectedSlipInvoice.paymentSlipUrl}
                  alt="Student payment slip"
                  style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
                />
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No slip file attached.</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Decline Reason (Required only if rejecting)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Incomplete transfer amount, blurry slip photo"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() =>
                  verifySlipMutation.mutate({
                    invoiceId: selectedSlipInvoice._id,
                    status: 'rejected',
                    rejectionReason: rejectReason || 'Payment slip could not be validated',
                  })
                }
                disabled={verifySlipMutation.isLoading}
              >
                Reject Slip
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  verifySlipMutation.mutate({
                    invoiceId: selectedSlipInvoice._id,
                    status: 'verified',
                  })
                }
                disabled={verifySlipMutation.isLoading}
              >
                <Check size={16} /> Confirm Verification
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Issue Monthly Invoice Modal */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Issue Monthly Rent Statement"
      >
        <form onSubmit={handleIssueInvoice}>
          {invoiceError && (
            <div style={{ color: 'var(--status-danger-text)', backgroundColor: 'var(--status-danger-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {invoiceError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Tenant Tenancy</label>
            <select
              className="form-select"
              value={selectedBookingForInvoice?._id || ''}
              onChange={(e) => {
                const b = activeTenancies.find((x) => x._id === e.target.value);
                setSelectedBookingForInvoice(b);
                setInvoiceAmount(b?.listingId?.rentAmount || '');
              }}
              required
            >
              {activeTenancies.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.studentId?.name} - {b.listingId?.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Billing Cycle / Month</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. November 2026"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rent Amount (Rs.)</label>
            <input
              type="number"
              className="form-input"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setInvoiceModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createInvoiceMutation.isLoading}>
              {createInvoiceMutation.isLoading ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Maintenance Status Modal */}
      <Modal
        isOpen={maintenanceNoteModalOpen}
        onClose={() => setMaintenanceNoteModalOpen(false)}
        title="Update Repair Status"
      >
        {selectedTicket && (
          <div>
            <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hairline)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{selectedTicket.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedTicket.description}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select
                className="form-select"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
              >
                <option value="in_progress">In Progress (Technician hired / scheduled)</option>
                <option value="resolved">Resolved (Issue completely fixed)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Landlord Note for Tenant</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Plumber Sarath scheduled for tomorrow 10 AM..."
                value={landlordNote}
                onChange={(e) => setLandlordNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setMaintenanceNoteModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  updateMaintenanceMutation.mutate({
                    ticketId: selectedTicket._id,
                    status: targetStatus,
                    landlordNote,
                  })
                }
                disabled={updateMaintenanceMutation.isLoading}
              >
                Save Updates
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
