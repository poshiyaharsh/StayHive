import React, { useState } from 'react';
import { Star, MessageSquare, Send, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useDatabase } from '../context/DatabaseContext';

export const FeedbackPage: React.FC = () => {
  const { feedbacks, replyFeedback } = useDatabase();
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = async (feedbackId: number) => {
    if (!replyText.trim()) return;
    await replyFeedback(feedbackId, replyText);
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Guest Reviews & Sentiment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor verified guest impressions, service ratings, and post managerial responses.
        </p>
      </div>

      <div className="space-y-4">
        {feedbacks.map((fb) => (
          <Card key={fb.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={fb.customer_avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                  alt={fb.customer_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{fb.customer_name}</h3>
                  <div className="text-xs text-slate-400">{fb.hotel_name} • {fb.created_at?.slice(0, 10)}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
              "{fb.comments}"
            </p>

            {fb.staff_response ? (
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-xs">
                <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">StayHive Management Response:</div>
                <p className="text-slate-600 dark:text-slate-400">{fb.staff_response}</p>
              </div>
            ) : (
              <div>
                {activeReplyId === fb.id ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Write executive reply to guest..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setActiveReplyId(null)}>Cancel</Button>
                      <Button variant="primary" size="sm" onClick={() => handleSendReply(fb.id)}>
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
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
