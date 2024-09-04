import classNames from "classnames";
import { TransportButton } from "./TransportButton";

export function Footer({ className }: { className?: string }) {
  return (
    <div className={classNames("flex h-12", className)}>
      <TransportButton />
    </div>
  );
}
