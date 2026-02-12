const InvestmentRow = ({ log }) => {
  const [liveProfit, setLiveProfit] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!log?.startDate || !log?.amount || !log?.dailyRoi || !log?.duration) {
      return;
    }

    const startTime = new Date(log.startDate).getTime();
    const durationMs = log.duration * 24 * 60 * 60 * 1000;
    const endTime = startTime + durationMs;

    const profitPerSecond =
      (Number(log.amount) * (Number(log.dailyRoi) / 100)) / 86400;

    const calculateProfit = () => {
      const now = Date.now();

      // If investment completed
      if (now >= endTime) {
        const totalProfit =
          Number(log.amount) *
          (Number(log.dailyRoi) / 100) *
          Number(log.duration);

        setLiveProfit(totalProfit);
        setIsCompleted(true);
        return true; // signal completed
      }

      const elapsedSeconds = Math.max(0, (now - startTime) / 1000);
      const currentProfit = profitPerSecond * elapsedSeconds;

      setLiveProfit(currentProfit);
      setIsCompleted(false);

      return false;
    };

    // Run immediately
    const finished = calculateProfit();

    // If already finished, don’t start interval
    if (finished) return;

    const timer = setInterval(() => {
      const done = calculateProfit();
      if (done) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);

  }, [log.amount, log.dailyRoi, log.duration, log.startDate]);

  return (
    <div className="bg-[#0f1218] border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-indigo-500/30 transition-all group">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-400">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="font-black text-lg uppercase tracking-tight">
            {log.planName}
          </h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Stake: €{Number(log.amount).toLocaleString()}
          </p>
        </div>
      </div>

      {/* PROFIT DISPLAY */}
      <div className="flex flex-col items-center md:items-end">
        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
          <TrendingUp size={12} /> Accrued Profit
        </p>

        <p className="text-2xl font-black text-white tabular-nums">
          €{liveProfit.toLocaleString(undefined, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
          })}
        </p>
      </div>

      {/* STATUS */}
      <div className="w-full md:w-48 bg-white/5 p-4 rounded-2xl flex justify-between items-center">
        <div>
          <p className="text-[8px] font-black text-gray-600 uppercase mb-1">
            Status
          </p>

          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              isCompleted
                ? 'text-emerald-400'
                : 'text-indigo-400 animate-pulse'
            }`}
          >
            {isCompleted ? 'Completed' : 'Node Running'}
          </span>
        </div>

        <div
          className={`p-2 rounded-full ${
            isCompleted ? 'bg-emerald-500/10' : 'bg-white/5'
          }`}
        >
          <ArrowUpRight
            size={18}
            className={
              isCompleted
                ? 'text-emerald-400'
                : 'text-gray-700 group-hover:text-white transition-colors'
            }
          />
        </div>
      </div>
    </div>
  );
};
