import { useState, useId } from 'react';
import { TrendingUp, BarChart2, Calendar, Eye } from 'lucide-react';

const formatDayLabel = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

export const AnalyticsGraph = ({
  data = [],
  title = 'Analytics Overview',
  color = '#2563eb', // Default Primary Blue
  type: initialType = 'area', // 'area' or 'bar'
  height = 240,
}) => {
  const [chartType, setChartType] = useState(initialType);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const gradientId = useId();

  if (!data || data.length === 0) {
    return (
      <div className="card p-6 text-center text-muted">
        <p className="text-sm">No data available for this date range.</p>
      </div>
    );
  }

  // Parse counts and calculate statistics
  const parsedData = data.map((item, idx) => ({
    day: item.day || `Day ${idx + 1}`,
    count: Number(item.count || 0),
  }));

  const counts = parsedData.map((d) => d.count);
  const totalCount = counts.reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);
  const avgCount = Math.round(totalCount / parsedData.length);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = height;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute (x, y) coordinates for data points
  const points = parsedData.map((item, index) => {
    const x =
      parsedData.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (index / (parsedData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (item.count / maxCount) * chartHeight;
    return { x, y, ...item, index };
  });

  // Build SVG Path string for Smooth Area / Curve Line
  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const curvePath = buildSmoothPath(points);
  const areaPath = points.length > 0
    ? `${curvePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Calculate Y-axis tick marks
  const yTicks = [
    maxCount,
    Math.round(maxCount * 0.75),
    Math.round(maxCount * 0.5),
    Math.round(maxCount * 0.25),
    0,
  ];

  // Select evenly spaced X-axis date labels (max 7-8 labels)
  const maxLabels = 8;
  const labelInterval = Math.ceil(parsedData.length / maxLabels);
  const xLabels = parsedData.filter((_, idx) => idx % labelInterval === 0 || idx === parsedData.length - 1);

  return (
    <div className="bg-surface rounded-2xl p-5 border border-border space-y-4 shadow-sm">
      {/* Header with Title, Stats & Chart Type Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <h4 className="text-base font-bold text-text">{title}</h4>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted">
            <span>Total: <strong className="text-text font-semibold">{totalCount.toLocaleString()}</strong></span>
            <span>Avg: <strong className="text-text font-semibold">{avgCount.toLocaleString()}</strong>/day</span>
            <span>Peak: <strong className="text-text font-semibold">{maxCount.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Toggle Chart View */}
        <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'area' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Line</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'bar' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
        </div>
      </div>

      {/* Main SVG Graph Canvas */}
      <div className="relative overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((val, idx) => {
            const yPos = paddingTop + (idx / (yTicks.length - 1)) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={svgWidth - paddingRight}
                  y2={yPos}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-border/60"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] font-medium fill-muted"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Render Graph (Area / Curve) */}
          {chartType === 'area' && (
            <>
              {/* Gradient Area */}
              <path d={areaPath} fill={`url(#${gradientId})`} />

              {/* Glowing Line */}
              <path
                d={curvePath}
                fill="none"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((pt) => {
                const isHovered = hoveredPoint?.index === pt.index;
                return (
                  <g
                    key={pt.index}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Outer hover ring */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 8 : 4}
                      fill={color}
                      className="transition-all duration-150"
                      fillOpacity={isHovered ? 0.3 : 0.8}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3}
                      fill="#ffffff"
                      stroke={color}
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}
            </>
          )}

          {/* Render Graph (Modern Rounded Bar Chart) */}
          {chartType === 'bar' && (
            <g>
              {points.map((pt) => {
                const barWidth = Math.max(8, Math.min(28, (chartWidth / points.length) * 0.55));
                const barHeight = Math.max(3, paddingTop + chartHeight - pt.y);
                const xPos = pt.x - barWidth / 2;
                const isHovered = hoveredPoint?.index === pt.index;

                return (
                  <g
                    key={pt.index}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <rect
                      x={xPos}
                      y={pt.y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={color}
                      fillOpacity={isHovered ? 1 : 0.75}
                      className="transition-all duration-150 hover:opacity-100"
                    />
                    {pt.count > 0 && (
                      <text
                        x={pt.x}
                        y={pt.y - 6}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-text opacity-90"
                      >
                        {pt.count}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* X-axis Date Labels */}
          {xLabels.map((lbl, idx) => {
            const matchingPt = points.find((p) => p.day === lbl.day) || points[idx];
            if (!matchingPt) return null;
            return (
              <text
                key={idx}
                x={matchingPt.x}
                y={svgHeight - 12}
                textAnchor="middle"
                className="text-[11px] font-medium fill-muted"
              >
                {formatDayLabel(lbl.day)}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 dark:border-slate-300 text-xs font-semibold space-y-0.5"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100 - 10}%`,
            }}
          >
            <p className="text-[11px] opacity-80">{formatDayLabel(hoveredPoint.day)}</p>
            <p className="text-sm font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {hoveredPoint.count.toLocaleString()} {title.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsGraph;
