import { useState } from "react";
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
import { PlusCircle, Upload } from "lucide-react";

import api from "@/lib/axios";

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

const AddAchievement = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    description: "",
    date: "", // existing achievementDate fallback
    startDate: "",
    endDate: "",
    duration: "",
    fundedBy: "",
    grantAmount: "",
    proof: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Category, Title, Date)",
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

      if (formData.proof) {
        payload.append('proof', formData.proof);
      }

      await api.post('/faculty/achievement', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast({
        title: "Achievement Added",
        description: "Your achievement has been submitted successfully",
      });
      setFormData({
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
        proof: null,
      });
      // Reset file input manually if needed, or by key
      document.getElementById('proof-input').value = "";

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add achievement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasSubCategories = subCategories[formData.category];
  const isOrganisedFDP = formData.category === 'FDP' && formData.subCategory === 'Organised';
  const isWorkshop = formData.category === 'Workshop';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Add New Achievement
        </h1>
        <p className="text-muted-foreground mt-2">
          Record your academic and professional achievements
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasSubCategories && (
              <div className="space-y-2">
                <Label htmlFor="subCategory">Type</Label>
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
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter achievement title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about your achievement"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Conditional Fields for FDP Organised & Workshop */}
          {(isOrganisedFDP || isWorkshop) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (e.g. 5 days)</Label>
                <Input placeholder="e.g. 1 week" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
              </div>
            </div>
          )}

          {/* Conditional Fields specifically for FDP Organised */}
          {isOrganisedFDP && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg mt-0">
              <div className="space-y-2">
                <Label htmlFor="fundedBy">Funded By</Label>
                <Input placeholder="Funding Agency" value={formData.fundedBy} onChange={(e) => setFormData({ ...formData, fundedBy: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grantAmount">Grant Amount (₹)</Label>
                <Input type="number" placeholder="0" value={formData.grantAmount} onChange={(e) => setFormData({ ...formData, grantAmount: e.target.value })} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Achievement Date * (Submission Date)</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Upload Proof (Certificate/Document)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {formData.proof ? formData.proof.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, PNG, JPG up to 10MB
              </p>
              <input
                id="proof-input"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({ ...formData, proof: e.target.files[0] });
                  }
                }}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Achievement
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddAchievement;
