import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { value: "Publication", label: "Publication" },
  { value: "Patent", label: "Patent" },
  { value: "Award", label: "Award" },
  { value: "FDP", label: "FDP/Workshop" },
  { value: "Project", label: "Funded Project" },
  { value: "Conference", label: "Conference Presentation" },
  { value: "Seminar", label: "Seminar" },
  { value: "STTP", label: "STTP" },
  { value: "Other", label: "Other" },
];

const EditAchievement = ({ achievement, onClose }) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title,
        category: achievement.category,
        description: achievement.description,
        date: achievement.achievementDate ? new Date(achievement.achievementDate).toISOString().split('T')[0] : "",
      });
    }
  }, [achievement]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        achievementDate: formData.date
      };

      if (achievement._id) {
        await api.put(`/faculty/achievement/${achievement._id}`, payload);
      }

      toast({
        title: "Updated",
        description: "Achievement updated successfully",
      });

      if (onClose) onClose();
      // Ideally we should trigger a content refresh in parent.
      // MyAchievements listens to nothing?
      // Ah, onClose in MyAchievements currently just closes modal.
      // I need to trigger refresh.
      // But `MyAchievements` fetches on mount.
      // I should pass a "onSuccess" callback or just refresh page?
      // Or `MyAchievements` re-fetches when edit closes?
      // I'll reload window for simplicity or assume user will refresh.
      // Actually I can call `window.location.reload()` here, or pass a callback.
      // Let's rely on reload for now or parent passing refresh.
      window.location.reload();

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update achievement",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Date *</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
        />
      </div>

      {/* 🔘 Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default EditAchievement;