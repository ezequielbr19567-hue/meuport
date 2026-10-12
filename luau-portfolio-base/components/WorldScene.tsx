// Decorative illustration; real uploaded work takes its place in the hero.
export default function WorldScene({ compact = false }: { compact?: boolean }) {
  return <div className={`worldScene ${compact ? "isCompact" : ""}`} aria-hidden="true">
    <svg viewBox="0 0 560 420" fill="none" focusable="false">
      <g stroke="#829bbd" strokeOpacity=".18">
        <path d="M0 260 280 100 560 260 280 420Z M0 210 280 50 560 210 M0 310 280 150 560 310" />
        <path d="M70 220 350 380 M140 180 420 340 M210 140 490 300 M350 140 70 300 M420 180 140 340 M490 220 210 380" />
      </g>
      <g strokeLinejoin="round">
        <path d="m70 255 210-121 210 121-210 121Z" fill="#152941" stroke="#829bbd" strokeOpacity=".6" />
        <path d="m70 255 210 121v22L70 277Z" fill="#0c1829" stroke="#4c6585" />
        <path d="m280 376 210-121v22L280 398Z" fill="#203754" stroke="#4c6585" />
        <path d="m115 224 67-39 67 39-67 39Z" fill="#859bb8" stroke="#b1c6e0" />
        <path d="m115 224 67 39v69l-67-39Z" fill="#344e6f" stroke="#829bbd" />
        <path d="m182 263 67-39v69l-67 39Z" fill="#203951" stroke="#829bbd" />
        <path d="m288 150 62-36 62 36-62 36Z" fill="#adbed4" stroke="#dbe7f7" />
        <path d="m288 150 62 36v132l-62-36Z" fill="#3c5878" stroke="#829bbd" />
        <path d="m350 186 62-36v132l-62 36Z" fill="#203951" stroke="#829bbd" />
        <path d="m228 220 43-25 43 25-43 25Z" fill="#f9b474" stroke="#ffd6ae" />
        <path d="m228 220 43 25v84l-43-25Z" fill="#d47d39" stroke="#f5973e" />
        <path d="m271 245 43-25v84l-43 25Z" fill="#945627" stroke="#f5973e" />
        <path d="m390 247 37-21 37 21-37 22Z" fill="#829bbd" stroke="#d0dff2" />
        <path d="m390 247 37 22v39l-37-22Z" fill="#344e6f" stroke="#829bbd" />
        <path d="m427 269 37-22v39l-37 22Z" fill="#203951" stroke="#829bbd" />
      </g>
      <path d="m107 263 173 100 183-106" stroke="#f5973e" strokeWidth="2" />
      <g stroke="#829bbd" strokeDasharray="3 5" strokeOpacity=".7"><path d="M350 105V53h92 M95 222v-79h64 M272 338v42" /></g>
      <g fill="#b9c9df" fontSize="10" fontFamily="monospace" letterSpacing="2"><text x="445" y="57">Y</text><text x="80" y="137">X</text><text x="268" y="410">Z</text></g>
      <circle cx="350" cy="105" r="4" fill="#f5973e" />
    </svg>
    {!compact && <div className="sceneCaption"><span>ROBLOX STUDIO</span><span>BUILD. SCRIPT. PLAY.</span></div>}
  </div>;
}
