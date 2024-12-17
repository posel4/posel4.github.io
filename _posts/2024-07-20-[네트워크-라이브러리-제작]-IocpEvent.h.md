---
layout: post
date: 2024-07-20
title: "[네트워크 라이브러리 제작] IocpEvent.h"
tags: [cpp, rookiss, ]
categories: [Server, ]
---



{% raw %}
```c++
enum class EventType : uint8
{
	Connect,
	Disconnect,
	Accept,
	//PreRecv,
	Recv,
	Send
};
```
{% endraw %}




{% raw %}
```c++
/*--------------
	IocpEvent
---------------*/

class IocpEvent : public OVERLAPPED
{
public:
	IocpEvent(EventType type);

	void			Init();

public:
	EventType		eventType;
	IocpObjectRef	owner;
};
```
{% endraw %}




{% raw %}
```c++
/*----------------
	ConnectEvent
-----------------*/

class ConnectEvent : public IocpEvent
{
public:
	ConnectEvent() : IocpEvent(EventType::Connect) { }
};
```
{% endraw %}




{% raw %}
```c++
/*--------------------
	DisconnectEvent
----------------------*/

class DisconnectEvent : public IocpEvent
{
public:
	DisconnectEvent() : IocpEvent(EventType::Disconnect) { }
};
```
{% endraw %}




{% raw %}
```c++
/*----------------
	AcceptEvent
-----------------*/

class AcceptEvent : public IocpEvent
{
public:
	AcceptEvent() : IocpEvent(EventType::Accept) { }

public:
	SessionRef	session = nullptr;
};
```
{% endraw %}




{% raw %}
```c++
/*----------------
	RecvEvent
-----------------*/

class RecvEvent : public IocpEvent
{
public:
	RecvEvent() : IocpEvent(EventType::Recv) { }
};
```
{% endraw %}




{% raw %}
```c++
/*----------------
	SendEvent
-----------------*/

class SendEvent : public IocpEvent
{
public:
	SendEvent() : IocpEvent(EventType::Send) { }
	 
	Vector<SendBufferRef> sendBuffers;
};
```
{% endraw %}


