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

const categories = [
  { value: "publication", label: "Publication" },
  { value: "patent", label: "Patent" },
  { value: "award", label: "Award" },
  { value: "fdp", label: "FDP/Workshop" },
  { value: "project", label: "Funded Project" },
  { value: "conference", label: "Conference Presentation" },
  { value: "Seminar", label: "Seminar" },
  { value: "STTP", label: "STTP" },
  { value: "other", label: "Other" },
];

const AddAchievement = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
    proof: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Achievement Added",
        description: "Your achievement has been submitted successfully",
      });
      setFormData({
        title: "",
        category: "",
        description: "",
        date: "",
        proof: null,
      });
      setIsLoading(false);
    }, 1000);
  };

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
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select achievement category" />
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

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
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
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, PNG, JPG up to 10MB
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
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
