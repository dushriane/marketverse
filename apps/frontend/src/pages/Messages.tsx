import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMessageStore, Message } from '../stores/messageStore';
import { useSearchParams } from 'react-router-dom';

export function Messages() {
  const { user } = useAuthStore();
  const { messages, isLoading, fetchMessages, sendMessage } = useMessageStore();
  const [searchParams] = useSearchParams();
  
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Initial load or param check
  useEffect(() => {
    fetchMessages();
    const partner = searchParams.get('partner');
    if (partner) setSelectedPartnerId(partner);

    const interval = setInterval(fetchMessages, 10000); 
    return () => clearInterval(interval);
  }, [fetchMessages, searchParams]);

  // Group messages by conversation partner
  const conversations = useMemo(() => {
    if (!user) return {};
    const groups: Record<string, { name: string, msgs: Message[] }> = {};

    messages.forEach(m => {
        const isMe = m.senderId === user.userId;
        const partnerId = isMe ? m.receiverId : m.senderId;
        
        // Try to find a name from ANY message where partner was sender
        const partnerName = !isMe && m.sender?.fullName ? m.sender.fullName : (m.sender?.email || 'Unknown User');

        if (!groups[partnerId]) {
            groups[partnerId] = { name: partnerName, msgs: [] };
        }
        // If we found a better name (not Unknown) and stored one is Unknown, update it
        if (!isMe && groups[partnerId].name === 'Unknown User' && partnerName !== 'Unknown User') {
            groups[partnerId].name = partnerName;
        }

        groups[partnerId].msgs.push(m);
    });

    // Sort messages in each group
    Object.keys(groups).forEach(key => {
        groups[key].msgs.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
    
    return groups;
  }, [messages, user]);

  const activeConversation = selectedPartnerId ? conversations[selectedPartnerId] : null;

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPartnerId || !replyText.trim()) return;
      try {
          await sendMessage(selectedPartnerId, replyText);
          setReplyText('');
      } catch (e) {
          alert('Failed to send');
      }
  };

  if (!user) return <div className="p-8">Please login</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Messages</h1>
    
      <div className="bg-white shadow rounded-lg overflow-hidden h-full flex border border-gray-200">
        
        {/* Sidebar List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
            {Object.keys(conversations).length === 0 ? (
                <div className="p-4 text-gray-500">No conversations yet.</div>
            ) : (
                Object.entries(conversations).map(([partnerId, data]) => {
                    const lastMsg = data.msgs[data.msgs.length - 1];
                    return (
                        <div 
                            key={partnerId}
                            onClick={() => setSelectedPartnerId(partnerId)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${selectedPartnerId === partnerId ? 'bg-indigo-50 border-indigo-200' : ''}`}
                        >
                            <h3 className="font-semibold text-gray-800">{data.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{lastMsg.content}</p>
                            <span className="text-xs text-gray-400">{new Date(lastMsg.createdAt).toLocaleDateString()}</span>
                        </div>
                    );
                })
            )}
        </div>

        {/* Chat Window */}
        <div className="w-2/3 flex flex-col bg-white">
            {activeConversation ? (
                <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="font-bold text-gray-700">{activeConversation.name}</h2>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                        {activeConversation.msgs.map((m) => {
                            const isMe = m.senderId === user.userId;
                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 text-sm shadow-sm ${
                                        isMe 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                                    }`}>
                                        <p>{m.content}</p>
                                        <div className={`text-xs mt-1 text-opacity-70 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input 
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                            <button 
                                type="submit"
                                disabled={!replyText.trim() || isLoading}
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50">
                    Select a conversation to start chatting
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
