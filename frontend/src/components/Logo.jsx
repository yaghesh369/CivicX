import { Link } from 'react-router-dom'

export default function Logo({ to = '/', size = 40, showText = true, textClassName = '' }) {
  return (
    <Link to={to} className="group flex items-center gap-3 transition hover:opacity-90">
      <img
        src="/icon.svg"
        alt="CivicConnect logo"
        width={size}
        height={size}
        className="shrink-0 drop-shadow-sm transition duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className={`text-lg font-extrabold tracking-tight ${textClassName}`}>
          CivicConnect
        </span>
      )}
    </Link>
  )
}
