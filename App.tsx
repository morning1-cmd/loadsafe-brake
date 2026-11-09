import { useCallback, useEffect, useRef, useState } from "react";

type LoadMode = "empty" | "loaded";

const BRAKE_TABLE: Record<LoadMode, Record<number, number>> = {
  empty: { 30: 6, 50: 14, 70: 25, 100: 45 },
  loaded: { 30: 9, 50: 21, 70: 37, 100: 65 },
};

const SPEEDS = [30, 50, 70, 100];

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: "truck" | "cargo" | "fuel" | "cruise" | "reset" | "arrow";
  className?: string;
}) {
  const paths = {
    truck: (
      <>
        <path d="M3 7h10v8H3zM13 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    cargo: (
      <>
        <path d="M4 5h7v7H4zM13 5h7v7h-7zM8 13h8v7H8z" />
        <path d="M7.5 5v7M16.5 5v7M12 13v7" />
      </>
    ),
    fuel: <path d="M5 21V4h9v17M4 21h12M7 7h5v5H7zM14 8h2l3 3v7a1.5 1.5 0 0 0 3 0v-7l-2-2" />,
    cruise: (
      <>
        <path d="M5 18a8 8 0 1 1 14 0M12 12l4-3" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    reset: <path d="M4 7v5h5M5.5 16a8 8 0 1 0 .7-9.5L4 9" />,
    arrow: <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />,
  };
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Gauge({ type, value }: { type: "rpm" | "speed"; value: number }) {
  const isSpeed = type === "speed";
  const labels = isSpeed
    ? ["0", "20", "40", "60", "80", "100", "120", "140", "160", "180"]
    : ["0", "1", "2", "3", "4", "5", "6"];
  const start = -132;
  const sweep = 264;
  const max = isSpeed ? 180 : 6;
  const displayValue = isSpeed ? value : 0.8 + (value / 100) * 1.4;
  const needleAngle = start + (Math.min(displayValue, max) / max) * sweep;

  return (
    <div className="gauge-shell">
      <div className="gauge-glass" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 280 280">
        <defs>
          <filter id={`glow-${type}`}>
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="140"
          cy="140"
          r="126"
          fill="none"
          stroke="#075985"
          strokeWidth="5"
          opacity=".38"
        />
        <circle
          cx="140"
          cy="140"
          r="122"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.7"
          opacity=".9"
          filter={`url(#glow-${type})`}
        />
        {Array.from({ length: isSpeed ? 37 : 31 }).map((_, i, all) => {
          const angle = start + (i / (all.length - 1)) * sweep;
          const major = i % (isSpeed ? 4 : 5) === 0;
          const red = !isSpeed && i > 24;
          const r1 = major ? 105 : 111;
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={140 + Math.sin(rad) * r1}
              y1={140 - Math.cos(rad) * r1}
              x2={140 + Math.sin(rad) * 118}
              y2={140 - Math.cos(rad) * 118}
              stroke={red ? "#fb4f5f" : major ? "#f8fafc" : "#64748b"}
              strokeWidth={major ? 2.5 : 1}
              opacity={major ? 1 : 0.75}
            />
          );
        })}
        {labels.map((label, i) => {
          const angle = start + (i / (labels.length - 1)) * sweep;
          const rad = (angle * Math.PI) / 180;
          return (
            <text
              key={label}
              x={140 + Math.sin(rad) * 88}
              y={144 - Math.cos(rad) * 88}
              fill={!isSpeed && i >= 5 ? "#fb7185" : "#f8fafc"}
              fontSize={isSpeed ? 11 : 14}
              fontWeight="700"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
        <text x="140" y="188" fill="#64748b" fontSize="9" fontWeight="600" textAnchor="middle">
          {isSpeed ? "km/h" : "x1000 rpm"}
        </text>
        <g>
          <path d="M106 224 Q140 240 174 224" fill="none" stroke="#334155" strokeWidth="2" />
          <text
            x="101"
            y="229"
            fill={isSpeed ? "#fb7185" : "#94a3b8"}
            fontSize="10"
            fontWeight="700"
          >
            {isSpeed ? "E" : "C"}
          </text>
          <text
            x="176"
            y="229"
            fill={!isSpeed ? "#fb7185" : "#94a3b8"}
            fontSize="10"
            fontWeight="700"
          >
            {isSpeed ? "F" : "H"}
          </text>
          <path
            d={isSpeed ? "M137 220h6v6h-6zM143 221h3v4h-3" : "M138 218v-8h4v8a4 4 0 1 1-4 0"}
            fill="#94a3b8"
          />
          <line
            x1="140"
            y1="231"
            x2={isSpeed ? "151" : "134"}
            y2="216"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div className="gauge-needle" style={{ transform: `rotate(${needleAngle}deg)` }}>
        <span />
      </div>
      <div className="needle-cap">
        <div />
      </div>
    </div>
  );
}

function RoadDisplay({
  mode,
  speed,
  distance,
  initialDistance,
  braking,
}: {
  mode: LoadMode;
  speed: number;
  distance: number;
  initialDistance: number;
  braking: boolean;
}) {
  const stopped = speed <= 0.1 && distance <= 0.1;
  const ratio = Math.max(0, Math.min(1, distance / Math.max(initialDistance, 1)));
  const lineY = 115 + ratio * 25;
  const accent = mode === "empty" ? "#38bdf8" : "#fbbf24";
  return (
    <div className="lcd-screen">
      <div className="lcd-header">
        <span className="gear">{speed > 0 ? "D" : "P"}</span>
        <div>
          <span className="lcd-meta">
            <Icon name="fuel" /> 91 <small>km</small>
          </span>
          <span className="lcd-meta muted">
            <Icon name="cruise" /> CRUISE <b>{speed > 0 ? Math.round(speed) : "---"}</b>{" "}
            <small>km/h</small>
          </span>
        </div>
      </div>
      <div className="road-view">
        <svg viewBox="0 0 220 180" className="h-full w-full">
          <defs>
            <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#050a12" stopOpacity="0" />
              <stop offset=".45" stopColor="#0b1728" stopOpacity=".75" />
              <stop offset="1" stopColor="#12243c" />
            </linearGradient>
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon points="50,20 170,20 210,172 10,172" fill="url(#road)" />
          <line
            x1="83"
            y1="25"
            x2="42"
            y2="166"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="137"
            y1="25"
            x2="178"
            y2="166"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="65"
            y1={lineY}
            x2="155"
            y2={lineY}
            stroke={accent}
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#lineGlow)"
          />
          <g transform="translate(110 83)">
            <defs>
              <pattern
                id="cargoHatch"
                width="5"
                height="5"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(35)"
              >
                <rect width="5" height="5" fill="#b45309" />
                <line x1="0" y1="0" x2="0" y2="5" stroke="#fbbf24" strokeWidth="1.4" opacity=".5" />
              </pattern>
            </defs>

            {/* Far end: the cab sits ahead of the open cargo bed. */}
            <path
              d="M-22-7L-19-30Q-18-36 0-36Q18-36 19-30L22-7Z"
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <path
              d="M-14-11L-12-28Q0-31 12-28L14-11Z"
              fill="#132033"
              stroke="#64748b"
              strokeWidth="1.2"
            />
            <path d="M-18-7H18" stroke="#cbd5e1" strokeWidth="2" />

            {/* Middle: the widening trapezoid makes the bed read as a top-rear perspective. */}
            <path
              d="M-23-8H23L30 17H-30Z"
              fill="#dbe3ec"
              stroke="#94a3b8"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M-19-5H19L25 13H-25Z"
              fill="#111c2b"
              stroke="#64748b"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {mode === "loaded" && (
              <g>
                <path
                  d="M-17-3H17L22 11H-22Z"
                  fill="url(#cargoHatch)"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <text
                  x="0"
                  y="6"
                  fill="#fff7ed"
                  fontSize="5.4"
                  fontWeight="800"
                  letterSpacing=".45"
                  textAnchor="middle"
                >
                  LOADED 1.0t
                </text>
              </g>
            )}

            {/* Bed rails frame the load without allowing it to cross the vehicle width. */}
            <path
              d="M-23-8L-30 17M23-8L30 17M-23-8H23"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Near end: tailgate, lamps, bumper, and tires remain in the foreground. */}
            <rect x="-31" y="13" width="10" height="25" rx="3" fill="#0f172a" stroke="#475569" />
            <rect x="21" y="13" width="10" height="25" rx="3" fill="#0f172a" stroke="#475569" />
            <rect
              x="-31"
              y="12"
              width="62"
              height="25"
              rx="2"
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            {[19, 27].map((y) => (
              <line key={y} x1="-27" y1={y} x2="27" y2={y} stroke="#cbd5e1" />
            ))}
            <rect x="-8" y="21" width="16" height="4" rx="1" fill="#64748b" />
            <rect
              x="-29"
              y="28"
              width="7"
              height="7"
              rx="1"
              fill={braking ? "#ef4444" : "#475569"}
            />
            <rect
              x="22"
              y="28"
              width="7"
              height="7"
              rx="1"
              fill={braking ? "#ef4444" : "#475569"}
            />
            <path d="M-27 39H27" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
        <div className={`distance-pill ${mode}`}>
          <span>제동거리</span>
          <strong>{distance.toFixed(1)}</strong>
          <small>m</small>
        </div>
        {stopped && <div className="stop-overlay">✓ 정지 완료 (0.0m)</div>}
      </div>
      <div className="lcd-footer">
        <span>
          {stopped ? "차량 정지 상태" : braking ? "감속 제동 작동 중" : "차로 유지 보조 ON"}
        </span>
        <b>
          7 <small>km</small>
        </b>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<LoadMode>("empty");
  const [selectedSpeed, setSelectedSpeed] = useState(100);
  const [speed, setSpeed] = useState(100);
  const [pedal, setPedal] = useState(0);
  const [distance, setDistance] = useState(45);
  const [initialDistance, setInitialDistance] = useState(45);
  const dragging = useRef(false);
  const dragStart = useRef({ y: 0, pedal: 0 });
  const stateRef = useRef({ speed, pedal, distance, mode, initialDistance });

  useEffect(() => {
    stateRef.current = { speed, pedal, distance, mode, initialDistance };
  }, [speed, pedal, distance, mode, initialDistance]);

  const reset = useCallback(
    (nextSpeed = selectedSpeed, nextMode = mode) => {
      const nextDistance = BRAKE_TABLE[nextMode][nextSpeed];
      setSpeed(nextSpeed);
      setPedal(0);
      setDistance(nextDistance);
      setInitialDistance(nextDistance);
    },
    [mode, selectedSpeed],
  );

  const chooseMode = (nextMode: LoadMode) => {
    setMode(nextMode);
    reset(selectedSpeed, nextMode);
  };

  const chooseSpeed = (nextSpeed: number) => {
    setSelectedSpeed(nextSpeed);
    reset(nextSpeed, mode);
  };

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 16.67, 2);
      previous = now;
      const current = stateRef.current;
      if (current.pedal > 0 && current.speed > 0) {
        const massFactor = current.mode === "empty" ? 1 : 0.78;
        const decel = (current.pedal / 100) * 0.13 * massFactor * dt;
        const nextSpeed = Math.max(0, current.speed - decel);
        const distStep = (current.pedal / 100) * 0.095 * massFactor * dt;
        const nextDistance = Math.max(0, current.distance - distStep);
        if (nextSpeed <= 0.1 || nextDistance <= 0.1) {
          setSpeed(0);
          setDistance(0);
          setPedal(0);
        } else {
          setSpeed(nextSpeed);
          setDistance(nextDistance);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const updatePedalFromPointer = (clientY: number) => {
    const delta = dragStart.current.y - clientY;
    setPedal(Math.max(0, Math.min(100, Math.round(dragStart.current.pedal + delta))));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    dragStart.current = { y: event.clientY, pedal };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) updatePedalFromPointer(event.clientY);
  };

  const releasePointer = () => {
    if (dragging.current) {
      dragging.current = false;
      setPedal(0);
    }
  };

  const braking = pedal > 0 && speed > 0;

  return (
    <main className="min-h-screen bg-[#05070b] px-3 py-5 text-slate-100 sm:px-6 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <header className="control-bar">
          <div className="control-group">
            <span className="control-label">적재 상태</span>
            <div className="segmented">
              <button
                className={mode === "empty" ? "active blue" : ""}
                onClick={() => chooseMode("empty")}
              >
                <Icon name="truck" /> 공차 <small>1.9t</small>
              </button>
              <button
                className={mode === "loaded" ? "active amber" : ""}
                onClick={() => chooseMode("loaded")}
              >
                <Icon name="cargo" /> 만차 <small>3.0t 적재</small>
              </button>
            </div>
          </div>
          <div className="control-group">
            <span className="control-label">시작 속도</span>
            <div className="speed-options">
              {SPEEDS.map((item) => (
                <button
                  key={item}
                  className={selectedSpeed === item ? "active" : ""}
                  onClick={() => chooseSpeed(item)}
                >
                  {item}
                  <small>km</small>
                </button>
              ))}
            </div>
          </div>
          <div className="status-copy">
            <span /> PORTER II · ADAS BRAKE TEST
          </div>
        </header>

        <section className="cluster-hood">
          <div className="hood-highlight" />
          <div className="lane-status" aria-label="차로 유지 보조 켜짐">
            <i />
            <b />
            <i />
          </div>
          <div className="cluster-grid">
            <Gauge type="rpm" value={speed} />
            <div className="center-cluster">
              <RoadDisplay
                mode={mode}
                speed={speed}
                distance={distance}
                initialDistance={initialDistance}
                braking={braking}
              />
              <div className="warning-row">
                <div className="door-warning">
                  <span />
                  <i />
                </div>
                <div className={braking ? "brake-warning lit" : "brake-warning"}>
                  <b>(P) (!)</b>
                  <small>BRAKE</small>
                </div>
              </div>
            </div>
            <Gauge type="speed" value={speed} />
          </div>
        </section>

        <section className="lower-grid">
          <div className="pedal-panel panel">
            <div className="panel-heading">
              <div>
                <span className="pulse-dot" />
                <b>PORTER II 브레이크 페달</b>
                <small>위로 밀어서 제동</small>
              </div>
              <span>
                페달 깊이 <strong>{pedal}%</strong>
              </span>
            </div>
            <div className="pedal-content">
              <div className="pedal-column">
                <div
                  className="pedal-track"
                  onWheel={(event) => {
                    event.preventDefault();
                    setPedal((value) =>
                      Math.max(0, Math.min(100, value + (event.deltaY < 0 ? 8 : -8))),
                    );
                  }}
                >
                  <div className="pedal-arm">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="max-brake">
                    <Icon name="arrow" /> 100% 최대 제동
                  </div>
                  <div className="zero-brake">0% 해제</div>
                  <div
                    className="pedal-pad"
                    style={{ transform: `translateY(${-pedal}px)` }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={releasePointer}
                    onPointerCancel={releasePointer}
                  >
                    <div className="pedal-brand">
                      <i /> HYUNDAI BRAKE <i />
                    </div>
                    <span />
                    <span />
                    <span />
                    <small>
                      <Icon name="arrow" /> 위로 밀어 밟기
                    </small>
                  </div>
                </div>
                <p>
                  페달을 <b>위로 드래그</b>하거나 마우스 휠로 제동
                </p>
              </div>
              <div className="preset-column">
                <span>단축 압력 테스트</span>
                {[
                  [30, "경감속", "가볍게"],
                  [65, "일반 제동", "안전제동"],
                  [100, "급제동", "최대"],
                ].map(([value, title, hint]) => (
                  <button
                    key={value}
                    className={value === 100 ? "danger" : ""}
                    onClick={() => {
                      if (speed === 0) reset(selectedSpeed, mode);
                      setPedal(value as number);
                    }}
                  >
                    <span>
                      <b>{value}%</b> {title}
                    </span>
                    <small>{hint}</small>
                  </button>
                ))}
                <button className="reset-button" onClick={() => reset(selectedSpeed, mode)}>
                  <Icon name="reset" /> 시뮬레이션 리셋
                </button>
              </div>
            </div>
          </div>

          <aside className="data-panel panel">
            <div className="data-heading">
              <div>
                <small>FACTORY REFERENCE</small>
                <b>포터 II 기준 제동표</b>
              </div>
              <span className={mode}>{mode === "empty" ? "공차 1.9t" : "만차 3.0t"}</span>
            </div>
            <div className="data-cards">
              {SPEEDS.map((item) => (
                <button
                  key={item}
                  className={selectedSpeed === item ? "selected" : ""}
                  onClick={() => chooseSpeed(item)}
                >
                  <span>
                    {item} <small>km/h</small>
                  </span>
                  <strong>
                    {BRAKE_TABLE[mode][item].toFixed(1)}
                    <small>m</small>
                  </strong>
                </button>
              ))}
            </div>
            <div className="data-note">
              <span>i</span>
              제동 거리는 노면과 타이어 상태에 따라 달라질 수 있는 시뮬레이션 기준값입니다.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
