export default function PinMarker({ pin, index, isActive, onClick }) {
  return (
    <button
      className={`pin-marker ${isActive ? 'pin-marker--active' : ''}`}
      style={{ left: `${pin.pin_x}%`, top: `${pin.pin_y}%` }}
      onClick={(e) => { e.stopPropagation(); onClick(pin.id); }}
      aria-label={`Comment ${index + 1}`}
      title={pin.body}
    >
      <span>{index + 1}</span>
      <style>{`
        .pin-marker {
          position: absolute; width: 28px; height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg) translate(-50%, -50%);
          transform-origin: top left;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none; background: var(--teal);
          box-shadow: 0 2px 8px rgba(0,0,0,.2);
          transition: transform .15s, box-shadow .15s; z-index: 10;
        }
        .pin-marker:hover, .pin-marker--active {
          transform: rotate(-45deg) translate(-50%, -50%) scale(1.15);
          box-shadow: 0 4px 14px rgba(0,0,0,.3);
        }
        .pin-marker--active { background: var(--amber); }
        .pin-marker span {
          transform: rotate(45deg); font-size: .65rem; font-weight: 700;
          color: #fff; font-family: var(--font-body); line-height: 1;
        }
      `}</style>
    </button>
  );
}
