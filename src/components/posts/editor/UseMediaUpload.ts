import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { useState } from "react";

export interface Attachments {
  file: File;
  mediaId?: string;
  isUploading: Boolean;
}

export default function UseMediaUpload() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachments[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  function renameFiles(files: File[]) {
    return files.map((file) => {
      const ext = file.name.split(".").pop();
      const uniqueId = Date.now() + "-" + Math.random().toString(36).slice(2);
      const newName = `attachment_${uniqueId}.${ext}`;

      return new File([file], newName, { type: file.type });
    });
  }
  async function UploadToCloudinary(files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const response = await kyInstance
      .post("/api/posts/attachments", {
        body: formData,
      })
      .json<{ media: { mediaId: string }[] }>();
    return response.media;
  }

  async function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Upload already in progress.",
      });
      return;
    }
    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "Max 5 attachments allowed.",
      });
      return;
    }
    const namedfiles = renameFiles(files);
    setIsUploading(true);
    const newAttachments: Attachments[] = namedfiles.map((file) => ({
      file,
      isUploading: true,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    try {
      const media = await UploadToCloudinary(namedfiles);
      setAttachments((prev) =>
        prev.map((attachment, i) =>
          i >= prev.length - media.length
            ? {
                ...attachment,
                mediaId: media[i - (prev.length - media.length)].mediaId,
                isUploading: false,
              }
            : attachment,
        ),
      );
    } catch (error: any) {
      setAttachments((prev) => prev.filter((a) => !a.isUploading));
      toast({ variant: "destructive", description: error.message });
    }

    setIsUploading(false);
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  function reset() {
    setAttachments([]);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    removeAttachment,
    reset,
  };
}
