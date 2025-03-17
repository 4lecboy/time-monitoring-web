"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import AddNewCampaign from "./AddNewCampaign";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, campaignId: null });

  useEffect(() => {
    if (open) {
      fetchCampaigns();
    }
  }, [open]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await axios.get("/api/campaigns");
      setCampaigns(data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      toast.error("Failed to fetch campaigns.");
    }
  };

  const confirmDelete = (id) => {
    setConfirmDialog({ open: true, campaignId: id });
  };

  const handleDeleteCampaign = async () => {
    try {
      await axios.delete(`/api/campaigns?id=${confirmDialog.campaignId}`);
      setCampaigns((prev) => prev.filter((camp) => camp.id !== confirmDialog.campaignId));
      toast.success("Campaign removed successfully!");
    } catch (err) {
      console.error("Error deleting campaign:", err);
      toast.error("Failed to delete campaign.");
    } finally {
      setConfirmDialog({ open: false, campaignId: null });
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
         Campaign List
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
          <div className="flex justify-between mt-7">
            <DialogTitle className="font-bold text-lg">Campaign List</DialogTitle>
            <AddNewCampaign onCampaignAdded={fetchCampaigns} />
            </div>
            </DialogHeader>
          
          
          <div className="space-y-2">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="p-3 border rounded-lg shadow flex justify-between items-center">
                  <span>{campaign.name}</span>
                  <Button variant="destructive" onClick={() => confirmDelete(campaign.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No campaigns found.</p>
            )}
          </div>
          <Button onClick={() => setOpen(false)} className="mt-4">Close</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmDialog.open} onOpenChange={(val) => setConfirmDialog({ open: val, campaignId: confirmDialog.campaignId })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this campaign?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, campaignId: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCampaign}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}