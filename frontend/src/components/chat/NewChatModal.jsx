"use client";

import { useState, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { chatAPI } from "../../services/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

export default function NewChatModal({ isOpen, onClose, onChatCreated }) {
  const { createChat } = useChat();
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // 'all', 'shop', 'rescue'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadPartners();
    }
  }, [isOpen]);

  useEffect(() => {
    filterPartners();
  }, [partners, searchTerm, selectedType]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getChatPartners();
      setPartners(response.data.partners);
    } catch (error) {
      console.error("Load partners error:", error);
      setError("Failed to load chat partners");
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = () => {
    let filtered = partners;

    // Filter by type
    if (selectedType === "shop") {
      filtered = filtered.filter((p) => p.role === "shop_owner");
    } else if (selectedType === "rescue") {
      filtered = filtered.filter((p) => p.role === "rescue_center");
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPartners(filtered);
  };

  const handleStartChat = async (partner) => {
    try {
      setLoading(true);
      const chatType =
        partner.role === "shop_owner" ? "user_shop" : "user_rescue";

      const chat = await createChat(partner._id, chatType);
      onChatCreated(chat);
      onClose();
    } catch (error) {
      console.error("Start chat error:", error);
      setError("Failed to start chat");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "shop_owner":
        return "Shop Owner";
      case "rescue_center":
        return "Rescue Center";
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "shop_owner":
        return "bg-blue-100 text-blue-800";
      case "rescue_center":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Start New Chat</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Search */}
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter buttons */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={selectedType === "shop" ? "default" : "outline"}
              onClick={() => setSelectedType("shop")}
            >
              Shops
            </Button>
            <Button
              size="sm"
              variant={selectedType === "rescue" ? "default" : "outline"}
              onClick={() => setSelectedType("rescue")}
            >
              Rescue Centers
            </Button>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>

        {/* Partners list */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : filteredPartners.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {partners.length === 0
                ? "No chat partners available"
                : "No partners match your search"}
            </div>
          ) : (
            <div className="divide-y">
              {filteredPartners.map((partner) => (
                <div
                  key={partner._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStartChat(partner)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        partner.avatar || "/placeholder.svg?height=40&width=40"
                      }
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {partner.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            partner.role
                          )}`}
                        >
                          {getRoleDisplayName(partner.role)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {partner.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
