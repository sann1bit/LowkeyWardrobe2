import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../stores/uiStore';

export function Toast() {
  const { toastMessage, toastVisible, hideToast } = useUIStore();

  return (
    <AnimatePresence>
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-8 left-1/2 bg-black text-white px-7 py-3.5 z-[3000] cursor-pointer shadow-xl"
          onClick={hideToast}
          data-testid="global-toast"
        >
          <span className="text-[12px] uppercase tracking-[0.1em]">{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
