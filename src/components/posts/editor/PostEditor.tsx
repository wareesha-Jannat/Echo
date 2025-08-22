"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "next/image";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/app/(main)/SessionProvider";

import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import UseMediaUpload, { Attachments } from "./UseMediaUpload";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

export default function PostEditor() {
  const { user } = useSession();
  const MOODS = ["😊 Happy", "😢 Sad", "🤩 Excited", "😡 Angry", "😐 Normal"];
  const [mood, setMood] = useState("");
  const [qod, setQod] = useState(false);

  const queryClient = useQueryClient();
  const cachedQuestion = queryClient.getQueryData<{ question: string }>([
    "question-of-the-day",
  ]);

  const mutation = useSubmitPostMutation();
  const { startUpload, isUploading, removeAttachment, reset, attachments } =
    UseMediaUpload();

  const { getRootProps } = useDropzone({
    accept: {
      "image/*": [],
      "video/*": [],
    },
    onDrop: (selectedfiles) => {
      startUpload(selectedfiles);
    },
  });

  const { onClick, ...rootProps } = getRootProps();

  //text editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Wanna share something?",
      }),
    ],
    content: "", // initial content
    autofocus: false,
    editable: true,
    injectCSS: true,
    immediatelyRender: false,
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mood: mood?.trim(),
        qod: qod ? cachedQuestion?.question : "",
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setMood("");
          setQod(false);
          reset();
        },
      },
    );
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = Array.from(items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    if (files.length > 0) {
      startUpload(files);
    }
  }

  return (
    <div className="bg-card flex flex-col gap-2 rounded-2xl p-5 shadow-sm">
      <div className="flex gap-2">
        <UserAvatar
          avatarUrl={user.avatarUrl}
          className="hidden min-[460px]:inline"
        />
        <div {...rootProps} className="w-full space-y-3">
          <EditorContent
            editor={editor}
            className="bg-background max-h-80 w-full overflow-y-auto rounded-2xl border-none px-5 py-3 outline-none"
            onPaste={onPaste}
          />
          <input
            list="moodSuggestions"
            id="mood"
            name="mood"
            value={mood}
            maxLength={50}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Type or select a mood..."
            className="bg-background w-full rounded-2xl border-none px-3 py-2 focus:ring-0 focus:outline-none"
          />

          <p
            className={
              50 - mood.length <= 10 ? "text-destructive" : "text-primary"
            }
          >
            {50 - mood.length < 10 &&
              50 - mood.length + " Characters left"}{" "}
          </p>
          <datalist id="moodSuggestions">
            {MOODS.map((m, i) => (
              <option value={m} key={i} />
            ))}
          </datalist>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={qod}
              onChange={(e) => setQod(e.target.checked)}
            />
            <span>Tag this post for the question of the day</span>
          </label>
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      <div className="flex items-center justify-end gap-3">
        <AddAttachmentButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length > 5}
        />
        <LoadingButton
          loading={mutation.isPending}
          onClick={onSubmit}
          disabled={!input.trim() || isUploading}
          className="w-30 text-white"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface AttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentButton({
  onFilesSelected,
  disabled,
}: AttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachments[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((a) => (
        <AttachmentPreview
          key={a.file.name}
          attachment={a}
          onRemoveClick={() => removeAttachment(a.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachments;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!src) return null;
  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-120 rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-120 rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="bg-foreground text-background hover:bg-foreground/60 absolute top-3 right-3 rounded-2xl p-1.5 transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
