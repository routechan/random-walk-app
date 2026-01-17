interface RandomButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export default function RandomButton({ onClick, disabled }: RandomButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-60 h-60 rounded-full bg-gradient-to-br from-pink-500 to-orange-400
                 text-white font-bold text-2xl shadow-lg
                 hover:scale-105 active:scale-95
                 transition-all duration-300
                 disabled:opacity-50 disabled:cursor-not-allowed
                 mx-auto flex items-center justify-center"
      style={{
        boxShadow: "0 8px 24px rgba(255, 107, 157, 0.4)",
      }}
    >
      散歩開始！
    </button>
  );
}
