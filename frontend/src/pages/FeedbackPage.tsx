import React, { useState } from 'react';
import { Star, MessageSquare, Send, Sparkles, Plus, Search, Filter, Loader2, ThumbsUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import {
  useFeedback,
  useMyFeedback,
  useFeedbackSummary,
  useCreateFeedback,
  useReplyFeedback,
  FeedbackItem
} from '../hooks/useSupport';

export const FeedbackPage: React.FC = () => {
  const { user, role } = useAuth();
  const { bookings } = useDatabase();
  const isCustomer = role === 'CUSTOMER';

  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Rate Stay Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | ''>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');
  const [submitError, setSubmitError] = useState('');

  // TanStack Query Hooks
  const { data: allFeedbacks = [], isLoading: isAllLoading } = useFeedback({
    rating: ratingFilter || undefined,
    search: searchQuery || undefined,
  });
  const { data: myFeedbacks = [], isLoading: isMyLoading } = useMyFeedback();
  const { data: summary } = useFeedbackSummary();

  const createFeedbackMutation = useCreateFeedback();
  const replyFeedbackMutation = useReplyFeedback();

  // If customer, show their feedback or toggleable list
  const feedbacks: FeedbackItem[] = isCustomer ? myFeedbacks : allFeedbacks;
  const isLoading = isCustomer ? isMyLoading : isAllLoading;

  const handleSendReply = async (feedbackId: number) => {
    if (!replyText.trim()) return;
    try {
      await replyFeedbackMutation.mutateAsync({ id: feedbackId, response: replyText.trim() });
      setActiveReplyId(null);
      setReplyText('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post response');
    }
  };

  const handleCreateFeedback = async () => {
    if (!selectedBookingId) {
      setSubmitError('Please select a booking.');
      return;
    }
    if (!newComment.trim()) {
      setSubmitError('Please write a brief comment about your experience.');
      return;
    }
    setSubmitError('');
    try {
      await createFeedbackMutation.mutateAsync({
        booking_id: Number(selectedBookingId),
        rating: newRating,
        comment: newComment.trim(),
      });
      setIsRateModalOpen(false);
      setSelectedBookingId('');
      setNewComment('');
      setNewRating(5);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit feedback.');
    }
  };

  // Find completed or eligible bookings for the rate modal
  const eligibleBookings = bookings.filter(
    (b) => b.status === 'Checked-out' || b.status === 'Completed' || b.status === 'Checked-in' || b.status === 'Confirmed'
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Guest Reviews & Sentiment</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor verified guest impressions, service ratings, and post managerial responses.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsRateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Rate Your Stay
        </Button>
      </div>

      {/* Authoritative Aggregate Analytics Bar */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center gap-6">
            <div className="text-center shrink-0">
              <div className="text-4xl font-black text-slate-900 dark:text-white">
                {summary.average_rating > 0 ? summary.average_rating.toFixed(1) : '5.0'}
              </div>
              <div className="flex items-center justify-center gap-1 text-amber-500 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(summary.average_rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400">Average Rating</div>
            </div>
            <div className="border-l border-slate-100 dark:border-white/5 pl-6 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Verified Guest Reviews</div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {summary.total_feedback}
              </div>
              <p className="text-[11px] text-slate-400">Authoritative database aggregation</p>
            </div>
          </Card>

          {/* Star Distribution Visualizer */}
          <Card className="p-6 md:col-span-2 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Rating Distribution</div>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.rating_distribution?.[stars.toString()] || 0;
              const total = summary.total_feedback || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8 flex items-center gap-1 text-slate-600 dark:text-slate-400 font-semibold">
                    {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-mono text-[11px]">{count}</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Filters & Search Row */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant={ratingFilter === null ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setRatingFilter(null)}
          >
            All Ratings
          </Button>
          {[5, 4, 3, 2, 1].map((r) => (
            <Button
              key={r}
              variant={ratingFilter === r ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setRatingFilter(r)}
            >
              {r} ★
            </Button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Feedbacks List */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-slate-500 mt-2">Loading feedback...</p>
        </Card>
      ) : feedbacks.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 text-sm">
          No feedback available.
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <Card key={fb.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      fb.customer_avatar ||
                      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
                    }
                    alt={fb.customer_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{fb.customer_name}</h3>
                    <div className="text-xs text-slate-400">
                      {fb.hotel_name} • Ref: {fb.booking_number || `#${fb.booking_id}`} •{' '}
                      {fb.created_at?.slice(0, 10)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                "{fb.comments || fb.comment}"
              </p>

              {fb.staff_response ? (
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-xs">
                  <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                    StayHive Management Response:
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{fb.staff_response}</p>
                </div>
              ) : !isCustomer ? (
                <div>
                  {activeReplyId === fb.id ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Write executive reply to guest..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveReplyId(null)}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSendReply(fb.id)}
                          isLoading={replyFeedbackMutation.isPending}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Post Response
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setActiveReplyId(fb.id)}>
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Respond to Guest
                    </Button>
                  )}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {/* Guest Feedback Submission Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title="Rate Your Stay Experience"
        subtitle="Share your authentic thoughts on luxury, comfort, and service quality."
        maxWidth="md"
      >
        <div className="space-y-5">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Booking
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(Number(e.target.value))}
            >
              <option value="">-- Choose verified reservation --</option>
              {eligibleBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booking_number} ({b.hotel_name || 'StayHive Grand'}) - {b.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-slate-900 dark:text-white text-sm">
                {newRating === 5 ? 'Exceptional' : newRating === 4 ? 'Very Good' : newRating === 3 ? 'Average' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Your Review & Comments
            </label>
            <textarea
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="What made your stay special? Mention room comfort, dining, or staff assistance..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsRateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateFeedback}
              isLoading={createFeedbackMutation.isPending}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
