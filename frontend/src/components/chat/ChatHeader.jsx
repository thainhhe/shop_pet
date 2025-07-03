"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

export default function ChatHeader({ participant, chat, onClose }) {
  const [showInfo, setShowInfo] = useState(false);

  if (!participant) {
    return (
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div>
              <h3 className="font-medium text-gray-500">Loading...</h3>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>
    );
  }

  const getRoleDisplay = (role) => {
    switch (role) {
      case "shop_owner":
        return "Shop Owner";
      case "rescue_center":
        return "Rescue Center";
      case "user":
        return "User";
      default:
        return role;
    }
  };

  const getStatusColor = (role) => {
    switch (role) {
      case "shop_owner":
        return "bg-blue-500";
      case "rescue_center":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="border-b p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={participant.avatar || "/placeholder.svg?height=40&width=40"}
              alt={participant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                participant.role
              )} rounded-full border-2 border-white`}
            ></div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900">{participant.name}</h3>
            <p className="text-sm text-gray-500">
              {getRoleDisplay(participant.role)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
          >
            ℹ️
          </Button>

          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Chat Info Panel */}
      {showInfo && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Email:</span> {participant.email}
            </div>

            {participant.address && (
              <div>
                <span className="font-medium">Address:</span>{" "}
                {[
                  participant.address.street,
                  participant.address.ward,
                  participant.address.district,
                  participant.address.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}

            {chat.relatedPet && (
              <div>
                <span className="font-medium">Related Pet:</span>{" "}
                {chat.relatedPet.name}
              </div>
            )}

            {chat.relatedProduct && (
              <div>
                <span className="font-medium">Related Product:</span>{" "}
                {chat.relatedProduct.name}
              </div>
            )}

            <div>
              <span className="font-medium">Chat Type:</span>{" "}
              {chat.chatType === "user_shop"
                ? "Shop Support"
                : "Rescue Center Support"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
