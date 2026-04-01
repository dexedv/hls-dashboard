import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

const jsonHeaders = {
    'Accept': 'application/json',
};

export default function ChatButton() {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [allUsers, setAllUsers] = useState([]);
    const [view, setView] = useState('conversations'); // 'conversations' | 'users' | 'chat'
    const messagesEndRef = useRef(null);

    const fetchConversations = async () => {
        try {
            const response = await fetch('/chat', {
                credentials: 'same-origin',
                headers: jsonHeaders,
            });
            if (!response.ok) return;
            const data = await response.json();
            setConversations(data.conversationUsers || []);
            setUnreadCount(data.unreadCount || 0);
        } catch {
            // Network error - silently ignore
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/chat/unread', {
                credentials: 'same-origin',
                headers: jsonHeaders,
            });
            if (!response.ok) return;
            const data = await response.json();
            setUnreadCount(data.unreadCount || 0);
        } catch {
            // Network error - silently ignore
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await fetch(`/chat/conversation/${userId}`, {
                credentials: 'same-origin',
                headers: jsonHeaders,
            });
            if (!response.ok) return;
            const data = await response.json();
            setMessages(data.messages || []);
        } catch {
            // Network error - silently ignore
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await fetch('/chat/users', {
                credentials: 'same-origin',
                headers: jsonHeaders,
            });
            if (!response.ok) return;
            const data = await response.json();
            setAllUsers(data.users || []);
        } catch {
            // Network error - silently ignore
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const response = await fetch('/chat/send', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    receiver_id: selectedUser.id,
                    message: newMessage,
                }),
            });
            if (!response.ok) return;
            setNewMessage('');
            fetchMessages(selectedUser.id);
            fetchConversations();
        } catch {
            // Network error - silently ignore
        }
    };

    const openUserList = () => {
        setView('users');
        fetchAllUsers();
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setMessages([]);
        setView('chat');
    };

    const goBack = () => {
        if (view === 'chat') {
            setSelectedUser(null);
            setMessages([]);
            setView('conversations');
        } else if (view === 'users') {
            setView('conversations');
        }
    };

    const closeChat = () => {
        setIsOpen(false);
        setSelectedUser(null);
        setMessages([]);
        setView('conversations');
    };

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedUser && view === 'chat') {
            fetchMessages(selectedUser.id);
        }
    }, [selectedUser, view]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-polling: refresh unread count every 10s
    useEffect(() => {
        const unreadInterval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(unreadInterval);
    }, []);

    // Auto-polling: refresh messages every 5s when conversation open
    useEffect(() => {
        if (!selectedUser || !isOpen || view !== 'chat') return;
        const msgInterval = setInterval(() => {
            fetchMessages(selectedUser.id);
        }, 5000);
        return () => clearInterval(msgInterval);
    }, [selectedUser, isOpen, view]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => isOpen ? closeChat() : setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center gap-2"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium">Chat</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {view !== 'conversations' && (
                                <button onClick={goBack} className="hover:bg-primary-700 p-1 rounded">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            <h3 className="font-semibold text-lg">
                                {view === 'chat' && selectedUser ? selectedUser.name : view === 'users' ? 'Neues Gespräch' : 'Mitarbeiter-Chat'}
                            </h3>
                        </div>
                        <button onClick={closeChat} className="hover:bg-primary-700 p-1 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex flex-col">

                        {/* View: Conversations List */}
                        {view === 'conversations' && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={openUserList}
                                        className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Neues Gespräch
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {conversations.length > 0 ? (
                                        conversations.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => selectUser(user)}
                                                className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="font-medium">Keine Gespräche</p>
                                            <p className="text-sm mt-1">Starte ein neues Gespräch</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* View: User Selection */}
                        {view === 'users' && (
                            <div className="flex-1 overflow-y-auto">
                                {allUsers.length > 0 ? (
                                    allUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => selectUser(user)}
                                            className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <p>Keine weiteren Benutzer verfügbar</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* View: Chat Conversation */}
                        {view === 'chat' && selectedUser && (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                    {messages.length === 0 && (
                                        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                                            Schreibe die erste Nachricht...
                                        </div>
                                    )}
                                    {messages.map((msg, index) => {
                                        const isOwn = msg.sender_id === auth.user.id;
                                        return (
                                            <div
                                                key={msg.id || index}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                                        isOwn
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                    }`}
                                                >
                                                    <p className="break-words">{msg.message}</p>
                                                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {formatTime(msg.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Nachricht eingeben..."
                                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
