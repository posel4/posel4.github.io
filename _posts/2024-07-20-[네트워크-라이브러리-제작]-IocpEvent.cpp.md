---
layout: post
date: 2024-07-20
title: "[네트워크 라이브러리 제작] IocpEvent.cpp"
tags: [cpp, rookiss, ]
categories: [Server, ]
---



{% raw %}
```c++
/*--------------
	IocpEvent
---------------*/

IocpEvent::IocpEvent(EventType type) : eventType(type)
{
	Init();
}

void IocpEvent::Init()
{
	OVERLAPPED::hEvent = 0;
	OVERLAPPED::Internal = 0;
	OVERLAPPED::InternalHigh = 0;
	OVERLAPPED::Offset = 0;
	OVERLAPPED::OffsetHigh = 0;
}
```
{% endraw %}



[Untitled](https://www.notion.so/28f84806cee44213ba8e4e7d688f6bc2) 

