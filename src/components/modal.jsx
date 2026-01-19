// src/components/Modal.jsx
import { Dialog, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';

function Modal({ isOpen, onClose, children }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 border-gray-200">
        {children}
        <DialogFooter>
          <DialogClose
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Modal
