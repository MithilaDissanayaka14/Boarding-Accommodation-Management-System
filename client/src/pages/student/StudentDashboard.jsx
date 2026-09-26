import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { invoiceService } from '../../services/invoiceService';
import { maintenanceService } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Building,
  CreditCard,
  Wrench,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bookings');

  // Slip Upload Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [txnRef, setTxnRef] = useState('');
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Maintenance Ticket Modal State
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketListingId, setTicketListingId] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketError, setTicketError] = useState('');

  // Fetch student's bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: bookingService.getMyStudentBookings,
  });

  // Fetch student's rent invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: invoiceService.getStudentInvoices,
  });

  // Fetch student's maintenance requests
  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['my-maintenance'],
    queryFn: maintenanceService.getStudentRequests,
  });

  // Submit payment slip mutation
  const uploadSlipMutation = useMutation({
    mutationFn: ({ invoiceId, formData }) => invoiceService.submitPaymentSlip(invoiceId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-invoices']);
      setSlipModalOpen(false);
      setSlipFile(null);
      setTxnRef('');
      setUploadError('');
    },
    onError: (err) => {
      setUploadError(err.response?.data?.message || 'Failed to submit payment slip');
    },
  });

  // Create maintenance ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: (ticketPayload) => maintenanceService.createRequest(ticketPayload),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-maintenance']);
      setTicketModalOpen(false);
      setTicketTitle('');
      setTicketDesc('');
      setTicketError('');
    },
    onError: (err) => {
      setTicketError(err.response?.data?.message || 'Failed to file maintenance ticket');
    },
  });

  const bookings = bookingsData?.data?.bookings || [];
  const invoices = invoicesData?.data?.invoices || [];
  const tickets = maintenanceData?.data?.tickets || [];

  const acceptedStays = bookings.filter((b) => b.status === 'accepted' || b.status === 'completed');

  const handleSlipSubmit = (e) => {
    e.preventDefault();
    if (!slipFile) {
      setUploadError('Please select a payment slip file (JPEG, PNG, or PDF)');
      return;
    }
    const formData = new FormData();
    formData.append('slip', slipFile);
    if (txnRef) formData.append('transactionRef', txnRef);

    uploadSlipMutation.mutate({
      invoiceId: selectedInvoice._id,
      formData,
    });
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!ticketListingId) {
      setTicketError('Please select the accommodation where the issue exists');
      return;
    }
    createTicketMutation.mutate({
      listingId: ticketListingId,
      title: ticketTitle,
      description: ticketDesc,
      priority: ticketPriority,
    });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Student Profile Header Card */}
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
              background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
            }}
          >
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name}</h1>
              <span className="badge badge-success">Verified Student</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {user?.university ? `${user.university} Campus` : 'University Student'} • {user?.email}
            </p>
          </div>
        </div>

        <Link to="/listings" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
          Explore More Places
        </Link>
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
          <Building size={16} />
          My Reservations ({bookings.length})
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
          Rent Statements ({invoices.length})
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
          Maintenance Desk ({tickets.length})
        </button>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          {bookingsLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading your reservations...</p>
          ) : bookings.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {bookings.map((booking) => (
                <div key={booking._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <StatusBadge status={booking.status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 500 }}>
                      Requested {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    {booking.listingId?.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1rem' }}>
                    <MapPin size={13} color="var(--primary)" />
                    {booking.listingId?.address}, {booking.listingId?.city}
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Intended Move-In:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{new Date(booking.moveInDate).toLocaleDateString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Monthly Rent:</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        Rs. {booking.listingId?.rentAmount?.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {booking.status === 'accepted' && (
                    <div style={{ color: 'var(--status-success-text)', fontSize: '0.825rem', backgroundColor: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                      ✓ Stay confirmed! Landlord contact: {booking.ownerId?.name} ({booking.ownerId?.phone})
                    </div>
                  )}

                  {booking.status === 'rejected' && booking.rejectionReason && (
                    <div style={{ color: 'var(--status-danger-text)', fontSize: '0.825rem', backgroundColor: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                      Note: {booking.rejectionReason}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/listings/${booking.listingId?._id}`} className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                      View Accommodation <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Booking Inquiries Yet"
              description="You haven't requested any accommodation reservations yet. Explore campus boardings to find your ideal space."
              actionLabel="Explore Boardings"
              onAction={() => setActiveTab('bookings')}
            />
          )}
        </div>
      )}

      {/* TAB 2: RENT STATEMENTS */}
      {activeTab === 'rent' && (
        <div>
          {invoicesLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading rent statements...</p>
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
                        Rent for {inv.billingMonth}
                      </h3>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Accommodation: <strong>{inv.listingId?.title}</strong> • Due date: {new Date(inv.dueDate).toLocaleDateString()}
                    </div>
                    {inv.status === 'verified' && inv.verifiedAt && (
                      <div style={{ color: 'var(--status-success-text)', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>
                        ✓ Slip verified by landlord on {new Date(inv.verifiedAt).toLocaleDateString()}
                      </div>
                    )}
                    {inv.status === 'rejected' && (
                      <div style={{ color: 'var(--status-danger-text)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Verification note: {inv.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Amount Due</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Rs. {inv.amount.toLocaleString()}
                      </div>
                    </div>

                    {inv.status === 'unpaid' || inv.status === 'rejected' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setSlipModalOpen(true);
                        }}
                      >
                        <UploadCloud size={15} /> Upload Slip
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setSlipModalOpen(true);
                        }}
                      >
                        <FileText size={15} /> View Slip
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No Invoices Issued"
              description="When your landlord issues your monthly rent invoice, you will be able to upload payment slips and view verified statements here."
            />
          )}
        </div>
      )}

      {/* TAB 3: MAINTENANCE TICKETS */}
      {activeTab === 'maintenance' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Maintenance Issues & Repairs
            </h2>
            <button
              className="btn btn-primary btn-sm"
              disabled={acceptedStays.length === 0}
              onClick={() => {
                if (acceptedStays.length > 0) {
                  setTicketListingId(acceptedStays[0].listingId?._id);
                }
                setTicketModalOpen(true);
              }}
            >
              <Plus size={15} /> Report New Issue
            </button>
          </div>

          {acceptedStays.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Note: You can submit repair requests once you have an active tenancy.
            </div>
          )}

          {maintenanceLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading tickets...</p>
          ) : tickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                        Reported on {new Date(t.createdAt).toLocaleDateString()} • {t.listingId?.title}
                      </div>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                    {t.description}
                  </p>

                  {/* 3-Stage Progress Stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-hairline)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.825rem', fontWeight: 700 }}>
                      <CheckCircle2 size={16} /> Reported
                    </div>
                    <div style={{ flex: 1, height: '2px', backgroundColor: t.status !== 'pending' ? 'var(--primary)' : 'var(--border-hairline)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: t.status === 'in_progress' || t.status === 'resolved' ? 'var(--primary)' : 'var(--text-light)', fontSize: '0.825rem', fontWeight: 700 }}>
                      <Clock size={16} /> In Progress
                    </div>
                    <div style={{ flex: 1, height: '2px', backgroundColor: t.status === 'resolved' ? 'var(--primary)' : 'var(--border-hairline)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: t.status === 'resolved' ? 'var(--primary)' : 'var(--text-light)', fontSize: '0.825rem', fontWeight: 700 }}>
                      <CheckCircle2 size={16} /> Resolved
                    </div>
                  </div>

                  {t.landlordNote && (
                    <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', backgroundColor: 'var(--primary-subtle)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--primary-hover)' }}>
                      <strong>Landlord update:</strong> {t.landlordNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wrench}
              title="Zero Active Issues"
              description="Everything running smoothly! When a repair need arises (water leaks, electrical faults, etc.), file a ticket here."
            />
          )}
        </div>
      )}

      {/* Slip Upload Modal */}
      <Modal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        title={`Payment Slip: ${selectedInvoice?.billingMonth || 'Rent'}`}
      >
        {selectedInvoice && (
          <div>
            <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Due:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Rs. {selectedInvoice.amount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Landlord Contact:</span>
                <span>{selectedInvoice.ownerId?.name} ({selectedInvoice.ownerId?.phone})</span>
              </div>
            </div>

            {selectedInvoice.paymentSlipUrl && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Submitted Bank Slip:
                </div>
                <img
                  src={selectedInvoice.paymentSlipUrl}
                  alt="Payment slip"
                  style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--border-hairline)' }}
                />
              </div>
            )}

            {(selectedInvoice.status === 'unpaid' || selectedInvoice.status === 'rejected') && (
              <form onSubmit={handleSlipSubmit}>
                {uploadError && (
                  <div style={{ color: 'var(--status-danger-text)', backgroundColor: 'var(--status-danger-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {uploadError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Attach Transfer Receipt (JPEG, PNG, or PDF max 5MB)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setSlipFile(e.target.files[0])}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bank Transaction Reference (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. BOC-TXN-902341 or Sampath Bank Ref"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setSlipModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploadSlipMutation.isLoading}>
                    {uploadSlipMutation.isLoading ? 'Uploading...' : 'Submit Slip'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* Maintenance Ticket Modal */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Submit Maintenance Ticket"
      >
        <form onSubmit={handleCreateTicket}>
          {ticketError && (
            <div style={{ color: 'var(--status-danger-text)', backgroundColor: 'var(--status-danger-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {ticketError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Accommodation</label>
            <select
              className="form-select"
              value={ticketListingId}
              onChange={(e) => setTicketListingId(e.target.value)}
              required
            >
              {acceptedStays.map((s) => (
                <option key={s.listingId?._id} value={s.listingId?._id}>
                  {s.listingId?.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bathroom Tap Leaking, Wi-Fi router down"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value)}
            >
              <option value="low">Low (Non-urgent cosmetic)</option>
              <option value="medium">Medium (Normal repairs)</option>
              <option value="urgent">Urgent (Water/Power failure)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder="Describe the problem, when it started, and any urgency notes..."
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setTicketModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createTicketMutation.isLoading}>
              {createTicketMutation.isLoading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
