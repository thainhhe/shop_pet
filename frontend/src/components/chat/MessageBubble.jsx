import { formatDistanceToNow } from "date-fns";

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Debug log
  console.log("MessageBubble - Message:", message);
  console.log("MessageBubble - isOwn:", isOwn);
  console.log(
    "MessageBubble - Sender ID:",
    message.sender?._id || message.sender?.id
  );

  return (
    <div
      className={`flex ${
        isOwn ? "justify-end" : "justify-start"
      } items-end space-x-2 mb-4`}
    >
      {!isOwn && showAvatar && (
        <img
          src={message.sender?.avatar || "/placeholder.svg?height=32&width=32"}
          alt={message.sender?.name || "User"}
          className="w-8 h-8 rounded-full"
        />
      )}

      {!isOwn && !showAvatar && <div className="w-8" />}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-1" : "order-2"}`}>
        {/* Show sender name for debugging */}
        {!isOwn && (
          <div className="text-xs text-gray-500 mb-1">
            {message.sender?.name || "Unknown User"}
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-gray-800 rounded-bl-none"
          }`}
        >
          {message.messageType === "text" && (
            <p className="text-sm">{message.content}</p>
          )}

          {message.messageType === "image" && (
            <div>
              <img
                src={message.fileUrl || "/placeholder.svg"}
                alt="Shared image"
                className="max-w-full h-auto rounded"
              />
              {message.content && (
                <p className="text-sm mt-2">{message.content}</p>
              )}
            </div>
          )}
        </div>

        <div
          className={`text-xs text-gray-500 mt-1 ${
            isOwn ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.createdAt)}
          {isOwn && message.isRead && (
            <span className="ml-1 text-blue-500">✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
