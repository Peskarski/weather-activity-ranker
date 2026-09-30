import { type Reason } from "../../types";
import { reasonMessage } from "../../utils";

type ReasonListProps = {
  reasons: Reason[];
};

export const ReasonList = ({ reasons }: ReasonListProps) => {
  return (
    <ul className="flex flex-col gap-1">
      {reasons.map((reason) => {
        const isPositive = reason.impact === "POSITIVE";
        return (
          <li key={`${reason.code}-${reason.impact}`} className="flex items-start gap-2 text-sm">
            <span
              aria-hidden="true"
              className={`font-bold ${isPositive ? "text-green-700" : "text-red-700"}`}
            >
              {isPositive ? "✓" : "✗"}
            </span>
            <span className="sr-only">{isPositive ? "In favour:" : "Against:"}</span>
            <span className="text-gray-700">{reasonMessage(reason)}</span>
          </li>
        );
      })}
    </ul>
  );
};
