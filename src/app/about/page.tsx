import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "소개 페이지",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-3xl font-bold text-foreground">About</h1>
      <div className="mt-8 prose dark:prose-invert">
        <p>
          안녕하세요! 개발하면서 배운 것들을 기록하는 블로그입니다.
        </p>
        <p>
          주로 인증(Authentication), WebSocket, 백엔드 개발에 관한 글을 씁니다.
        </p>
        <h2>Tech Stack</h2>
        <ul>
          <li>Backend: Java / Spring Boot</li>
          <li>Frontend: TypeScript / React</li>
        </ul>
        <h2>Contact</h2>
        <ul>
          <li>
            GitHub:{" "}
            <a href="https://github.com/posel4" target="_blank" rel="noopener noreferrer">
              @posel4
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
