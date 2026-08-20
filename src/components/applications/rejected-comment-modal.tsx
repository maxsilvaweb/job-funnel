import { useState } from 'react';

interface RejectedCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

export function RejectedCommentModal({
  isOpen,
  onClose,
  onConfirm,
}: RejectedCommentModalProps) {
  const [comment, setComment] = useState('Reason unknown');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-900">
          Add Rejection Reason
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Please provide a reason or comment for why this application was rejected.
        </p>

        <div className="mt-4">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Reason / Comment
          </label>
          <textarea
            className="w-full rounded-md border border-zinc-300 p-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={(e) => {
              if (e.target.value === 'Reason unknown') {
                setComment('');
              }
            }}
            placeholder="Enter reason..."
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
              onConfirm(comment);
              setComment('Reason unknown');
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
