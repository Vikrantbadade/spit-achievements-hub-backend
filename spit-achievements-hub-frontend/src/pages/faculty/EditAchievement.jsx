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
import { Upload } from "lucide-react";

const categories = [
  { value: "Publication", label: "Publication" },
  { value: "Patent", label: "Patent" },
  { value: "Award", label: "Award" },
  { value: "FDP", label: "FDP" },
  { value: "Project", label: "Funded Project" },
  { value: "Organised Conference", label: "Organised Conference" },
  { value: "Seminar", label: "Seminar" },
  { value: "Workshop", label: "Workshop" },
  { value: "Other", label: "Other" },
];

const subCategories = {
  Publication: ["UGC Recognised Journal", "Conference Paper"],
  FDP: ["Attended", "Organised"],
};

const EditAchievement = ({ achievement, onClose }) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    description: "",
    date: "",
    startDate: "",
    endDate: "",
    duration: "",
    fundedBy: "",
    grantAmount: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title || "",
        category: achievement.category || "",
        subCategory: achievement.subCategory || "",
        description: achievement.description || "",
        date: achievement.achievementDate ? new Date(achievement.achievementDate).toISOString().split('T')[0] : "",
        startDate: achievement.startDate ? new Date(achievement.startDate).toISOString().split('T')[0] : "",
        endDate: achievement.endDate ? new Date(achievement.endDate).toISOString().split('T')[0] : "",
        duration: achievement.duration || "",
        fundedBy: achievement.fundedBy || "",
        grantAmount: achievement.grantAmount || "",
      });
    }
  }, [achievement]);

  const [proofFile, setProofFile] = useState(null);

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
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('category', formData.category);
      if (formData.subCategory) payload.append('subCategory', formData.subCategory);
      payload.append('description', formData.description);
      payload.append('achievementDate', formData.date);

      if (formData.startDate) payload.append('startDate', formData.startDate);
      if (formData.endDate) payload.append('endDate', formData.endDate);
      if (formData.duration) payload.append('duration', formData.duration);
      if (formData.fundedBy) payload.append('fundedBy', formData.fundedBy);
      if (formData.grantAmount) payload.append('grantAmount', formData.grantAmount);

      if (proofFile) {
        payload.append('proof', proofFile);
      }

      if (achievement._id) {
        await api.put(`/faculty/achievement/${achievement._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast({
        title: "Updated",
        description: "Achievement updated successfully",
      });

      if (onClose) onClose();
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

  const hasSubCategories = subCategories[formData.category];
  const isOrganisedFDP = formData.category === 'FDP' && formData.subCategory === 'Organised';
  const isWorkshop = formData.category === 'Workshop';

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value, subCategory: "" })
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

        {hasSubCategories && (
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.subCategory}
              onValueChange={(value) =>
                setFormData({ ...formData, subCategory: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {hasSubCategories.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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

      {/* Conditional Fields */}
      {(isOrganisedFDP || isWorkshop) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Duration (e.g. 5 days)</Label>
            <Input placeholder="e.g. 1 week" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
          </div>
        </div>
      )}

      {isOrganisedFDP && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg mt-0">
          <div className="space-y-2">
            <Label>Funded By</Label>
            <Input placeholder="Funding Agency" value={formData.fundedBy} onChange={(e) => setFormData({ ...formData, fundedBy: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Grant Amount (₹)</Label>
            <Input type="number" placeholder="0" value={formData.grantAmount} onChange={(e) => setFormData({ ...formData, grantAmount: e.target.value })} />
          </div>
        </div>
      )}

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

      <div className="space-y-2">
        <Label>Update Proof (Optional)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
          <p className="text-sm text-muted-foreground">
            {proofFile ? proofFile.name : "Click to upload new proof"}
          </p>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setProofFile(e.target.files[0]);
              }
            }}
          />
        </div>
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