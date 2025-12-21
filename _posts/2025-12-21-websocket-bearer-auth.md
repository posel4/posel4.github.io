---
title: "WebSocket Upgrade 요청에서 Bearer 인증 사용 가능 여부"
date: 2025-12-21
categories: [WebSocket]
tags: [websocket, bearer, authentication, browser]
---

## WebSocket Upgrade 요청에서 Bearer 인증 사용 가능 여부

**핵심 문제:** 브라우저의 WebSocket API는 HTTP 핸드셰이크 과정에서 `Authorization`과 같은 커스텀 헤더를 설정하는 것을 허용하지 않습니다. 이것이 WebSocket 인증의 가장 큰 제약입니다.

**RFC 스펙 vs 실제 구현:** RFC6455 스펙은 request header를 통한 토큰 기반 인증 전달을 허용하지만, JavaScript WebSocket 인터페이스에서는 이를 지원하지 않아 개발자들이 URL 파라미터를 통해 인증 정보를 전달할 수밖에 없습니다.

## 대안적 해결책들

1. **URL 쿼리 파라미터 방식** - `wss://domain.com?token=<token>` 형태로 전달. SSL 암호화로 URL도 암호화되지만, 악의적인 공격자가 로그에 접근하면 사용자의 모든 데이터와 기능에 접근할 수 있어서 보안상 위험합니다.

2. **일회용 토큰 방식** - 메인 액세스 토큰으로 임시 일회용 토큰을 요청한 후, 그 단기 토큰을 쿼리 파라미터로 전송합니다. 토큰이 서버에 로깅될 때쯤이면 이미 사용되었거나 만료되어 있을 가능성이 높습니다.

3. **Sec-WebSocket-Protocol 헤더 활용** - 브라우저 WebSocket API가 `Sec-WebSocket-Protocol` 헤더 값 설정은 허용하기 때문에, 이를 통해 토큰을 전달할 수 있습니다. Kubernetes도 이 방식을 사용하며, `base64url.bearer.authorization.k8s.io.<encoded-token>` 형식으로 bearer 토큰을 subprotocol로 전달합니다.

4. **첫 번째 메시지로 인증** - WebSocket 연결 후 첫 메시지로 토큰을 전송하는 방식

5. **쿠키 기반 인증** - HTTP 쿠키 인증은 옵션이지만 항상 적합하지 않고 CSRF에 취약할 수 있습니다.

## 서버 측 클라이언트의 경우

Python이나 Node.js 같은 서버 측 WebSocket 클라이언트를 사용한다면 `Authorization` 헤더를 자유롭게 설정할 수 있습니다. 제약은 오직 브라우저 JavaScript API에만 해당됩니다.

```java
// Java WebSocket 클라이언트 - 헤더 설정 가능
WebSocketClient client = new ReactorNettyWebSocketClient();
HttpHeaders headers = new HttpHeaders();
headers.set("Authorization", "Bearer eyJhbG...");
client.execute(uri, headers, session -> ...);
```

```javascript
// Node.js WebSocket 클라이언트 - 헤더 설정 가능
const WebSocket = require('ws');
const ws = new WebSocket('wss://server.com/ws', {
  headers: { 'Authorization': 'Bearer eyJhbG...' }
});
```
