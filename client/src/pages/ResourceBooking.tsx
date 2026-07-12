import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  User,
  Building2,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  CalendarCheck,
} from 'lucide-react';
import {
  bookings as initialBookings,
  assets,
  users,
  departments,
  getUserById,
  getAssetById,
  formatDate,
  formatDateTime,
  Booking,
} from '../data/mockData';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addDays } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'calendar' | 'list';

interface BookingFormState {
  assetId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const bookableAssets = assets.filter((a) => a.isBookable);

function getStatusBadgeClass(status: Booking['status']): string {
  switch (status) {
    case 'upcoming':  return 'badge badge-upcoming';
    case 'ongoing':   return 'badge badge-ongoing';
    case 'completed': return 'badge badge-completed';
    case 'cancelled': return 'badge badge-cancelled';
    default:          return 'badge';
  }
}

function statusLabel(status: Booking['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Returns true if [startA, endA) overlaps [startB, endB) */
function hasOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}

function buildISO(date: string, time: string): string {
  return `${date}T${time}:00`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatusDotProps { status: Booking['status'] }
function StatusDot({ status }: StatusDotProps) {
  const colors: Record<Booking['status'], string> = {
    upcoming:  'var(--info)',
    ongoing:   'var(--teal)',
    completed: 'var(--success)',
    cancelled: 'var(--text-muted)',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: colors[status],
        marginRight: 6,
        flexShrink: 0,
      }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ResourceBooking: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedResourceId, setSelectedResourceId] = useState<string>(bookableAssets[0]?.id ?? '');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2024, 6, 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

 
  const currentUserId = 'u1';
  const currentUser = getUserById(currentUserId);
  const isPrivileged =
    currentUser?.role === 'admin' || currentUser?.role === 'asset_manager';

 
  const defaultForm: BookingFormState = {
    assetId: bookableAssets[0]?.id ?? '',
    date: format(new Date(2024, 6, 15), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
  };
  const [form, setForm] = useState<BookingFormState>(defaultForm);
  const [formError, setFormError] = useState<string>('');

 
  const resourceBookings = useMemo(
    () => bookings.filter((b) => b.assetId === selectedResourceId),
    [bookings, selectedResourceId],
  );

 
  const eventDays = useMemo<Set<string>>(() => {
    const s = new Set<string>();
    resourceBookings.forEach((b) => {
      s.add(b.startTime.slice(0, 10));
    });
    return s;
  }, [resourceBookings]);

  /** Bookings for the selected day */
  const selectedDayBookings = useMemo<Booking[]>(() => {
    if (!selectedDay) return [];
    const dayStr = format(selectedDay, 'yyyy-MM-dd');
    return resourceBookings.filter((b) => b.startTime.startsWith(dayStr));
  }, [selectedDay, resourceBookings]);

  // ── KPI stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     bookings.length,
    upcoming:  bookings.filter((b) => b.status === 'upcoming').length,
    ongoing:   bookings.filter((b) => b.status === 'ongoing').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }), [bookings]);

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const calendarDays = useMemo<Date[]>(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handlePrevMonth() { setCurrentMonth((m) => subMonths(m, 1)); setSelectedDay(null); }
  function handleNextMonth() { setCurrentMonth((m) => addMonths(m, 1)); setSelectedDay(null); }

  function handleDayClick(day: Date) {
    if (!isSameMonth(day, currentMonth)) return;
    setSelectedDay((prev) => (prev && isSameDay(prev, day) ? null : day));
  }

  function handleCancelBooking(bookingId: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)),
    );
  }

  function handleFormChange(field: keyof BookingFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  }

  function handleSubmitBooking() {
    const { assetId, date, startTime, endTime, purpose } = form;

    if (!assetId || !date || !startTime || !endTime || !purpose.trim()) {
      setFormError('All fields are required.');
      return;
    }

    const startISO = buildISO(date, startTime);
    const endISO   = buildISO(date, endTime);

    if (startISO >= endISO) {
      setFormError('End time must be after start time.');
      return;
    }

    // Overlap check
    const conflicting = bookings
      .filter((b) => b.assetId === assetId && b.status !== 'cancelled')
      .find((b) => hasOverlap(startISO, endISO, b.startTime, b.endTime));

    if (conflicting) {
      const asset = getAssetById(assetId);
      const who   = getUserById(conflicting.userId);
      setFormError(
        `Overlap conflict: ${asset?.name ?? 'Resource'} is already booked ` +
        `from ${format(parseISO(conflicting.startTime), 'hh:mm a')} to ` +
        `${format(parseISO(conflicting.endTime), 'hh:mm a')} ` +
        `by ${who?.name ?? 'someone'}.`,
      );
      return;
    }

    const newBooking: Booking = {
      id:           `b${Date.now()}`,
      assetId,
      userId:       currentUserId,
      departmentId: currentUser?.department ?? 'd1',
      startTime:    startISO,
      endTime:      endISO,
      purpose:      purpose.trim(),
      status:       'upcoming',
      createdAt:    new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setShowModal(false);
    setForm(defaultForm);
    setFormError('');

    // Navigate calendar to booked month & select the day
    const bookedDate = parseISO(startISO);
    setCurrentMonth(startOfMonth(bookedDate));
    setSelectedDay(bookedDate);
    setSelectedResourceId(assetId);
  }

  
  function renderBadge(status: Booking['status']) {
    return <span className={getStatusBadgeClass(status)}>{statusLabel(status)}</span>;
  }

  function canCancel(booking: Booking): boolean {
    if (booking.status !== 'upcoming') return false;
    if (isPrivileged) return true;
    return booking.userId === currentUserId;
  }

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Resource Booking</h2>
          <p className="page-subtitle">
            Schedule and manage bookable assets — meeting rooms, projectors, and shared equipment
          </p>
        </div>
        <div className="page-actions">
          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              gap: 2,
            }}
          >
            <button
              className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '5px 12px' }}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays size={14} />
              Calendar
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '5px 12px' }}
              onClick={() => setViewMode('list')}
            >
              <List size={14} />
              List
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setFormError(''); setShowModal(true); }}>
            <Plus size={16} />
            New Booking
          </button>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 14,
        }}
      >
        {/* Total */}
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CalendarCheck size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Total Bookings</div>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Clock size={18} color="var(--info)" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.upcoming}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Upcoming</div>
            </div>
          </div>
        </div>

        {/* Ongoing */}
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Loader2 size={18} color="var(--teal)" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.ongoing}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Ongoing</div>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} color="var(--success)" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.completed}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Completed</div>
            </div>
          </div>
        </div>

        {/* Cancelled */}
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'rgba(100,116,139,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <XCircle size={18} color="#94A3B8" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.cancelled}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Resource Selector ── */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <BookOpen size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Select Resource:</span>
          </div>
          <select
            className="form-select"
            style={{ maxWidth: 340, flex: 1 }}
            value={selectedResourceId}
            onChange={(e) => { setSelectedResourceId(e.target.value); setSelectedDay(null); }}
          >
            {bookableAssets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.tag} ({a.location})
              </option>
            ))}
          </select>
          {selectedResourceId && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(() => {
                const asset = getAssetById(selectedResourceId);
                if (!asset) return null;
                return (
                  <>
                    <span className="badge badge-available" style={{ fontSize: '0.75rem' }}>
                      {asset.location}
                    </span>
                    <span
                      className={`badge badge-${asset.status}`}
                      style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                    >
                      {asset.status}
                    </span>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ── Views ── */}
      {viewMode === 'calendar' ? (
        <CalendarView
          currentMonth={currentMonth}
          calendarDays={calendarDays}
          dayHeaders={dayHeaders}
          today={today}
          eventDays={eventDays}
          selectedDay={selectedDay}
          selectedDayBookings={selectedDayBookings}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDayClick={handleDayClick}
          onCancel={handleCancelBooking}
          canCancel={canCancel}
          renderBadge={renderBadge}
        />
      ) : (
        <ListView
          bookings={bookings}
          onCancel={handleCancelBooking}
          canCancel={canCancel}
          renderBadge={renderBadge}
        />
      )}

      {/* ── New Booking Modal ── */}
      {showModal && (
        <NewBookingModal
          form={form}
          formError={formError}
          bookableAssets={bookableAssets}
          bookings={bookings}
          onChange={handleFormChange}
          onSubmit={handleSubmitBooking}
          onClose={() => { setShowModal(false); setFormError(''); }}
        />
      )}
    </div>
  );
};

// ─── Calendar View ─────────────────────────────────────────────────────────────

interface CalendarViewProps {
  currentMonth: Date;
  calendarDays: Date[];
  dayHeaders: string[];
  today: Date;
  eventDays: Set<string>;
  selectedDay: Date | null;
  selectedDayBookings: Booking[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: Date) => void;
  onCancel: (id: string) => void;
  canCancel: (b: Booking) => boolean;
  renderBadge: (status: Booking['status']) => React.ReactNode;
}

function CalendarView({
  currentMonth,
  calendarDays,
  dayHeaders,
  today,
  eventDays,
  selectedDay,
  selectedDayBookings,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onCancel,
  canCancel,
  renderBadge,
}: CalendarViewProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: selectedDay ? '1fr 340px' : '1fr',
        gap: 20,
        alignItems: 'start',
      }}
    >
      {/* Calendar card */}
      <div className="card">
        {/* Month navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onPrevMonth}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onNextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="calendar-grid" style={{ marginBottom: 4 }}>
          {dayHeaders.map((h) => (
            <div key={h} className="cal-day-header">{h}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="calendar-grid">
          {calendarDays.map((day, idx) => {
            const dayStr    = format(day, 'yyyy-MM-dd');
            const inMonth   = isSameMonth(day, currentMonth);
            const isToday   = isSameDay(day, today);
            const hasEvent  = eventDays.has(dayStr);
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            let cls = 'cal-day';
            if (isToday)    cls += ' today';
            if (hasEvent)   cls += ' has-event';

            return (
              <div
                key={idx}
                className={cls}
                onClick={() => onDayClick(day)}
                style={{
                  opacity: inMonth ? 1 : 0.25,
                  cursor: inMonth ? 'pointer' : 'default',
                  border: isSelected
                    ? '1.5px solid var(--accent)'
                    : '1.5px solid transparent',
                  background: isSelected ? 'var(--accent-light)' : undefined,
                  color: isSelected ? 'var(--accent)' : undefined,
                  fontWeight: isSelected ? 700 : undefined,
                  flexDirection: 'column',
                  gap: 2,
                  aspectRatio: '1',
                  minHeight: 42,
                }}
              >
                <span style={{ fontSize: '0.82rem' }}>{format(day, 'd')}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Has bookings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 16, height: 16, borderRadius: 4,
                background: 'var(--accent-light)', border: '1px solid var(--accent)',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Selected day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 16, height: 16, borderRadius: 4,
                background: 'var(--accent-light)',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Today</span>
          </div>
        </div>
      </div>

      {/* Day side panel */}
      {selectedDay && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {format(selectedDay, 'EEEE, dd MMM yyyy')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-icon-sm"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => {/* close handled by clicking same day */}}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click day to toggle</span>
            </button>
          </div>

          {selectedDayBookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px' }}>
              <div className="empty-icon">
                <CalendarDays size={24} />
              </div>
              <p className="empty-title" style={{ fontSize: '0.9rem' }}>No bookings</p>
              <p className="empty-desc" style={{ fontSize: '0.78rem' }}>
                No bookings for this resource on the selected day.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {selectedDayBookings.map((booking, i) => {
                const user = getUserById(booking.userId);
                const dept = departments.find((d) => d.id === booking.departmentId);
                return (
                  <div
                    key={booking.id}
                    style={{
                      padding: '14px 18px',
                      borderBottom:
                        i < selectedDayBookings.length - 1
                          ? '1px solid var(--border-subtle)'
                          : 'none',
                    }}
                  >
                    {/* Time + badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: 'var(--accent)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                      >
                        <Clock size={13} />
                        {format(parseISO(booking.startTime), 'hh:mm a')}
                        {' – '}
                        {format(parseISO(booking.endTime), 'hh:mm a')}
                      </div>
                      {renderBadge(booking.status)}
                    </div>

                    {/* Purpose */}
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        marginBottom: 6,
                      }}
                    >
                      {booking.purpose}
                    </p>

                    {/* User & dept */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {user?.name ?? '—'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {dept?.name ?? '—'}
                        </span>
                      </div>
                    </div>

                    {/* Cancel */}
                    {canCancel(booking) && (
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
                        onClick={() => onCancel(booking.id)}
                      >
                        <XCircle size={13} />
                        Cancel Booking
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── List View ─────────────────────────────────────────────────────────────────

interface ListViewProps {
  bookings: Booking[];
  onCancel: (id: string) => void;
  canCancel: (b: Booking) => boolean;
  renderBadge: (status: Booking['status']) => React.ReactNode;
}

function ListView({ bookings, onCancel, canCancel, renderBadge }: ListViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterResource, setFilterResource] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterStatus !== 'all' && b.status !== filterStatus) return false;
      if (filterResource !== 'all' && b.assetId !== filterResource) return false;
      const asset = getAssetById(b.assetId);
      const user  = getUserById(b.userId);
      const q = search.toLowerCase();
      if (q) {
        if (
          !b.purpose.toLowerCase().includes(q) &&
          !asset?.name.toLowerCase().includes(q) &&
          !user?.name.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, filterStatus, filterResource, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filters */}
      <div className="filter-row">
        <div className="search-bar" style={{ maxWidth: 300 }}>
          <AlertCircle size={15} color="var(--text-muted)" />
          <input
            placeholder="Search bookings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterResource}
          onChange={(e) => setFilterResource(e.target.value)}
        >
          <option value="all">All Resources</option>
          {bookableAssets.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Booked By</th>
              <th>Department</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state" style={{ padding: '40px 0' }}>
                    <div className="empty-icon">
                      <CalendarDays size={24} />
                    </div>
                    <p className="empty-title">No bookings found</p>
                    <p className="empty-desc">Adjust your filters or create a new booking.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((booking) => {
                const asset = getAssetById(booking.assetId);
                const user  = getUserById(booking.userId);
                const dept  = departments.find((d) => d.id === booking.departmentId);
                const startDate = parseISO(booking.startTime);
                const endDate   = parseISO(booking.endTime);

                return (
                  <tr key={booking.id}>
                    <td>
                      <div className="td-primary">{asset?.name ?? '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {asset?.tag}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent), #A855F7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.68rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                          }}
                        >
                          {user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {user?.name ?? '—'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{dept?.name ?? '—'}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                        {format(startDate, 'dd MMM yyyy')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {format(startDate, 'EEEE')}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {format(startDate, 'hh:mm a')}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {format(endDate, 'hh:mm a')}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 200,
                        }}
                      >
                        {booking.purpose}
                      </span>
                    </td>
                    <td>{renderBadge(booking.status)}</td>
                    <td>
                      {canCancel(booking) ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onCancel(booking.id)}
                        >
                          <XCircle size={13} />
                          Cancel
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── New Booking Modal ─────────────────────────────────────────────────────────

interface NewBookingModalProps {
  form: BookingFormState;
  formError: string;
  bookableAssets: typeof assets;
  bookings: Booking[];
  onChange: (field: keyof BookingFormState, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

function NewBookingModal({
  form,
  formError,
  bookableAssets,
  bookings,
  onChange,
  onSubmit,
  onClose,
}: NewBookingModalProps) {
  // Preview: existing bookings for selected asset on selected date
  const existingOnDay = useMemo(() => {
    if (!form.assetId || !form.date) return [];
    return bookings.filter(
      (b) =>
        b.assetId === form.assetId &&
        b.status !== 'cancelled' &&
        b.startTime.startsWith(form.date),
    );
  }, [form.assetId, form.date, bookings]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 'var(--radius-md)',
                background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CalendarDays size={16} color="var(--accent)" />
            </div>
            <span className="modal-title">New Booking</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Resource */}
          <div className="form-group">
            <label className="form-label">Resource *</label>
            <select
              className="form-select"
              value={form.assetId}
              onChange={(e) => onChange('assetId', e.target.value)}
            >
              <option value="">Select a bookable resource…</option>
              {bookableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.tag} ({a.location})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              className="form-input"
              value={form.date}
              onChange={(e) => onChange('date', e.target.value)}
            />
          </div>

          {/* Time row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                className="form-input"
                value={form.startTime}
                onChange={(e) => onChange('startTime', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                className="form-input"
                value={form.endTime}
                onChange={(e) => onChange('endTime', e.target.value)}
              />
            </div>
          </div>

          {/* Purpose */}
          <div className="form-group">
            <label className="form-label">Purpose *</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Sprint planning, client demo, team sync…"
              value={form.purpose}
              onChange={(e) => onChange('purpose', e.target.value)}
              rows={3}
            />
          </div>

          {/* Error */}
          {formError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '10px 14px',
                background: 'var(--danger-light)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <AlertCircle size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--danger)', lineHeight: 1.5 }}>
                {formError}
              </span>
            </div>
          )}

          {/* Existing bookings preview on that day */}
          {existingOnDay.length > 0 && (
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '8px 14px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Existing bookings on {form.date ? format(parseISO(form.date + 'T00:00:00'), 'dd MMM yyyy') : '—'}
              </div>
              {existingOnDay.map((b) => {
                const who = getUserById(b.userId);
                const startISO = buildISO(form.date, form.startTime);
                const endISO   = buildISO(form.date, form.endTime);
                const overlaps = form.startTime && form.endTime
                  ? hasOverlap(startISO, endISO, b.startTime, b.endTime)
                  : false;
                return (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 14px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: overlaps ? 'rgba(239,68,68,0.06)' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {overlaps && <AlertCircle size={13} color="var(--danger)" />}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {format(parseISO(b.startTime), 'hh:mm a')} – {format(parseISO(b.endTime), 'hh:mm a')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        · {b.purpose}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {who?.name}
                      </span>
                      {overlaps && (
                        <span className="badge badge-cancelled" style={{ fontSize: '0.68rem' }}>
                          Conflict
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSubmit}>
            <CalendarCheck size={15} />
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResourceBooking;
