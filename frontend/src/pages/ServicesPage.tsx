import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Clock, CheckCircle2, AlertCircle, Plus,
  ShieldCheck, Car, Shirt, Heart
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useDatabase } from '../context/DatabaseContext';

export const ServicesPage: React.FC = () => {
  const { services, serviceRequests, createServiceRequest, updateServiceStatus } = useDatabase();

  const [selectedService, setSelectedService] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    await createServiceRequest(1, selectedService.id, notes);
    setIsSubmitting(false);
    setSelectedService(null);
    setNotes('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hotel Services & Wellness</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bespoke Ayurvedic spa, airport chauffeur transfers, express dry cleaning, and concierge requests.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <Card key={svc.id} hover className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {svc.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {svc.duration_minutes} mins
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
              <Button variant="primary" size="sm" onClick={() => setSelectedService(svc)}>
                Request Service
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Service Requests Log */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Active Service Requests Log</h2>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {serviceRequests.map((req) => (
            <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{req.service_name}</span>
                  <Badge variant={req.status.toLowerCase()} dot>{req.status}</Badge>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Guest: {req.customer_name || 'Rahul Sharma'} • Booking #{req.booking_number || 'SH-2026-00101'}
                </div>
                {req.notes && <div className="text-xs text-slate-500 mt-1 italic">"{req.notes}"</div>}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  ₹{Number(req.service_price).toLocaleString('en-IN')}
                </span>
                {req.status !== 'Completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateServiceStatus(req.id, 'Completed')}
                  >
                    Mark Done
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Request Service Modal */}
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name}
        subtitle={`Tariff: ₹${Number(selectedService?.price).toLocaleString('en-IN')} • Duration: ${selectedService?.duration_minutes} mins`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Special Instructions or Preferred Time"
            placeholder="e.g. Schedule for 4:00 PM today, extra towels requested..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSelectedService(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleRequest} isLoading={isSubmitting}>
              Confirm Request (Bill to Room)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
