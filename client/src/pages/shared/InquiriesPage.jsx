import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MessageSquare, Send, ArrowLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { inquiryApi } from '../../api/index.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { formatRelativeTime } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Inquiries List Page  —  /inquiries
   ═══════════════════════════════════════════════════════════════════════════ */
export const InquiriesPage = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery(
    ['inquiries'],
    () => inquiryApi.getAll().then((r) => r.data),
    { refetchInterval: 15000 }
  );

  const inquiries = data?.inquiries || [];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Direct conversations with developers
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Browse developer profiles and use the Contact button to start a conversation."
            action={
              <Link to="/developers" className="btn-primary">
                Find Developers
              </Link>
            }
          />
        ) : (
          <div className="card divide-y divide-gray-100 dark:divide-white/[0.06]">
            {inquiries.map((inq) => {
              const other = user?.role === 'client' ? inq.developer : inq.client;
              const lastMsg = inq.messages?.[inq.messages.length - 1];
              const unread  = inq.messages?.filter(
                (m) => m.sender?._id !== user?._id && m.sender !== user?._id && !m.isRead
              ).length || 0;

              return (
                <Link
                  key={inq._id}
                  to={`/inquiries/${inq._id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <div className="relative shrink-0">
                    <Avatar src={other?.avatar} name={other?.name} size="md" />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        'text-sm truncate',
                        unread > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'
                      )}>
                        {other?.name}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatRelativeTime(inq.lastMessageAt)}
                      </span>
                    </div>
                    {inq.subject && (
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate mt-0.5">{inq.subject}</p>
                    )}
                    {lastMsg && (
                      <p className="text-xs text-gray-400 truncate mt-0.5 line-clamp-1">{lastMsg.content}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Single Inquiry Thread  —  /inquiries/:id
   ═══════════════════════════════════════════════════════════════════════════ */
export const InquiryThreadPage = () => {
  const { id }    = useParams();
  const { user }  = useAuth();
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);
  const [text, setText] = useState('');

  const { data, isLoading } = useQuery(
    ['inquiry', id],
    () => inquiryApi.getById(id).then((r) => r.data),
    { refetchInterval: 5000 }
  );

  const inquiry = data?.inquiry;
  const messages = inquiry?.messages || [];
  const other = user?.role === 'client' ? inquiry?.developer : inquiry?.client;

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Invalidate list to clear unread badge
  useEffect(() => {
    queryClient.invalidateQueries(['inquiries']);
  }, [data]);

  const replyMutation = useMutation(
    () => inquiryApi.reply(id, text.trim()),
    {
      onSuccess: () => {
        setText('');
        queryClient.invalidateQueries(['inquiry', id]);
        queryClient.invalidateQueries(['inquiries']);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to send'),
    }
  );

  const handleSend = () => {
    if (!text.trim()) return;
    replyMutation.mutate();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) return (
    <AppLayout>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </AppLayout>
  );

  if (!inquiry) return (
    <AppLayout>
      <div className="text-center py-20 text-gray-500">Conversation not found.</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-white/[0.08]">
          <Link
            to="/inquiries"
            className="p-2 -ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Avatar src={other?.avatar} name={other?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{other?.name}</p>
            {inquiry.subject && (
              <p className="text-xs text-gray-400 truncate">{inquiry.subject}</p>
            )}
          </div>
          {/* Link to developer profile */}
          {user?.role === 'client' && inquiry.developer && (
            <Link
              to={`/developers/${inquiry.developer._id || inquiry.developer}`}
              className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white underline underline-offset-2 transition-colors shrink-0"
            >
              View Profile
            </Link>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No messages yet.</p>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            const senderName = msg.sender?.name || (isMe ? user?.name : other?.name);
            const senderAvatar = msg.sender?.avatar || (isMe ? user?.avatar : other?.avatar);

            return (
              <div key={msg._id || i} className={cn('flex gap-2.5', isMe && 'flex-row-reverse')}>
                <Avatar src={senderAvatar} name={senderName} size="sm" className="shrink-0 mt-0.5" />
                <div className={cn('max-w-[75%] flex flex-col', isMe && 'items-end')}>
                  <div className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    isMe
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-1">
                    {formatRelativeTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/[0.08]">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="input flex-1 resize-none min-h-[42px] max-h-32 scrollbar-thin"
            />
            <Button
              variant="primary"
              className="h-[42px] px-4 shrink-0"
              loading={replyMutation.isLoading}
              disabled={!text.trim()}
              onClick={handleSend}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Shift+Enter for new line · Enter to send
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
