import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon?: React.ReactNode;
  variant?: "default" | "gradient" | "minimal";
  color?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  variant = "default",
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: "from-blue-50/30 via-white to-blue-50/20",
      icon: "from-blue-500 to-cyan-500",
      iconBg: "bg-gradient-to-br from-blue-100/80 to-cyan-100/80",
      border: "border-blue-200/50",
      accent: "text-blue-600",
      shadow: "shadow-blue-100/50",
    },
    green: {
      bg: "from-green-50/30 via-white to-emerald-50/20",
      icon: "from-green-500 to-emerald-500",
      iconBg: "bg-gradient-to-br from-green-100/80 to-emerald-100/80",
      border: "border-green-200/50",
      accent: "text-green-600",
      shadow: "shadow-green-100/50",
    },
    purple: {
      bg: "from-purple-50/30 via-white to-violet-50/20",
      icon: "from-purple-500 to-violet-500",
      iconBg: "bg-gradient-to-br from-purple-100/80 to-violet-100/80",
      border: "border-purple-200/50",
      accent: "text-purple-600",
      shadow: "shadow-purple-100/50",
    },
    orange: {
      bg: "from-orange-50/30 via-white to-amber-50/20",
      icon: "from-orange-500 to-amber-500",
      iconBg: "bg-gradient-to-br from-orange-100/80 to-amber-100/80",
      border: "border-orange-200/50",
      accent: "text-orange-600",
      shadow: "shadow-orange-100/50",
    },
    red: {
      bg: "from-red-50/30 via-white to-pink-50/20",
      icon: "from-red-500 to-pink-500",
      iconBg: "bg-gradient-to-br from-red-100/80 to-pink-100/80",
      border: "border-red-200/50",
      accent: "text-red-600",
      shadow: "shadow-red-100/50",
    },
    indigo: {
      bg: "from-indigo-50/30 via-white to-blue-50/20",
      icon: "from-indigo-500 to-blue-500",
      iconBg: "bg-gradient-to-br from-indigo-100/80 to-blue-100/80",
      border: "border-indigo-200/50",
      accent: "text-indigo-600",
      shadow: "shadow-indigo-100/50",
    },
  };

  const getCardClasses = () => {
    const baseClasses = "transition-all duration-200 group cursor-pointer backdrop-blur-sm relative z-[10]";

    switch (variant) {
      case "gradient":
        return `${baseClasses} p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color].bg} border ${colorClasses[color].border} hover:scale-[1.02] ${colorClasses[color].shadow} hover:shadow-xl`;
      case "minimal":
        return `${baseClasses} p-4 rounded-xl bg-white/95 border border-slate-200/60 hover:border-slate-300/60 shadow-sm hover:shadow-md`;
      default:
        return `${baseClasses} p-6 rounded-2xl bg-white/90 shadow-lg border border-gray-200/50 hover:border-gray-300/50 hover:scale-[1.02] hover:shadow-xl`;
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case "minimal":
        return "text-sm font-medium text-slate-600 mb-2 text-caption";
      case "gradient":
        return "text-sm font-semibold text-gray-500 mb-2 tracking-wide uppercase text-caption";
      default:
        return "text-sm font-semibold text-gray-500 mb-2 tracking-wide uppercase text-caption";
    }
  };

  const getValueClasses = () => {
    switch (variant) {
      case "minimal":
        return "text-xl font-semibold text-slate-800 tracking-tight text-title";
      case "gradient":
        return "text-2xl font-bold text-gray-900 tracking-tight text-title";
      default:
        return "text-2xl font-bold text-gray-900 tracking-tight text-title";
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case "minimal":
        return "w-10 h-10";
      default:
        return "w-12 h-12";
    }
  };

  return (
    <div className={getCardClasses()}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={getTitleClasses()}>
            {title}
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className={getValueClasses()}>
              {value}
            </span>
          </div>
          {change && (
            <div className={`flex items-center space-x-2 ${variant === 'minimal' ? 'mt-2' : 'mt-3'}`}>
              <span
                className={`${variant === 'minimal' ? 'text-xs' : 'text-sm'} font-semibold px-2 py-1 rounded-full text-caption ${
                  change.type === "increase"
                    ? "text-emerald-700 bg-emerald-100/80"
                    : change.type === "decrease"
                      ? "text-red-700 bg-red-100/80"
                      : "text-slate-700 bg-slate-100/80"
                  }`}
              >
                {change.value}
              </span>
              <span className={`${variant === 'minimal' ? 'text-xs' : 'text-sm'} text-slate-500 font-medium text-caption`}>
                from last month
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div
              className={`${getIconSize()} rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 ${
                variant === "gradient"
                  ? colorClasses[color].iconBg
                  : variant === "minimal"
                    ? "bg-gradient-to-br from-slate-100/80 to-slate-200/80 backdrop-blur-sm"
                    : "bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-sm"
                }`}
            >
              <div
                className={`transition-all duration-200 ${
                  variant === "gradient"
                    ? `bg-gradient-to-r ${colorClasses[color].icon} bg-clip-text text-transparent`
                    : variant === "minimal"
                      ? "text-slate-600 group-hover:text-slate-700"
                      : "text-gray-600 group-hover:text-gray-700"
                  }`}
              >
                {icon}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

