import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  category: string;
}

const clothingSizes = [
  { size: 'XS', chest: '81–86', waist: '61–66', hips: '86–91', shoulder: '38' },
  { size: 'S',  chest: '86–91', waist: '66–71', hips: '91–96', shoulder: '40' },
  { size: 'M',  chest: '91–97', waist: '71–76', hips: '96–102', shoulder: '42' },
  { size: 'L',  chest: '97–102', waist: '76–81', hips: '102–107', shoulder: '44' },
  { size: 'XL', chest: '102–108', waist: '81–86', hips: '107–113', shoulder: '46' },
  { size: 'XXL',chest: '108–114', waist: '86–92', hips: '113–119', shoulder: '48' },
];

const shoesSizes = [
  { eu: '37', uk: '4', us: '6', cm: '23.5' },
  { eu: '38', uk: '5', us: '7', cm: '24.1' },
  { eu: '39', uk: '5.5', us: '7.5', cm: '24.8' },
  { eu: '40', uk: '6', us: '8', cm: '25.4' },
  { eu: '41', uk: '7', us: '9', cm: '26.0' },
  { eu: '42', uk: '8', us: '10', cm: '26.7' },
  { eu: '43', uk: '9', us: '11', cm: '27.3' },
  { eu: '44', uk: '9.5', us: '11.5', cm: '27.9' },
  { eu: '45', uk: '10', us: '12', cm: '28.6' },
  { eu: '46', uk: '11', us: '13', cm: '29.2' },
];

export function SizeGuideModal({ open, onClose, category }: SizeGuideModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[2000]"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-4 top-[10vh] bottom-[10vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[680px] bg-white z-[2001] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#EAEAEA]">
              <div>
                <h2 className="font-serif text-[22px] italic font-light">Size Guide</h2>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999999] mt-0.5">
                  {category === 'shoes' ? 'Footwear' : category === 'accessories' ? 'Accessories' : 'Clothing'}
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-[#F5F5F5] rounded-full">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {category === 'shoes' ? (
                <>
                  <p className="text-[13px] text-[#666666] mb-6 leading-[1.7]">
                    We recommend measuring your foot length while standing. If between sizes, size up.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-[#EAEAEA]">
                          {['EU', 'UK', 'US', 'Foot Length (cm)'].map(h => (
                            <th key={h} className="py-3 px-4 text-left text-[10px] uppercase tracking-[0.15em] text-[#999999] font-normal">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shoesSizes.map((row, i) => (
                          <tr key={row.eu} className={`border-b border-[#F5F5F5] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                            <td className="py-3 px-4 font-medium">{row.eu}</td>
                            <td className="py-3 px-4 text-[#666666]">{row.uk}</td>
                            <td className="py-3 px-4 text-[#666666]">{row.us}</td>
                            <td className="py-3 px-4 text-[#666666]">{row.cm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : category === 'accessories' ? (
                <div className="space-y-6">
                  <p className="text-[13px] text-[#666666] leading-[1.7]">
                    Most accessories are <strong>One Size</strong> and fit the majority of adults. Watches are designed to fit wrist circumferences of <strong>15–20 cm</strong>. Bags and wallets have no size variation.
                  </p>
                  <div className="border border-[#EAEAEA] p-6">
                    <h4 className="text-[12px] uppercase tracking-[0.15em] mb-4">Watch Sizing</h4>
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-[#EAEAEA]">
                          {['Wrist Size', 'Recommended Fit'].map(h => (
                            <th key={h} className="py-2 text-left text-[10px] uppercase tracking-[0.15em] text-[#999999] font-normal">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[['< 15 cm', 'Small case (36–38mm)'], ['15–18 cm', 'Medium case (38–42mm)'], ['> 18 cm', 'Large case (42–46mm)']].map(([wrist, fit]) => (
                          <tr key={wrist} className="border-b border-[#F5F5F5]">
                            <td className="py-3 font-medium">{wrist}</td>
                            <td className="py-3 text-[#666666]">{fit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[13px] text-[#666666] mb-6 leading-[1.7]">
                    Measurements are in <strong>centimetres</strong>. Measure across the widest point of each area. If between sizes, we recommend sizing up for a relaxed fit.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-[#EAEAEA]">
                          {['Size', 'Chest (cm)', 'Waist (cm)', 'Hips (cm)', 'Shoulder (cm)'].map(h => (
                            <th key={h} className="py-3 px-4 text-left text-[10px] uppercase tracking-[0.15em] text-[#999999] font-normal">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {clothingSizes.map((row, i) => (
                          <tr key={row.size} className={`border-b border-[#F5F5F5] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                            <td className="py-3 px-4 font-medium">{row.size}</td>
                            <td className="py-3 px-4 text-[#666666]">{row.chest}</td>
                            <td className="py-3 px-4 text-[#666666]">{row.waist}</td>
                            <td className="py-3 px-4 text-[#666666]">{row.hips}</td>
                            <td className="py-3 px-4 text-[#666666]">{row.shoulder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 border-t border-[#EAEAEA] pt-6">
                    <h4 className="text-[12px] uppercase tracking-[0.15em] mb-3">How to Measure</h4>
                    <ul className="space-y-2 text-[13px] text-[#666666] leading-[1.7]">
                      <li><strong>Chest:</strong> Measure around the fullest part of your chest, under your armpits.</li>
                      <li><strong>Waist:</strong> Measure around your natural waist, above the hip bone.</li>
                      <li><strong>Hips:</strong> Measure around the fullest part of your hips.</li>
                      <li><strong>Shoulder:</strong> Measure from shoulder seam to shoulder seam across the back.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
