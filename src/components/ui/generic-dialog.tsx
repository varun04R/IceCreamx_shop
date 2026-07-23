import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function GenericDialog({ open, onOpenChange, title, children, className = 'max-w-lg' }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full ${className} -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl scrollbar-thin`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
