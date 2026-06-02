type Props = {
  ip: string;
  location: string;
};

const UserIP = ({ ip, location }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        Current Public IP
      </span>
      <div className="text-lg font-mono font-bold text-brand-primary">
        {ip || "Detecting..."}
      </div>
      <div className="text-xs text-slate-400 mt-1">
        {location || "Locating..."}
      </div>
    </div>
  );
};

export default UserIP;
