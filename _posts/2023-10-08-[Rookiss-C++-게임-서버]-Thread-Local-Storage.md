---
layout: post
date: 2023-10-08
title: "[Rookiss C++ 게임 서버] Thread Local Storage"
tags: [cpp, rookiss, ]
categories: [Server, ]
---


다른 스레드는 접근할 수 없는 나만의 전역 메모리


힙(new), 데이터(static) 영역은 스레드끼리 공유하고


스택 영역은 각자 사용하는데


스택에 데이터를 저장하기에는 스택은 너무 불안정하기 때문에


TLS에 저장하는 것이 좋다


네트워크 통신을 할 때 필요한 sendBuffer 같은 것을 TLS에 저장하는 편이다

