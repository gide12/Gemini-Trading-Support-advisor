import React, { useMemo, useState } from 'react';
import { getAssetCalendarPerformance } from '../services/marketDataService';

interface AssetCalendarProps {
    ticker: string;
}

type TimeRange = '1M' | '6M' | '1Y' | '5Y';

const AssetCalendar: React.FC<AssetCalendarProps> = ({ ticker }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');
    
    const daysConfig: Record<TimeRange, number> = {
        '1M': 30,
        '6M': 180,
        '1Y': 365,
        '5Y': 1825
    };
    
    const days = daysConfig[timeRange];
    const calendarData = useMemo(() => getAssetCalendarPerformance(ticker, days), [ticker, days]);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Fill empty days for the first row to align correctly
    const firstDate = new Date(calendarData[0].date);
    const startDay = firstDate.getDay();
    const emptyDays = Array.from({ length: startDay }).map((_, i) => i);

    return (
        <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 p-6 shadow-lg flex flex-col hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                        </svg>
                        {ticker} Action Grid
                    </h3>
                    <p className="text-xs text-slate-400 tracking-wide">Daily Price Directionality</p>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-1">
                    {(['1M', '6M', '1Y', '5Y'] as TimeRange[]).map(t => (
                        <button 
                            key={t}
                            onClick={() => setTimeRange(t)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${timeRange === t ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-3 flex-1 flex flex-col justify-center overflow-x-auto custom-scrollbar">
                {timeRange === '1M' ? (
                    <>
                        <div className="grid grid-cols-7 gap-1 mb-2 min-w-[300px]">
                            {daysOfWeek.map(d => (
                                <div key={d} className="text-[10px] font-bold text-slate-500 uppercase text-center">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 min-w-[300px]">
                            {emptyDays.map(d => (
                                <div key={`empty-${d}`} className="h-10 rounded-md bg-transparent"></div>
                            ))}
                            {calendarData.map(day => {
                                const isPositive = day.changePercent >= 0;
                                const severity = Math.min(Math.abs(day.changePercent) / 3, 1);
                                const opacity = 0.2 + (severity * 0.8);
                                
                                return (
                                    <div 
                                        key={day.date} 
                                        className="h-10 rounded-md flex flex-col items-center justify-center relative group cursor-default transition-all"
                                        style={{ backgroundColor: isPositive ? `rgba(16, 185, 129, ${opacity})` : `rgba(244, 63, 94, ${opacity})` }}
                                        title={`${day.date}: ${isPositive ? '+' : ''}${day.changePercent}%`}
                                    >
                                        <span className="text-[9px] text-white/50 absolute top-1 left-1">{day.date.split('-')[2]}</span>
                                        <span className="text-[10px] font-bold text-white z-10 mt-2">
                                            {isPositive ? '+' : ''}{day.changePercent}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-2 min-h-[120px]">
                        {Array.from({ length: Math.ceil((calendarData.length + startDay) / 7) }).map((_, colIndex) => {
                            return (
                                <div key={`col-${colIndex}`} className="flex flex-col gap-1">
                                    {Array.from({ length: 7 }).map((_, rowIndex) => {
                                        const index = colIndex * 7 + rowIndex - startDay;
                                        if (index < 0 || index >= calendarData.length) {
                                            return <div key={`empty-${colIndex}-${rowIndex}`} className="w-4 h-4 rounded-sm bg-transparent shrink-0"></div>;
                                        }
                                        const day = calendarData[index];
                                        const isPositive = day.changePercent >= 0;
                                        const severity = Math.min(Math.abs(day.changePercent) / 3, 1);
                                        const opacity = 0.2 + (severity * 0.8);
                                        return (
                                            <div 
                                                key={day.date} 
                                                className="w-4 h-4 shrink-0 rounded-sm cursor-help hover:ring-1 hover:ring-white/50 transition-all"
                                                style={{ backgroundColor: isPositive ? `rgba(16, 185, 129, ${opacity})` : `rgba(244, 63, 94, ${opacity})` }}
                                                title={`${day.date}: ${isPositive ? '+' : ''}${day.changePercent}%`}
                                            ></div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-500/80"></div> Up Day</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-rose-500/80"></div> Down Day</div>
            </div>
        </div>
    );
};

export default AssetCalendar;
