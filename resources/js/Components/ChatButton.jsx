import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default function ChatButton() {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);

    // Load from localStorage on mount
    useEffect(() => {
        loadMessages();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = () => {
        const stored = localStorage.getItem('chat_messages');
        if (stored) {
            const allMessages = JSON.parse(stored);
            const userId = auth.user.id;

            // Get unique users
            const userIds = new Set();
            allMessages.forEach(msg => {
                if (msg.sender_id === userId) userIds.add(msg.receiver_id);
                if (msg.receiver_id === userId) userIds.add(msg.sender_id);
            });

            // Create mock users for demo
            const users = Array.from(userIds).map(id => ({
                id,
                name: `Mitarbeiter ${id}`,
                role: 'employee'
            }));
            setConversations(users);

            // Calculate unread
            const unread = allMessages.filter(m => m.receiver_id === userId && !m.read).length;
            setUnreadCount(unread);
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedUser) return;

        const stored = localStorage.getItem('chat_messages') || '[]';
        const allMessages = JSON.parse(stored);

        const newMsg = {
            id: Date.now(),
            sender_id: auth.user.id,
            receiver_id: selectedUser.id,
            message: newMessage,
            read: false,
            created_at: new Date().toISOString()
        };

        allMessages.push(newMsg);
        localStorage.setItem('chat_messages', JSON.stringify(allMessages));

        setMessages([...messages, newMsg]);
        setNewMessage('');
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        loadConversation(user.id);

        // Mark as read
        const stored = localStorage.getItem('chat_messages') || '[]';
        const allMessages = JSON.parse(stored).map(msg => {
            if (msg.receiver_id === auth.user.id && msg.sender_id === user.id) {
                msg.read = true;
            }
            return msg;
        });
        localStorage.setItem('chat_messages', JSON.stringify(allMessages));
        setUnreadCount(allMessages.filter(m => m.receiver_id === auth.user.id && !m.read).length);
    };

    const loadConversation = (userId) => {
        const stored = localStorage.getItem('chat_messages') || '[]';
        const allMessages = JSON.parse(stored);
        const userMessages = allMessages.filter(
            m => (m.sender_id === auth.user.id && m.receiver_id === userId) ||
                 (m.sender_id === userId && m.receiver_id === auth.user.id)
        ).sort((a, b) => a.id - b.id);
        setMessages(userMessages);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    };

    // Demo users for selection
    const demoUsers = [
        { id: 1, name: 'Max Mustermann', role: 'admin' },
        { id: 2, name: 'Anna Schmidt', role: 'employee' },
        { id: 3, name: 'Tom Weber', role: 'manager' },
    ];

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
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
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Mitarbeiter-Chat</h3>
                        <button
                            onClick={() => { setIsOpen(false); setSelectedUser(null); }}
                            className="hover:bg-primary-700 p-1 rounded"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex">
                        {/* Conversations List */}
                        {!selectedUser && (
                            <div className="w-full flex flex-col">
                                <div className="p-3 border-b border-gray-100">
                                    <p className="text-sm text-gray-500 mb-2">Demo-Chat (lokal gespeichert)</p>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {demoUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => selectUser(user)}
                                            className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chat Conversation */}
                        {selectedUser && (
                            <div className="w-full flex flex-col">
                                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                                        {selectedUser.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{selectedUser.name}</span>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                    {messages.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">Noch keine Nachrichten</p>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isOwn = msg.sender_id === auth.user.id;
                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                                            isOwn
                                                                ? 'bg-primary-600 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                    >
                                                        <p>{msg.message}</p>
                                                        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-gray-500'}`}>
                                                            {formatTime(msg.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-3 border-t border-gray-100">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Nachricht eingeben..."
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
