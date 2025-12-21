---
title: "브라우저 WebSocket API 헤더 제한 문제"
date: 2025-12-21
categories: [WebSocket]
tags: [websocket, browser, authentication, security]
---

## 브라우저 WebSocket 헤더 제한 문제

브라우저의 `new WebSocket()` API는 커스텀 헤더를 지원하지 않습니다:

```javascript
// 브라우저에서 이렇게 할 수 없음!
const ws = new WebSocket('ws://server/ws/123/456', {
  headers: { 'Authorization': 'Bearer xxx' }  // ❌ 지원 안됨
});
```

이 문제를 해결하는 4가지 방법을 비교해보겠습니다.

---

## 방법 1: Sec-WebSocket-Protocol 헤더 활용

WebSocket 표준에서 유일하게 설정 가능한 헤더인 Sec-WebSocket-Protocol에 토큰을 담는 방식입니다.

### 클라이언트 (브라우저)

```javascript
const token = 'eyJhbGci...';
const ws = new WebSocket(
  'ws://server/ws/123/456',
  ['Bearer', token]  // 서브프로토콜로 전달
);
```

### 서버

```java
// Sec-WebSocket-Protocol 헤더에서 토큰 추출
String protocolHeader = request.getHeaders().getFirst("Sec-WebSocket-Protocol");
// "Bearer, eyJhbGci..." 형태로 전달됨
String[] parts = protocolHeader.split(", ");
String token = parts[1];
```

| 장점                   | 단점                             |
| :--------------------- | :------------------------------- |
| 브라우저 네이티브 지원 | 표준의 의도와 다른 사용 (해킹적) |
| 추가 라이브러리 불필요 | 일부 프록시에서 문제 가능        |
| 구현 간단              | 토큰이 프로토콜 협상 로그에 노출 |

---

## 방법 2: 첫 번째 메시지로 인증

WebSocket 연결 후 첫 번째 메시지로 토큰을 전송하는 방식입니다.

### 클라이언트 (브라우저)

```javascript
const ws = new WebSocket('ws://server/ws/123/456');

ws.onopen = () => {
  // 연결 후 첫 메시지로 인증
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'eyJhbGci...'
  }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'auth_success') {
    console.log('인증 성공!');
  }
};
```

### 서버

```java
// WebSocket 핸들러에서 첫 메시지 처리
@Override
public Mono<Void> handle(WebSocketSession session) {
    return session.receive()
        .take(1)  // 첫 번째 메시지
        .flatMap(message -> {
            AuthMessage auth = parseAuthMessage(message);
            if (validateToken(auth.token)) {
                session.getAttributes().put("authenticated", true);
                return session.send(Mono.just(successMessage));
            }
            return session.close();  // 인증 실패시 연결 종료
        })
        .then(handleAuthenticatedMessages(session));
}
```

| 장점                    | 단점                           |
| :---------------------- | :----------------------------- |
| 표준 준수               | 인증 전 연결이 이미 수립됨     |
| 구현 직관적             | 인증 전 리소스 소비 (DoS 취약) |
| 유연한 인증 데이터 전송 | 메시지 순서 관리 필요          |

---



## 방법 3: 쿠키 기반 인증

HttpOnly 쿠키에 토큰을 저장하고, WebSocket 연결 시 자동 전송되는 방식입니다.

### 클라이언트 (브라우저)

```javascript
// 1. 먼저 로그인 API 호출 (쿠키 설정됨)
await fetch('/api/login', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ username, password })
});

// 2. WebSocket 연결 (쿠키 자동 전송)
const ws = new WebSocket('ws://server/ws/123/456');
// 브라우저가 자동으로 Cookie 헤더 포함
```

### 서버

```java
// 쿠키에서 세션 ID 추출
private String extractSessionIdFromCookie(ServerHttpRequest request) {
    String cookieHeader = request.getHeaders().getFirst("Cookie");
    // ...
}

// 쿠키에 JWT 토큰도 저장하면 됨
private String extractTokenFromCookie(ServerHttpRequest request) {
    // AUTH_TOKEN=eyJhbGci... 형태로 추출
}
```

| 장점                  | 단점                       |
| :-------------------- | :------------------------- |
| 브라우저 자동 전송    | CSRF 공격 취약 (대책 필요) |
| HttpOnly로 XSS 방어   | 쿠키 크기 제한 (4KB)       |
| 기존 세션 관리와 통합 | Cross-origin 설정 복잡     |

---



## 방법 4: 일회용 티켓 방식 (권장)

REST API로 일회용 티켓을 발급받고, 이를 URL 파라미터로 전달하는 방식입니다.

### 흐름

```
1. 클라이언트 → 서버: POST /api/ws-ticket (Authorization: Bearer JWT)
2. 서버 → 클라이언트: { "ticket": "abc123", "expiresIn": 30 }
3. 클라이언트 → 서버: WebSocket ws://server/ws/123/456?ticket=abc123
4. 서버: 티켓 검증 후 삭제 (일회용)
```

### 클라이언트 (브라우저)

```javascript
// 1. 일회용 티켓 발급 (여기서는 Authorization 헤더 사용 가능)
const response = await fetch('/api/ws-ticket', {
  headers: { 'Authorization': 'Bearer ' + jwtToken }
});
const { ticket } = await response.json();

// 2. 티켓으로 WebSocket 연결
const ws = new WebSocket(`ws://server/ws/123/456?ticket=${ticket}`);
```

### 서버 - 티켓 발급 API

```java
@PostMapping("/api/ws-ticket")
public Mono<TicketResponse> issueTicket(@RequestHeader("Authorization") String auth) {
    String jwt = auth.substring(7);  // "Bearer " 제거

    // JWT 검증
    Authentication authentication = validateJwt(jwt);

    // 일회용 티켓 생성 (30초 만료)
    String ticket = UUID.randomUUID().toString();
    ticketStore.put(ticket, authentication, Duration.ofSeconds(30));

    return Mono.just(new TicketResponse(ticket, 30));
}
```

### 서버 - WebSocket 티켓 검증

```java
private String extractBearerToken(ServerHttpRequest request) {
    // 1. Authorization 헤더 확인 (Native 클라이언트용)
    String authHeader = request.getHeaders().getFirst("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }

    // 2. 티켓 파라미터 확인 (브라우저용)
    String ticket = request.getQueryParams().getFirst("ticket");
    if (ticket != null) {
        Authentication auth = ticketStore.getAndRemove(ticket);  // 일회용
        if (auth != null) {
            return auth.getJwtToken();  // 또는 직접 Authentication 반환
        }
        throw new AuthenticationException("Invalid or expired ticket");
    }

    throw new AuthenticationException("Authorization header or ticket required");
}
```

| 장점                            | 단점                             |
| :------------------------------ | :------------------------------- |
| JWT가 URL에 직접 노출 안됨      | 추가 API 엔드포인트 필요         |
| 일회용이라 탈취해도 재사용 불가 | 티켓 저장소 관리 필요 (Redis 등) |
| 30초 만료로 보안 강화           | 구현 복잡도 증가                 |
| 브라우저/Native 모두 지원       |                                  |

---

## 방법 비교 요약

| 방법                       | 보안성 | 구현 난이도 | 브라우저 지원 | 권장 상황                 |
| :------------------------- | :----- | :---------- | :------------ | :------------------------ |
| **Sec-WebSocket-Protocol** | ⭐⭐     | 쉬움        | ✅             | 빠른 구현 필요시          |
| **첫 메시지 인증**         | ⭐⭐     | 보통        | ✅             | 인증 전 연결 허용 가능시  |
| **쿠키 기반**              | ⭐⭐⭐    | 보통        | ✅             | 기존 세션 시스템 활용시   |
| **일회용 티켓**            | ⭐⭐⭐⭐   | 어려움      | ✅             | 보안이 중요한 경우 (권장) |

---

## 추천

**보안이 중요하다면**: 방법 4 (일회용 티켓)

- JWT가 URL에 직접 노출되지 않음
- 티켓이 탈취되어도 일회용이라 재사용 불가
- Native 클라이언트는 Authorization 헤더, 브라우저는 티켓 사용

**빠른 구현이 필요하다면**: 방법 1 (Sec-WebSocket-Protocol)

- 가장 간단한 구현
- 브라우저 네이티브 지원



---

## 클라이언트별 지원 현황

| 클라이언트 종류          | Authorization 헤더 사용 | 대안 필요 |
| :----------------------- | :---------------------- | :-------- |
| 서버 (Java, Node.js 등)  | ✅ 가능                  | 불필요    |
| Native 앱 (iOS, Android) | ✅ 가능                  | 불필요    |
| 브라우저 JavaScript      | ❌ 불가능                | 필요      |
