import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  title?: string;
  description?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDeleteButton({
  title = "Deseja realmente excluir?",
  description = "Essa ação não poderá ser desfeita.",
  isLoading = false,
  onConfirm,
}: ConfirmDeleteButtonProps) {
  function handleClick() {
    const confirmed = window.confirm(`${title}\n\n${description}`);

    if (confirmed) {
      onConfirm();
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isLoading}
      onClick={handleClick}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isLoading ? "Excluindo..." : "Excluir"}
    </Button>
  );
}
