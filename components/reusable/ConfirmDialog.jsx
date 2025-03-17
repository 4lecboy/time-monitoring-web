import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({ open, onClose, onConfirm, message }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p>{message}</p>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
