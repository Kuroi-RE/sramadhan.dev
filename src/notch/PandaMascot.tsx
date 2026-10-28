interface PandaMascotProps {
  size?: number;
  isSleeping?: boolean;
}

export function PandaMascot({
  size = 22,
  isSleeping = false,
}: PandaMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
    >
      {/* Ears */}
      <circle cx="8" cy="8" r="5" fill="#18181b" />
      <circle cx="24" cy="8" r="5" fill="#18181b" />
      <circle cx="8" cy="8" r="2.5" fill="#27272a" />
      <circle cx="24" cy="8" r="2.5" fill="#27272a" />

      {/* Head */}
      <ellipse cx="16" cy="18" rx="13" ry="11" fill="#f4f4f5" />

      {/* Eye Patches */}
      <ellipse
        cx="11"
        cy="17"
        rx="3.5"
        ry="4"
        transform="rotate(-15 11 17)"
        fill="#18181b"
      />
      <ellipse
        cx="21"
        cy="17"
        rx="3.5"
        ry="4"
        transform="rotate(15 21 17)"
        fill="#18181b"
      />

      {/* Eyes */}
      {isSleeping ? (
        <>
          <path
            d="M9.5 17.5C10.5 18.5 11.5 18.5 12.5 17.5"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M19.5 17.5C20.5 18.5 21.5 18.5 22.5 17.5"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="11.5" cy="16.5" r="1.3" fill="#ffffff" />
          <circle cx="20.5" cy="16.5" r="1.3" fill="#ffffff" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="16" cy="20.5" rx="2" ry="1.3" fill="#18181b" />

      {/* Blush Cheeks */}
      <circle cx="7.5" cy="21" r="2" fill="#fda4af" opacity="0.6" />
      <circle cx="24.5" cy="21" r="2" fill="#fda4af" opacity="0.6" />
    </svg>
  );
}
