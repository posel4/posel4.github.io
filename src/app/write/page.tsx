import { Suspense } from "react";
import WriteContent from "@/components/WriteContent";

export default function WritePage() {
  return (
    <Suspense>
      <WriteContent />
    </Suspense>
  );
}
