import { useState } from 'react';

interface OnHoldCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

export function OnHoldCommentModal({ isOpen, onClose, onConfirm }: OnHoldCommentModalProps) {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-900">Add On-Hold Comment</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Please provide a reason for moving this application to on-hold.
        </p>
        <textarea
          className="mt-4 w-full rounded-md border border-zinc-300 p-2 text-sm focus:border-emerald-500 focus:outline-none"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter comment..."
        />
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
