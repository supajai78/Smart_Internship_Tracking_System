import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;

    const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto animate-scale-up border border-surface-200`}>
                <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-surface-200 rounded-t-2xl z-10">
                    <h3 className="text-lg font-bold text-surface-800">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl transition-colors text-surface-400 hover:text-surface-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
