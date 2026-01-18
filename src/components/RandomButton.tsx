interface RandomButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function RandomButton({ onClick, disabled }: RandomButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full max-w-sm h-14 rounded-full
                 bg-gradient-to-br from-green-400 to-green-600
                 text-white font-bold text-lg shadow-xl
                 hover:scale-105 active:scale-95
                 transition-all duration-300
                 disabled:opacity-50 disabled:cursor-not-allowed
                 border-4 border-green-300"
      style={{
        boxShadow: "0 6px 20px rgba(76, 175, 80, 0.5)",
      }}
    >
      散歩スタート
    </button>
  );
}
