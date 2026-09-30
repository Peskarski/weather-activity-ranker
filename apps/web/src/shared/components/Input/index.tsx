type InputProps = {
  label?: string;
};

export const Input = ({
  label,
  id,
  ...otherProps
}: InputProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 shadow-xs disabled:bg-gray-100 disabled:text-gray-500"
        id={id}
        {...otherProps}
      />
    </div>
  );
};
