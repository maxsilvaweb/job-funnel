import { useState } from 'react';
import { DateTimeInput } from '@/components/ui/date-time-input';

interface OnHoldCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string, onHoldAt: string) => void;
}

export function OnHoldCommentModal({
  isOpen,
  onClose,
  onConfirm,
}: OnHoldCommentModalProps) {
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-900">
          Add On-Hold Comment
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Please provide a reason and specify when this application was moved to
          on-hold.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <DateTimeInput
            type="date"
            label="Date"
            value={date}
            onChange={setDate}
          />
          <DateTimeInput
            type="time"
            label="Time"
            value={time}
            onChange={setTime}
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Comment
          </label>
          <textarea
            className="w-full rounded-md border border-zinc-300 p-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter comment..."
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const onHoldAt = new Date(`${date}T${time}`).toISOString();
              onConfirm(comment, onHoldAt);
              setComment('');
            }}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
