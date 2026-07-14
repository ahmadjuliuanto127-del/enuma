import { useState } from "react";
import { uploadAvatar } from "@/features/profile/api";

export function AvatarUploader({ userId }: { userId: string }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAvatar(userId, file);
      setAvatarUrl(url);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      {avatarUrl && <img src={avatarUrl} alt="Avatar" style={{ width: 64, height: 64, borderRadius: "50%" }} />}
      <input type="file" accept="image/*" onChange={handleChange} disabled={isUploading} />
    </div>
  );
}
