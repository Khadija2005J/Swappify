import { useEffect, useMemo, useState, useRef } from 'react';
import API from '../api';
import styles from './ChatPanel.module.css';

export default function ChatPanel({ user, openWithUserId, openWithUserName }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(false);
  const messagesEndRef = useRef(null);

  const sortMessagesByTimestamp = (items = []) => {
    return [...items].sort((a, b) => {
      const timeA = Date.parse(a?.created_at || '') || 0;
      const timeB = Date.parse(b?.created_at || '') || 0;
      if (timeA !== timeB) return timeA - timeB;

      const idA = Number(a?.id);
      const idB = Number(b?.id);
      if (!Number.isNaN(idA) && !Number.isNaN(idB)) return idA - idB;

      return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
    });
  };

  const orderedMessages = useMemo(() => sortMessagesByTimestamp(messages), [messages]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper: ensure conversation has an `other_user` object with id/name
  const getOtherUser = (conv) => {
    if (!conv) return { id: null, name: 'Unknown' };
    if (conv.other_user) return conv.other_user;
    if (conv.other_user_name && conv.other_user_id) return { id: conv.other_user_id, name: conv.other_user_name };
    // try participants array
    if (Array.isArray(conv.participants) && user) {
      const other = conv.participants.find(p => p.id !== user.id);
      if (other) return other;
    }
    // try to find an `other_user`-like field
    const candidate = conv.users?.find(u => u.id !== user?.id) || null;
    if (candidate) return candidate;
    return { id: null, name: openWithUserName || 'Conversation' };
  };

  // If parent requests opening a conversation with a specific user id,
  // ensure the conversation exists and select it.
  useEffect(() => {
    if (!openWithUserId) return;

    const openConversation = async () => {
      try {
        const res = await API.post(`/conversations/start/${openWithUserId}`);
        const conv = res.data;
        if (conv) {
          // normalize other_user
          conv.other_user = getOtherUser(conv);
          // include in conversations list if missing
          setConversations(prev => {
            const exists = prev.find(c => c.id === conv.id);
            return exists ? prev : [conv, ...prev];
          });
          setSelectedConversation(conv);
        }
      } catch (err) {
        console.error('openConversation', err);
      }
    };

    openConversation();
  }, [openWithUserId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await API.get('/conversations');
      const list = Array.isArray(res.data) ? res.data : [];
      setConversations(list.map(c => ({ ...c, other_user: getOtherUser(c) })));
    } catch (err) {
      console.error('loadConversations', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const res = await API.get(`/conversations/${conversationId}/messages`);
      setMessages(sortMessagesByTimestamp(res.data || []));
    } catch (err) {
      console.error('loadMessages', err);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    const body = messageText.trim();
    const tempMessage = {
      id: `tmp-${Date.now()}`,
      sender_id: user.id,
      body,
      sender: user,
      created_at: new Date().toISOString(),
      pending: true,
      read_at: null,
    };

    setMessages(prev => sortMessagesByTimestamp([...prev, tempMessage]));
    setMessageText('');

    try {
      await API.post(`/conversations/${selectedConversation.id}/messages`, { body });
      // reload messages to get server canonical data
      loadMessages(selectedConversation.id);
    } catch (err) {
      console.error('sendMessage', err);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  if (!selectedConversation) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <i className="fa-solid fa-messages" style={{fontSize: '18px', color: 'var(--chat-primary)'}}></i>
          <h3 className={styles.title}>Messages</h3>
        </div>

        <div className={styles.conversationsList}>
          {loadingConversations ? (
            <div className={styles.emptyText}>
              <i className="fa-solid fa-spinner" style={{animation: 'spin 1s linear infinite', fontSize: '24px', marginBottom: '12px', display: 'block'}}></i>
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className={styles.emptyText}>
              <i className="fa-solid fa-inbox" style={{fontSize: '48px', opacity: 0.3, marginBottom: '12px', display: 'block'}}></i>
              <p style={{margin: 0}}>No conversations yet</p>
              <small style={{fontSize: '12px', opacity: 0.6}}>Start chatting with someone!</small>
            </div>
          ) : (
            conversations.map(conv => {
              const otherUser = getOtherUser(conv);
              const initial = otherUser.name?.charAt(0).toUpperCase() || '?';
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={styles.conversationItem}
                >
                  <div className={styles.conversationMeta}>
                    <div className={styles.avatarPlaceholder}>{initial}</div>
                    <div>
                      <div className={styles.conversationName}>{otherUser.name}</div>
                      {conv.last_message && (
                        <div className={styles.lastMessage}>
                          {conv.last_message.body.substring(0, 50)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => setSelectedConversation(null)} className={styles.backBtn}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
          <div className={styles.chatTitleArea}>
          <div className={styles.avatarPlaceholder}>
            {(selectedConversation?.other_user?.name || getOtherUser(selectedConversation).name)?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className={styles.chatTitle}>{selectedConversation?.other_user?.name || getOtherUser(selectedConversation).name}</div>
        </div>
      </div>

      <div className={styles.messagesContainer} role="log" aria-live="polite">
        {orderedMessages.length === 0 ? (
          <div className={styles.emptyText}>
            <i className="fa-solid fa-comment-dots" style={{fontSize: '48px', opacity: 0.2, marginBottom: '12px', display: 'block'}}></i>
            <p style={{margin: 0}}>No messages yet</p>
            <small style={{fontSize: '12px', opacity: 0.5}}>Start the conversation!</small>
          </div>
        ) : (
          orderedMessages.map(msg => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.sender_id === user.id ? styles.messageSent : styles.messageReceived}`}
            >
              <div className={styles.messageBody}>{msg.body}</div>
              <div className={styles.messageMetaRow}>
                <div className={styles.messageMeta}>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                {msg.sender_id === user.id && (
                  <div className={styles.messageSeenMeta}>
                    {msg.pending ? (
                      <span className={styles.messageSending}>Sending...</span>
                    ) : msg.read_at ? (
                      <span className={styles.messageSeen}>✓✓ Seen</span>
                    ) : (
                      <span className={styles.messageSentStatus}>✓ Sent</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          aria-label="Your message"
          type="text"
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button onClick={sendMessage} className={styles.sendBtn} disabled={!messageText.trim()}>
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}
