import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Event {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  color: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  event?: Event | null;
  initialDate?: Date;
}

const EVENT_COLORS = [
  { name: "Blue", value: "#4285F4" },
  { name: "Red", value: "#EA4335" },
  { name: "Yellow", value: "#FBBC04" },
  { name: "Green", value: "#34A853" },
  { name: "Purple", value: "#9334E6" },
  { name: "Pink", value: "#E67C73" },
  { name: "Cyan", value: "#33B679" },
  { name: "Orange", value: "#F6BF26" },
];

export const EventModal = ({ isOpen, onClose, onSave, onDelete, event, initialDate }: EventModalProps) => {
  const [formData, setFormData] = useState<Event>({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    is_all_day: false,
    color: "#4285F4",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else if (initialDate) {
      const startTime = new Date(initialDate);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(initialDate);
      endTime.setHours(10, 0, 0, 0);

      setFormData({
        title: "",
        description: "",
        location: "",
        start_time: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
        is_all_day: false,
        color: "#4285F4",
      });
    }
  }, [event, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      toast.error("End time must be after start time");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
      toast.success(event ? "Event updated" : "Event created");
    } catch (error) {
      toast.error("Failed to save event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;

    setIsLoading(true);
    try {
      await onDelete(event.id);
      onClose();
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              maxLength={255}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                disabled={formData.is_all_day}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                disabled={formData.is_all_day}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="all_day">All-day event</Label>
            <Switch
              id="all_day"
              checked={formData.is_all_day}
              onCheckedChange={(checked) => setFormData({ ...formData, is_all_day: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Add location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    border: formData.color === color.value ? "3px solid #000" : "2px solid #ccc",
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {event && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
