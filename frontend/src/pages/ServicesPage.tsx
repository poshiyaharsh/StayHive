import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Clock, CheckCircle2, AlertCircle, Plus,
  ShieldCheck, Car, Shirt, Heart, Search, Filter,
  Check, X, Play, AlertTriangle, ArrowRight, User
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import {
  useServices,
  useServiceRequests,
  useMyServiceRequests,
  useCreateServiceRequest,
  useUpdateServiceRequestStatus,
  useCancelServiceRequest,
  useCreateService,
  ServiceItem,
  ServiceRequestItem
} from '../hooks/useServices';
import { useMyBookings } from '../hooks/useBookings';

export const ServicesPage: React.FC = () => {
  const { user, role } = useAuth();
  const isCustomer = role === 'CUSTOMER';
  const isStaff = ['ADMIN', 'MANAGER', 'RECEPTION'].includes(role);
  const isAdminOrManager = ['ADMIN', 'MANAGER'].includes(role);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [requestFilterStatus, setRequestFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');

  // Queries
  const { data: services = [], isLoading: servicesLoading } = useServices({
    is_active: isCustomer ? true : undefined,
    search: searchQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
  });

  const { data: myRequests = [], isLoading: myRequestsLoading } = useMyServiceRequests();
  const { data: allRequests = [], isLoading: allRequestsLoading } = useServiceRequests({
    status: requestFilterStatus !== 'all' ? requestFilterStatus : undefined,
  });

  const { data: myBookings = [] } = useMyBookings();
  const activeBooking = myBookings.find(b => b.status === 'Checked-in') || myBookings.find(b => b.status === 'Confirmed') || myBookings[0];

  // Mutations
  const createServiceRequestMutation = useCreateServiceRequest();
  const updateStatusMutation = useUpdateServiceRequestStatus();
  const cancelRequestMutation = useCancelServiceRequest();
  const createServiceMutation = useCreateService();

  // Modal states
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [remarks, setRemarks] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<number | undefined>(undefined);

  // Create new service modal (Admin/Manager)
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Wellness');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('60');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const handleOpenRequestModal = (svc: ServiceItem) => {
    setSelectedService(svc);
    setRemarks('');
    setSelectedBookingId(activeBooking?.id);
  };

  const handleConfirmRequest = async () => {
    if (!selectedService) return;
    const targetBookingId = selectedBookingId || activeBooking?.id;
    if (!targetBookingId) return;

    await createServiceRequestMutation.mutateAsync({
      booking_id: targetBookingId,
      service_id: selectedService.id || selectedService.service_id,
      remarks,
    });
    setSelectedService(null);
    setRemarks('');
  };

  const handleCreateNewService = async () => {
    if (!newServiceName || !newServicePrice) return;
    await createServiceMutation.mutateAsync({
      name: newServiceName,
      category: newServiceCategory,
      price: newServicePrice,
      duration_minutes: parseInt(newServiceDuration) || 60,
      description: newServiceDesc,
      is_available: true,
    });
    setIsNewServiceModalOpen(false);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
  };

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category).filter(Boolean)))];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Bespoke Guest Concierge & Wellness
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hotel Services & Amenities
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Experience Ayurvedic therapies, express garment pressing, chauffeur transfers, and tailored room services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isStaff && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3.5 py-1.5 rounded-xl transition-colors ${
                  activeTab === 'catalog'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Services Catalog
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                  activeTab === 'requests'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Requests Queue
                {allRequests.filter(r => r.request_status === 'pending').length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {allRequests.filter(r => r.request_status === 'pending').length}
                  </span>
                )}
              </button>
            </div>
          )}

          {isAdminOrManager && (
            <Button variant="primary" size="sm" onClick={() => setIsNewServiceModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Service
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {(!isStaff || activeTab === 'catalog') && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, spa, laundry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Services Cards Grid */}
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/40">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">No services available</div>
              <p className="text-xs text-slate-400 mt-1">Try changing your search term or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => (
                <Card key={svc.id} hover className="p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {svc.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {svc.duration_minutes || 60} mins
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{svc.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Tariff</span>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{Number(svc.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {isCustomer && (
                      <Button variant="primary" size="sm" onClick={() => handleOpenRequestModal(svc)}>
                        Request Service
                      </Button>
                    )}
                    {isAdminOrManager && (
                      <Badge variant={svc.is_available ? 'success' : 'default'} dot>
                        {svc.is_available ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Customer's Own Service Requests Tracking */}
          {isCustomer && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">My Service Requests</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Track your pending and fulfilled in-stay requests.</p>
                </div>
                <Badge variant="blue" dot>{myRequests.length} Total Requests</Badge>
              </div>

              {myRequestsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
                  ))}
                </div>
              ) : myRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                  No service requests found. Click "Request Service" above to schedule spa, laundry, or extra amenities.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {myRequests.map((req) => (
                    <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{req.service_name}</span>
                          <Badge variant={req.request_status} dot>{req.status}</Badge>
                          <span className="text-xs text-slate-400 font-mono">#{req.id}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Booking #{req.booking_number} • Requested: {req.request_date ? new Date(req.request_date).toLocaleString() : 'Recent'}
                        </div>
                        {req.notes && <div className="text-xs text-slate-500 dark:text-slate-300 mt-1 italic">"{req.notes}"</div>}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          ₹{Number(req.service_price).toLocaleString('en-IN')}
                        </span>
                        {req.request_status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelRequestMutation.mutate(req.id)}
                            className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Staff Operational Requests Queue View */}
      {isStaff && activeTab === 'requests' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Service Requests Dispatch Board</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time guest requests, concierge fulfillment, and status advancement.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold">
              {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setRequestFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    requestFilterStatus === st
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {allRequestsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          ) : allRequests.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
              No service requests in this queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {allRequests.map((req) => (
                <div key={req.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Service Request #{req.id}
                      </span>
                      <Badge variant={req.request_status} dot>{req.status}</Badge>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {req.service_name}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                      <span><strong>Guest:</strong> {req.customer_name || 'Valued Guest'}</span>
                      <span>•</span>
                      <span><strong>Booking:</strong> #{req.booking_number}</span>
                      <span>•</span>
                      <span><strong>Tariff:</strong> ₹{Number(req.service_price).toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>{new Date(req.requested_at).toLocaleDateString()}</span>
                    </div>

                    {req.notes && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-white/5 inline-block">
                        <strong>Remarks:</strong> "{req.notes}"
                      </div>
                    )}
                  </div>

                  {/* Actions according to Section 10 */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    {req.request_status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'accepted' })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'rejected' })}
                          className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </>
                    )}

                    {req.request_status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'in_progress' })}
                      >
                        <Play className="w-3.5 h-3.5 mr-1" /> Start Service
                      </Button>
                    )}

                    {req.request_status === 'in_progress' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'completed' })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete
                      </Button>
                    )}

                    {['completed', 'cancelled', 'rejected'].includes(req.request_status) && (
                      <span className="text-xs text-slate-400 italic">Terminal State</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Customer Service Request Modal */}
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name || 'Request Hotel Service'}
        subtitle={`Tariff: ₹${Number(selectedService?.price || 0).toLocaleString('en-IN')} • Duration: ${selectedService?.duration_minutes || 60} mins`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Active Booking Context Card */}
          {activeBooking ? (
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-200">
                Active Stay: Booking #{activeBooking.booking_number}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Room: {activeBooking.rooms?.[0]?.room_number || 'Allocated Room'} • {activeBooking.check_in_date} to {activeBooking.check_out_date}
              </div>
              <div className="text-emerald-600 font-semibold mt-1">
                Charges will be linked to room folio upon completion.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-600" />
              You need an active stay to request room services. Please check into your room or contact front desk.
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Special Instructions / Remarks
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Please provide extra towels, scheduled preferred time 5 PM..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSelectedService(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmRequest}
              isLoading={createServiceRequestMutation.isPending}
              disabled={!activeBooking}
            >
              Request Service
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin / Manager New Service Creation Modal */}
      <Modal
        isOpen={isNewServiceModalOpen}
        onClose={() => setIsNewServiceModalOpen(false)}
        title="Add New Hotel Service"
        subtitle="Introduce a new concierge or spa experience to the guest catalog."
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Service Name"
            placeholder="e.g. Deep Tissue Aroma Therapy"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Category
              </label>
              <select
                value={newServiceCategory}
                onChange={(e) => setNewServiceCategory(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Wellness & Spa">Wellness & Spa</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Transport">Transport</option>
                <option value="Concierge">Concierge</option>
                <option value="Dining">Dining</option>
              </select>
            </div>

            <Input
              label="Price (INR)"
              type="number"
              placeholder="e.g. 1500"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
            />
          </div>

          <Input
            label="Duration (Minutes)"
            type="number"
            placeholder="60"
            value={newServiceDuration}
            onChange={(e) => setNewServiceDuration(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide a compelling description of this luxury offering..."
              value={newServiceDesc}
              onChange={(e) => setNewServiceDesc(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsNewServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateNewService}
              isLoading={createServiceMutation.isPending}
            >
              Publish Service
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
