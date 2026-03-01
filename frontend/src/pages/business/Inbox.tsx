import { useEffect, useState } from 'react';
import api from '../../api/client';

interface Message {
  id: number;
  sender_id: number;
  subject: string;
  message: string;
  read_status: number;
  created_at: string;
  sender_email?: string;
}

export default function Inbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  useEffect(() => {
    api.get<{ messages: Message[] }>('/business/messages').then((res) => {
      setMessages(res.data.messages ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markRead = (m: Message) => {
    setSelected(m);
    if (!m.read_status) {
      api.patch(`/business/messages/${m.id}/read`).then(() => {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read_status: 1 } : x)));
      });
    }
  };

  if (loading) return <div className="py-12 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gov-blue">Inbox</h1>
      <p className="text-sm text-gray-500">Messages from Tourism Office</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">No messages</li>
            ) : (
              messages.map((m) => (
                <li
                  key={m.id}
                  onClick={() => markRead(m)}
                  className={`cursor-pointer px-4 py-3 hover:bg-gray-50 ${selected?.id === m.id ? 'bg-gov-pale' : ''} ${!m.read_status ? 'font-medium' : ''}`}
                >
                  <p className="text-sm text-gray-900">{m.subject}</p>
                  <p className="text-xs text-gray-500">{m.sender_email ?? 'Admin'} · {new Date(m.created_at).toLocaleDateString()}</p>
                </li>
              ))
            )}
          </ul>
        </div>
        {selected && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="font-medium text-gov-blue">{selected.subject}</h2>
            <p className="mt-1 text-xs text-gray-500">From: {selected.sender_email} · {new Date(selected.created_at).toLocaleString()}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{selected.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
