import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { ImageIcon, Paperclip, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(file.name);
    }
  };

  const removeFile = () => {
    setFilePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (selectedFile) formData.append("file", selectedFile);

      await sendMessage(formData);

      setText("");
      setFilePreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* File / Image Preview */}
      {filePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {selectedFile?.type?.startsWith("image/") ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-base-300 rounded-lg border border-zinc-700">
                <Paperclip size={14} className="text-zinc-400 shrink-0" />
                <span className="text-sm truncate max-w-[200px]">{filePreview}</span>
              </div>
            )}
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center border border-zinc-700"
              type="button"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={imageInputRef}
        onChange={handleFileChange}
      />
      <input
        type="file"
        accept="*/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Input row */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {/* Image button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          title="Send Image"
          className={`btn btn-sm btn-circle shrink-0 ${
            filePreview && selectedFile?.type?.startsWith("image/")
              ? "text-emerald-500"
              : "text-zinc-400"
          }`}
        >
          <ImageIcon size={18} />
        </button>

        {/* Paperclip / File button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach File"
          className={`btn btn-sm btn-circle shrink-0 ${
            filePreview && !selectedFile?.type?.startsWith("image/")
              ? "text-emerald-500"
              : "text-zinc-400"
          }`}
        >
          <Paperclip size={18} />
        </button>

        {/* Text input */}
        <input
          type="text"
          className="flex-1 input input-bordered rounded-lg input-sm sm:input-md"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Send button */}
        <button
          type="submit"
          className="btn btn-sm btn-circle shrink-0"
          disabled={!text.trim() && !selectedFile}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
