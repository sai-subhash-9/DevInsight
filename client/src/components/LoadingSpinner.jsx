const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-accent border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
