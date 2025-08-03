// src/components/Modal.jsx
function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-96 overflow-y-auto">
          {children}
          
          {/* Close button */}
          <div className="px-6 pb-4">
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  export default Modal