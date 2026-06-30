import { forwardRef, useState, type InputHTMLAttributes, type CSSProperties } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  toggleStyle?: CSSProperties;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { wrapperClassName, wrapperStyle, toggleStyle, style, className, ...rest },
  ref,
) {
  const [shown, setShown] = useState(false);
  return (
    <div className={wrapperClassName} style={{ position: "relative", ...wrapperStyle }}>
      <input
        ref={ref}
        type={shown ? "text" : "password"}
        className={className}
        style={{ paddingRight: 40, ...style }}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        tabIndex={-1}
        style={{
          position: "absolute",
          top: "50%",
          right: 10,
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "currentColor",
          opacity: 0.6,
          ...toggleStyle,
        }}
      >
        {shown ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
});
