import { type PropsWithChildren } from "react";

export const Button = ({
  children,
  type = "button",
  className = "",
  ...otherProps
}: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => {
  return (
    <button
      type={type}
      className={`inline-flex size-10 cursor-pointer items-center justify-center rounded border border-gray-300 bg-white text-lg hover:border-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-white disabled:text-gray-400 ${className}`}
      {...otherProps}
    >
      {children}
    </button>
  );
};
