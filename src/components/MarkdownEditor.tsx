"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export interface PostFormData {
  title: string;
  content: string;
  description: string;
  categories: string;
  tags: string;
  series: string;
  seriesOrder: string;
  cover: string;
}

interface MarkdownEditorProps {
  onPublish: (data: PostFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: Partial<PostFormData>;
  isEditMode?: boolean;
}

export default function MarkdownEditor({
  onPublish,
  onDelete,
  initialData,
  isEditMode = false,
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categories, setCategories] = useState(initialData?.categories || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [series, setSeries] = useState(initialData?.series || "");
  const [seriesOrder, setSeriesOrder] = useState(initialData?.seriesOrder || "");
  const [cover, setCover] = useState(initialData?.cover || "");
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.content) setContent(initialData.content);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.categories) setCategories(initialData.categories);
      if (initialData.tags) setTags(initialData.tags);
      if (initialData.series) setSeries(initialData.series);
      if (initialData.seriesOrder) setSeriesOrder(initialData.seriesOrder);
      if (initialData.cover) setCover(initialData.cover);
    }
  }, [initialData]);

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
      await onPublish({
        title,
        content,
        description,
        categories,
        tags,
        series,
        seriesOrder,
        cover,
      });
    } catch (error) {
      alert(
        "발행 실패: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setPublishing(false);
    }
  }, [title, content, description, categories, tags, series, seriesOrder, cover, onPublish]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    if (!confirm("정말 이 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    setDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      alert(
        "삭제 실패: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setDeleting(false);
    }
  }, [onDelete]);

  const inputClass =
    "w-full rounded-lg border border-card-border bg-card-bg px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/10 transition";

  return (
    <div className="space-y-5 rounded-2xl border border-card-border bg-card-bg p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,.5)] sm:p-8">
      {/* Title */}
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-0 border-b border-card-border bg-transparent px-0 py-3 font-display text-3xl font-semibold text-foreground placeholder:text-muted/40 focus:border-primary focus:outline-none"
      />

      {/* Description */}
      <input
        type="text"
        placeholder="설명 (옵션)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={inputClass}
      />

      {/* Categories + Tags */}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="카테고리 (쉼표 구분)"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
        <input
          type="text"
          placeholder="태그 (쉼표 구분)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
      </div>

      {/* Series + Order + Cover */}
      <div className="grid gap-3 sm:grid-cols-[1fr_7rem_1.5fr]">
        <input
          type="text"
          placeholder="시리즈 (옵션)"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
        <input
          type="number"
          placeholder="순서"
          value={seriesOrder}
          onChange={(e) => setSeriesOrder(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="커버 이미지 URL (옵션)"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          className={`flex-1 ${inputClass}`}
        />
      </div>

      {/* Editor */}
      <div data-color-mode="auto" className="overflow-hidden rounded-lg border border-card-border">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={500}
          preview="live"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {isEditMode && onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-red-300 dark:border-red-800 px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
            >
              {deleting ? "삭제 중..." : "삭제하기"}
            </button>
          )}
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {publishing
            ? isEditMode
              ? "수정 중..."
              : "발행 중..."
            : isEditMode
              ? "수정하기"
              : "발행하기"}
        </button>
      </div>
    </div>
  );
}
