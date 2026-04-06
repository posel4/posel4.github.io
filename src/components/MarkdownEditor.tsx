"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  onPublish: (data: {
    title: string;
    content: string;
    tags: string;
    series: string;
    description: string;
  }) => Promise<void>;
}

export default function MarkdownEditor({ onPublish }: MarkdownEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [series, setSeries] = useState("");
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);

  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setPublishing(true);
    try {
      await onPublish({ title, content, tags, series, description });
    } catch (error) {
      alert("발행 실패: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setPublishing(false);
    }
  }, [title, content, tags, series, description, onPublish]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-card-border bg-card-bg px-4 py-3 text-2xl font-bold text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
      />
      <input
        type="text"
        placeholder="설명 (옵션)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
      />
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="태그 (쉼표로 구분)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="flex-1 rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
        <input
          type="text"
          placeholder="시리즈 (옵션)"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          className="flex-1 rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
      </div>
      <div data-color-mode="auto">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={500}
          preview="live"
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {publishing ? "발행 중..." : "발행하기"}
        </button>
      </div>
    </div>
  );
}
