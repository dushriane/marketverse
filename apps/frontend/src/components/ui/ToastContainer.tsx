import { useNotificationStore } from '../../stores/notificationStore';

export function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-3 rounded-md shadow-lg text-white text-sm font-medium animate-fade-in flex items-center justify-between min-w-[250px]
            ${toast.type === 'success' ? 'bg-green-600' : 
              toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          <span>{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)} 
            className="ml-3 font-bold opacity-70 hover:opacity-100 focus:outline-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
