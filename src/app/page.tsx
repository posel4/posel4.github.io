import { Suspense } from "react";
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/posts";
import HomeContent from "@/components/HomeContent";

export default function HomePage() {
  const allPosts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <Suspense>
      <HomeContent
        allPosts={allPosts}
        categories={categories}
        tags={tags}
      />
    </Suspense>
  );
}
