import LoadingSpinner from './LoadingSpinner';

const ScoreRing = ({ score }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-100">{score}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
};

const ComplexityBadge = ({ label, value, icon }) => {
  const bgMap = { 'Low': 'from-green-500/20 to-green-600/10 border-green-500/20',
                  'Medium': 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20',
                  'High': 'from-red-500/20 to-red-600/10 border-red-500/20' };
  const textMap = { 'Low': 'text-green-400', 'Medium': 'text-yellow-400', 'High': 'text-red-400' };
  const key = value?.includes('Low') || value === 'Low' ? 'Low'
            : value?.includes('High') || value === 'High' ? 'High' : 'Medium';

  return (
    <div className={`bg-gradient-to-br ${bgMap[key]} border rounded-xl p-3 flex flex-col gap-1`}>
      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
        <span>{icon}</span>{label}
      </span>
      <span className={`text-sm font-semibold ${textMap[key]}`}>{value}</span>
    </div>
  );
};

const ReviewPanel = ({ review, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Analyzing code..." />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/10 to-purple-500/10 border border-accent/10
                        flex items-center justify-center">
          <svg className="w-10 h-10 text-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400 mb-1">No Analysis Yet</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Select a snippet and click<br />
            <span className="text-accent-light font-medium">"Analyze Code"</span> to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 animate-fade-in">
      {/* Header badge */}
      <div className="flex justify-center">
        <span className={`text-xs px-3 py-1 rounded-full font-semibold tracking-wide ${
          review.type === 'ai'
            ? 'bg-gradient-to-r from-accent/20 to-purple-500/20 text-accent-light border border-accent/20'
            : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/20'
        }`}>
          {review.type === 'ai' ? '✨ AI-Powered Analysis' : '📏 Rule-Based Analysis'}
        </span>
      </div>

      {/* Score Ring */}
      <ScoreRing score={review.score} />

      {/* Complexity Cards Grid */}
      <div className="grid grid-cols-1 gap-2">
        <ComplexityBadge label="Overall Complexity" value={review.complexity} icon="📊" />
        <ComplexityBadge label="Time Complexity" value={review.timeComplexity || 'N/A'} icon="⏱️" />
        <ComplexityBadge label="Space Complexity" value={review.spaceComplexity || 'N/A'} icon="💾" />
      </div>

      {/* Divider */}
      <div className="border-t border-dark-400/20" />

      {/* Summary */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span className="w-1 h-3.5 bg-accent rounded-full" /> Summary
        </h3>
        <p className="text-sm text-gray-300/80 leading-relaxed bg-dark-700/30 rounded-lg p-3 border border-dark-400/10">
          {review.summary}
        </p>
      </div>

      {/* Issues */}
      {review.issues?.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-red-500 rounded-full" /> Issues
            <span className="text-[10px] font-normal text-red-500/60 bg-red-500/10 px-1.5 py-0.5 rounded-full ml-auto">
              {review.issues.length}
            </span>
          </h3>
          <ul className="space-y-1.5">
            {review.issues.map((issue, i) => (
              <li key={i} className="text-sm text-gray-300/80 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2.5
                                     flex items-start gap-2">
                <span className="text-red-400 text-xs mt-0.5 shrink-0">▸</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {review.suggestions?.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-emerald-500 rounded-full" /> Suggestions
            <span className="text-[10px] font-normal text-emerald-500/60 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-auto">
              {review.suggestions.length}
            </span>
          </h3>
          <ul className="space-y-1.5">
            {review.suggestions.map((suggestion, i) => (
              <li key={i} className="text-sm text-gray-300/80 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2.5
                                     flex items-start gap-2">
                <span className="text-emerald-400 text-xs mt-0.5 shrink-0">▸</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer timestamp */}
      {review.createdAt && (
        <div className="text-center pt-2">
          <span className="text-[10px] text-gray-600">
            Analyzed {new Date(review.createdAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewPanel;
