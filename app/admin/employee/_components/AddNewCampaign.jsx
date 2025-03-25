"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

function AddNewCampaign({ fetchCampaigns }) {  // ✅ Fix: Ensure it receives fetchCampaigns
  const [open, setOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddCampaign = async () => {
    setError("");
    if (!campaignName.trim()) {
      setError("Campaign name is required.");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("🔍 Sending request to /api/campaigns:", { name: campaignName.trim() });
  
      const res = await axios.post("/api/campaigns", { name: campaignName.trim() });
  
      console.log("✅ Campaign added successfully:", res);
  
      if (res.status === 201) {
        toast.success("Campaign added successfully!");
        if (typeof fetchCampaigns === "function") {
          fetchCampaigns(); 
        } else {
          console.error("❌ fetchCampaigns is not a function!");
        }
        setOpen(false);
        setCampaignName("");
      }
    } catch (err) {
      console.error("❌ Axios Error:", err);
  
      if (err.response) {
        console.error("🔴 Server Response:", err.response.status, err.response.data);
        setError(err.response.data.error || "Failed to add campaign.");
      } else if (err.request) {
        console.error("🟠 No Response from Server:", err.request);
        setError("No response from the server. Please check your API.");
      } else {
        console.error("⚠️ Request Setup Error:", err.message);
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Button onClick={() => setOpen(true)} className="ml-2">
        <PlusCircle size={18} /> Add Campaign
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Campaign</DialogTitle>
          </DialogHeader>

          {error && <p className="text-red-500 text-sm" aria-live="polite">{error}</p>}

          <div className="space-y-3">
            <Input 
              value={campaignName} 
              onChange={(e) => setCampaignName(e.target.value)} 
              placeholder="Campaign Name" 
              autoFocus 
            />

            <div className="flex gap-3 items-center justify-end mt-5">
              <Button onClick={() => setOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button onClick={handleAddCampaign} disabled={loading}>
                {loading ? "Saving..." : "Add Campaign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewCampaign;
