function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="bg-white relative z-10 rounded-2xl p-8 shadow-xl w-full sm:max-w-sm md:max-w-md">
        <button className="cursor-pointer absolute top-4 right-4" onClick={onClose}>
          x
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
