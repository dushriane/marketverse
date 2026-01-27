import { useEffect } from 'react';
import { useMessageStore } from '../../stores/messageStore';
import { useNavigate } from 'react-router-dom';

export function TopBuyersSidebar() {
    const { topBuyers, fetchTopBuyers } = useMessageStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTopBuyers();
    }, [fetchTopBuyers]);

    const handleMessage = (userId: string) => {
        navigate(`/messages?partner=${userId}`);
    };

    if (topBuyers.length === 0) return null;

    return (
        <div className="bg-white shadow rounded-lg p-4 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers</h3>
            <ul className="divide-y divide-gray-200">
                {topBuyers.map((stat, idx) => (
                    <li key={stat.user.id || idx} className="py-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{stat.user.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{stat.count} purchases (Total: RWF {stat.total.toLocaleString()})</p>
                        </div>
                        <button 
                            onClick={() => handleMessage(stat.user.id)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                            Message
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
