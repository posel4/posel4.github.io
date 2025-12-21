---
title: "Authorization Header란?"
date: 2024-12-21
categories: [인증과 인가]
tags: [http, header, authorization, authentication]
---

## Authorization Header란?

HTTP 요청을 보낼 때 "나는 누구다"라는 것을 서버에게 알려주는 방법입니다.
HTTP 헤더 중 하나로, 클라이언트가 자신의 신원을 증명하기 위해 사용합니다.

```
Authorization: <type> <credentials>
```

### 인증 타입 종류

| 타입 | 설명 | 예시 |
|------|------|------|
| Basic | 사용자ID:비밀번호를 Base64 인코딩 | `Basic dXNlcjpwYXNz` |
| Bearer | OAuth 2.0 토큰 | `Bearer eyJhbGci...` |
| Digest | 해시 기반 인증 | `Digest username="user"...` |

### 사용 예시

```http
GET /api/users HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
