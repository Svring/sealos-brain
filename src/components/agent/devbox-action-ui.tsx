import { Button } from "../ui/button";

export function DevboxActionUI({
  template,
  onSelect,
  onReject,
  status,
  result,
}: {
  template: string;
  onSelect: () => void;
  onReject: () => void;
  status: string;
  result: any;
}) {
  return (
    <div>
      {status === "complete" ? (
        <h1>
          Devbox '{result.devboxName}' is successfully created from template '
          {result.templateName || template}'
        </h1>
      ) : (
        <h1>Creating devbox from template '{template}'</h1>
      )}
      <Button onClick={onSelect}>Approve</Button>
      <Button onClick={onReject}>Reject</Button>
    </div>
  );
}
