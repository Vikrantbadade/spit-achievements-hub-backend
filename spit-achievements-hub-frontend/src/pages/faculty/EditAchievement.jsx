import { useState, useEffect } from "react";
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
  { value: "publication", label: "Publication" },
  { value: "patent", label: "Patent" },
  { value: "award", label: "Award" },
  { value: "fdp", label: "FDP/Workshop" },
  { value: "project", label: "Funded Project" },
  { value: "conference", label: "Conference Presentation" },
  { value: "other", label: "Other" },
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
        date: achievement.date,
      });
    }
  }, [achievement]);

  const handleSave = (e) => {
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

    // 🔁 Replace with API call
    setTimeout(() => {
      toast({
        title: "Updated",
        description: "Achievement updated successfully",
      });

      setIsLoading(false);
      onClose(); // ✅ close modal after save
    }, 800);
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