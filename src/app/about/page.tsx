import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "소개 페이지",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="eyebrow">ABOUT</p>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-[-.03em] text-foreground">
        안녕하세요, 백엔드 개발자 정예림입니다.
      </h1>
      <div className="mt-10 max-w-3xl border-t border-card-border pt-10 prose prose-lg dark:prose-invert">
        <p>
          Java와 Spring을 기반으로 실시간 서비스와 협업 플랫폼을 개발하고
          운영합니다.
        </p>
        <p>
          성능 문제를 감으로 판단하기보다 측정으로 확인하고, 장애를 한 번의
          조치로 끝내기보다 다시 추적할 수 있는 구조로 만드는 일에 관심이
          많습니다. 이곳에는 만들고 운영하며 배운 내용을 솔직하게 기록합니다.
        </p>
        <h2>주로 다루는 것</h2>
        <ul>
          <li>Java, Kotlin, Spring Boot</li>
          <li>WebSocket, Netty, 실시간 메시징</li>
          <li>MySQL, Redis, RabbitMQ, Kafka</li>
          <li>성능 테스트, 장애 분석, 운영 자동화</li>
        </ul>
        <h2>연락처</h2>
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
