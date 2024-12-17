---
layout: post
date: 2024-07-20
title: "[네트워크 라이브러리 제작] Socket Utils"
tags: [cpp, rookiss, ]
categories: [Server, ]
---



{% raw %}
```c++
LPFN_CONNECTEX		SocketUtils::ConnectEx = nullptr;
LPFN_DISCONNECTEX	SocketUtils::DisconnectEx = nullptr;
LPFN_ACCEPTEX		SocketUtils::AcceptEx = nullptr;
```
{% endraw %}



`LPFN_CONNECTEX`

- Windows 소켓 확장 함수인 `ConnectEx` 함수에 대한 함수 포인터 타입을 정의한 것
- Windows 소켓 API에서 제공하는 확장 기능을 사용하기 위해 정의된 타입 중 하나
- `ConnectEx` 함수는 비동기 소켓 연결을 설정하는데 사용
- `LPFN_CONNECTEX`는 이 함수를 가리키는 함수 포인터 타입

---



### void SocketUtils::Init()



{% raw %}
```c++
void SocketUtils::Init()
{
	WSADATA wsaData;
	ASSERT_CRASH(::WSAStartup(MAKEWORD(2, 2), OUT &wsaData) == 0);
	
	/* 런타임에 주소 얻어오는 API */
	SOCKET dummySocket = CreateSocket();
	ASSERT_CRASH(BindWindowsFunction(dummySocket, WSAID_CONNECTEX, reinterpret_cast<LPVOID*>(&ConnectEx)));
	ASSERT_CRASH(BindWindowsFunction(dummySocket, WSAID_DISCONNECTEX, reinterpret_cast<LPVOID*>(&DisconnectEx)));
	ASSERT_CRASH(BindWindowsFunction(dummySocket, WSAID_ACCEPTEX, reinterpret_cast<LPVOID*>(&AcceptEx)));
	Close(dummySocket);
}
```
{% endraw %}




WinSock을 초기화하고, 비동기 소켓 작업을 위해 `ConnectEx`, `DisconnectEx`, `AcceptEx` 함수 포인터를 설정합니다. 이를 통해 런타임에서 동적으로 해당 함수들을 사용할 수 있게 됩니다.


- **WSADATA wsaData;**
	- WinSock 초기화 정보를 담기 위한 구조체를 선언
- **ASSERT_CRASH(::WSAStartup(MAKEWORD(2, 2), OUT &wsaData) == 0);**
	- WinSock을 초기화합니다.
	- `MAKEWORD(2, 2)`는 WinSock 2.2 버전을 사용하겠다는 의미
	- `WSAStartup` 함수는 성공하면 0을 반환
	- 이 반환값이 0이 아닌 경우 프로그램이 크래시하도록 `ASSERT_CRASH` 매크로를 사용
- **SOCKET dummySocket = CreateSocket();**
	- 확장 함수의 주소를 얻기 위해 임시 소켓을 생성
	- `CreateSocket` 함수는 소켓을 생성하고 반환하는 함수
- _**ASSERT_CRASH(BindWindowsFunction(dummySocket, WSAID_CONNECTEX, reinterpret_cast<LPVOID>(&ConnectEx)));**_
	- `WSAID_CONNECTEX` GUID를 사용하여 `ConnectEx` 함수의 주소를 가져와 `ConnectEx` 함수 포인터에 할당합니다.
	- `BindWindowsFunction` 함수는 `WSAIoctl`을 사용하여 확장 함수의 주소를 가져오는 함수입니다. 반환값이 false일 경우 프로그램이 크래시합니다.
- _**ASSERT_CRASH(BindWindowsFunction(dummySocket, WSAID_DISCONNECTEX, reinterpret_cast<LPVOID**_**>(&DisconnectEx)));**
	- 위와 동일한 방식으로 `DisconnectEx` 함수의 주소를 가져와 `DisconnectEx` 함수 포인터에 할당합니다.
- _**ASSERT_CRASH(BindWindowsFunction(dummySocket, WSAID_ACCEPTEX, reinterpret_cast<LPVOID>(&AcceptEx)));**_
	- 위와 동일한 방식으로 `AcceptEx` 함수의 주소를 가져와 `AcceptEx` 함수 포인터에 할당합니다.
- **Close(dummySocket);**
	- 사용이 끝난 임시 소켓을 닫습니다.

---



### void SocketUtils::Clear()



{% raw %}
```c++
void SocketUtils::Clear()
{
	::WSACleanup();
}
```
{% endraw %}



`SocketUtils::Clear` 함수는 WinSock API의 정리 작업을 수행합니다. 


이 함수는 `WSACleanup` 함수를 호출하여 WinSock을 초기화한 프로그램의 리소스를 해제합니다. 

- ::WSACleanup()
	- `WSACleanup` 함수는 WinSock을 사용하는 애플리케이션이 호출하는 정리 함수
	- WinSock 초기화(`WSAStartup`) 시 할당된 모든 리소스를 해제하고, WinSock 2 DLL을 해제
	- 프로그램이 WinSock을 더 이상 사용하지 않을 때 호출

`WSACleanup` 함수는 WinSock 초기화 시 호출된 `WSAStartup` 함수와 대응됩니다. 


`WSAStartup`이 여러 번 호출된 경우, `WSACleanup`도 같은 횟수만큼 호출되어야 실제로 리소스가 해제됩니다.


---



### bool SocketUtils::BindWindowsFunction



{% raw %}
```c++
bool SocketUtils::BindWindowsFunction(SOCKET socket, GUID guid, LPVOID* fn)
{
	DWORD bytes = 0;
	return SOCKET_ERROR != ::WSAIoctl(socket, SIO_GET_EXTENSION_FUNCTION_POINTER, &guid, sizeof(guid), fn, sizeof(*fn), OUT & bytes, NULL, NULL);
}
```
{% endraw %}



`SocketUtils::BindWindowsFunction` 함수는 WinSock 확장 함수의 주소를 소켓을 통해 런타임에 동적으로 가져오는 역할을 합니다. 


이 함수는 `WSAIoctl` API를 사용하여 특정 GUID와 연관된 확장 함수의 주소를 가져오고, 이를 함수 포인터에 할당합니다.

- **DWORD bytes = 0;**
	- `WSAIoctl` 함수 호출 시 실제로 반환된 바이트 수를 저장하기 위한 변수를 선언하고 초기화합니다.
- **::WSAIoctl**
	- `WSAIoctl` 함수는 소켓의 동작을 제어하거나 확장 기능을 사용할 수 있도록 설정합니다. 
	이 함수는 WinSock의 고급 기능을 사용할 때 필요합니다.
	- 매개변수 설명:
		- `socket`: 소켓 핸들
		- `SIO_GET_EXTENSION_FUNCTION_POINTER`: 확장 함수의 포인터를 얻기 위한 제어 코드
		- `&guid`: 확장 함수의 GUID를 가리키는 포인터
		- `sizeof(guid)`: GUID의 크기
		- `fn`: 확장 함수의 주소를 저장할 포인터
		- `sizeof(*fn)`: 함수 포인터의 크기
		- `OUT &bytes`: 실제로 반환된 바이트 수를 저장할 변수
		- `NULL, NULL`: 이 함수 호출에서는 사용되지 않는 두 개의 추가 매개변수입니다.
- **return SOCKET_ERROR != ::WSAIoctl(...)**
	- `WSAIoctl` 함수 호출의 반환값이 `SOCKET_ERROR`가 아닌 경우에 `true`를 반환합니다.
	- 즉, 함수 호출이 성공하면 `true`를 반환하고, 실패하면 `false`를 반환합니다.

---



### SOCKET SocketUtils::CreateSocket()



{% raw %}
```c++
SOCKET SocketUtils::CreateSocket()
{
	return ::WSASocket(AF_INET, SOCK_STREAM, IPPROTO_TCP, NULL, 0, WSA_FLAG_OVERLAPPED);
}
```
{% endraw %}



`SocketUtils::CreateSocket` 함수는 WinSock을 사용하여 새로운 소켓을 생성하는 함수입니다. 


이 함수는 `WSASocket` API를 호출하여 소켓을 생성하고 반환합니다. 


이 소켓은 비동기 I/O 작업을 지원하도록 설정되어 있습니다.


- **::WSASocket(AF_INET, SOCK_STREAM, IPPROTO_TCP, NULL, 0, WSA_FLAG_OVERLAPPED)**
	- `WSASocket` 함수는 WinSock 소켓을 생성하는 함수
	- 매개변수 설명:
		- `AF_INET`: 주소 패밀리를 IPv4로 설정
		- `SOCK_STREAM`: 소켓 타입을 스트림 소켓으로 설정. 연결 지향형 소켓(TCP)을 의미
		- `IPPROTO_TCP`: 프로토콜을 TCP로 설정
		- `NULL`: 프로토콜 정보(주로 확장 모듈을 지정하는 데 사용)를 지정하지 않으므로 `NULL`로 설정
		- `0`: 소켓 그룹을 지정하지 않으므로 0으로 설정
		- `WSA_FLAG_OVERLAPPED`: 비동기 I/O 작업을 지원하도록 소켓을 설정하는 플래그

---



### bool SocketUtils::SetLinger



{% raw %}
```c++
bool SocketUtils::SetLinger(SOCKET socket, uint16 onoff, uint16 linger)
{
	LINGER option;
	option.l_onoff = onoff;
	option.l_linger = linger;
	return SetSockOpt(socket, SOL_SOCKET, SO_LINGER, option);
}
```
{% endraw %}



`SocketUtils::SetLinger` 함수는 소켓의 LINGER 옵션을 설정하는 함수입니다. 


LINGER 옵션은 소켓이 닫힐 때 남아 있는 데이터가 처리되는 방식을 제어합니다. 


이 함수는 소켓이 닫힐 때 데이터를 즉시 버리거나, 남아 있는 데이터가 모두 전송될 때까지 기다리는 등의 동작을 설정할 수 있습니다.

- LINGER option;
	- LINGER 구조체를 선언
	- 이 구조체는 소켓의 LINGER 옵션을 설정하는 데 사용된다.
- option.l_onoff = onoff;
	- LINGER 옵션을 켜거나 끄는 값을 설정
	- `onoff`가 0이면 LINGER 옵션이 꺼지고, 0이 아니면 켜진다.
- option.l_linger = linger;
	- LINGER 시간을 설정
	- `linger`는 소켓이 닫힐 때 남아 있는 데이터를 전송하기 위해 대기하는 시간(초)
- return SetSockOpt(socket, SOL_SOCKET, SO_LINGER, option);
	- `SOL_SOCKET`: 소켓 수준 옵션을 지정
	- `SO_LINGER`: LINGER 옵션을 지정
	- `option`: 설정할 LINGER 옵션
	- 이 호출의 반환값이 `true`이면 성공, `false`이면 실패를 의미

---



### bool SocketUtils::SetReuseAddress



{% raw %}
```c++
bool SocketUtils::SetReuseAddress(SOCKET socket, bool flag)
{
	return SetSockOpt(socket, SOL_SOCKET, SO_REUSEADDR, flag);
}
```
{% endraw %}



`SocketUtils::SetReuseAddress` 함수는 소켓의 주소 재사용 옵션을 설정하는 함수입니다. 


이 함수는 `SetSockOpt` 함수를 호출하여 소켓 옵션을 설정하는 역할을 합니다.


- **return SetSockOpt(socket, SOL_SOCKET, SO_REUSEADDR, flag);**
	- `SOL_SOCKET`: 소켓 수준의 옵션을 설정하는 것을 명시
	- `SO_REUSEADDR`: 주소 재사용 옵션을 설정. 재사용할 수 있게 됨.
	- `flag`: `SO_REUSEADDR` 옵션의 설정 값으로, `true`면 활성화, `false`면 비활성화

---



### bool SocketUtils::SetRecvBufferSize



{% raw %}
```c++
bool SocketUtils::SetRecvBufferSize(SOCKET socket, int32 size)
{
	return SetSockOpt(socket, SOL_SOCKET, SO_RCVBUF, size);
}
```
{% endraw %}



`SocketUtils::SetRecvBufferSize` 함수는 소켓의 수신 버퍼 크기를 설정하는 함수입니다. 


- **return SetSockOpt(socket, SOL_SOCKET, SO_RCVBUF, size);**
	- `SOL_SOCKET`: 소켓 수준의 옵션을 설정하는 것을 명시
	- `SO_RCVBUF`: 수신 버퍼 크기를 설정. 소켓이 수신할 수 있는 데이터의 최대 크기 지정.
	- `size`: 설정할 수신 버퍼의 크기 지정. 단위는 바이트(byte).

---



### bool SocketUtils::SetSendBufferSize



{% raw %}
```c++
bool SocketUtils::SetSendBufferSize(SOCKET socket, int32 size)
{
	return SetSockOpt(socket, SOL_SOCKET, SO_SNDBUF, size);
}
```
{% endraw %}



---



### bool SocketUtils::SetTcpNoDelay



{% raw %}
```c++
bool SocketUtils::SetTcpNoDelay(SOCKET socket, bool flag)
{
	return SetSockOpt(socket, SOL_SOCKET, TCP_NODELAY, flag);
}
```
{% endraw %}



`SocketUtils::SetTcpNoDelay` 함수는 TCP의 Nagle 알고리즘을 비활성화하는 옵션인 `TCP_NODELAY`를 설정하는 함수입니다.


[Untitled](https://www.notion.so/6c7e65c970e641538b9b93e08ede2b67) 



- **return SetSockOpt(socket, IPPROTO_TCP, TCP_NODELAY, flag);**
	- `SetSockOpt` 함수를 호출하여 소켓 옵션을 설정
	- `IPPROTO_TCP`: TCP 프로토콜 레벨의 옵션을 설정하는 것을 명시
	- `TCP_NODELAY`: Nagle 알고리즘을 비활성화하는 옵션입니다. 이 옵션을 설정하면 작은 데이터 조각이 모여서 하나의 패킷으로 전송되는 것을 방지하고, 데이터가 즉시 전송됩니다.
	- `flag`: `TCP_NODELAY` 옵션의 설정 값으로, `true`면 Nagle 알고리즘 비활성화

---



### bool SocketUtils::SetUpdateAcceptSocket



{% raw %}
```c++
// ListenSocket의 특성을 ClientSocket에 그대로 적용
bool SocketUtils::SetUpdateAcceptSocket(SOCKET socket, SOCKET listenSocket)
{
	return SetSockOpt(socket, SOL_SOCKET, SO_UPDATE_ACCEPT_CONTEXT, listenSocket);
}
```
{% endraw %}



`SocketUtils::SetUpdateAcceptSocket` 함수는 소켓의 특정 옵션인 `SO_UPDATE_ACCEPT_CONTEXT`을 설정하여, `listenSocket`의 특성을 `socket`에 그대로 적용하는 함수입니다. 



- **return SetSockOpt(socket, SOL_SOCKET, SO_UPDATE_ACCEPT_CONTEXT, listenSocket);**
	- `SOL_SOCKET`: 소켓 수준의 옵션을 설정하는 것을 명시
	- `SO_UPDATE_ACCEPT_CONTEXT`: AcceptEx 함수에서 사용되는 소켓 핸들을 업데이트하는 데 사용되는 옵션입니다. 이 옵션을 통해 `socket`의 AcceptEx 연산을 `listenSocket`의 소켓 컨텍스트로 업데이트할 수 있습니다.
	- `listenSocket`: AcceptEx 연산에 사용될 리스닝 소켓의 핸들

---



### bool SocketUtils::Bind



{% raw %}
```c++
bool SocketUtils::Bind(SOCKET socket, NetAddress netAddr)
{
	return SOCKET_ERROR != ::bind(socket, reinterpret_cast<const SOCKADDR*>(&netAddr.GetSockAddr()), sizeof(SOCKADDR_IN));
}
```
{% endraw %}



`SocketUtils::Bind` 함수는 소켓에 네트워크 주소(NetAddress)를 바인딩하는 함수입니다. 


이 함수는 Winsock의 `bind` 함수를 호출하여 소켓에 주소를 할당합니다.


- _**return SOCKET_ERROR != ::bind(socket, reinterpret_cast<const SOCKADDR>(&netAddr.GetSockAddr()), sizeof(SOCKADDR_IN));**_
	- `bind` 함수를 호출하여 소켓에 주소를 바인딩
	- `socket`: 바인딩할 소켓의 핸들
	- `reinterpret_cast<const SOCKADDR*>(&netAddr.GetSockAddr())`:
		- `NetAddress` 객체에서 `SOCKADDR` 구조체로 형변환하여 네트워크 주소를 가져온다.
		- `NetAddress` 클래스는 주소와 포트 정보를 관리하는 클래스
	- `sizeof(SOCKADDR_IN)`: `SOCKADDR_IN` 구조체의 크기. 일반적으로 IPv4 주소와 포트를 담는 구조체.

---



### bool SocketUtils::BindAnyAddress



{% raw %}
```c++
bool SocketUtils::BindAnyAddress(SOCKET socket, uint16 port)
{
	SOCKADDR_IN myAddress;
	myAddress.sin_family = AF_INET;
	myAddress.sin_addr.s_addr = ::htonl(INADDR_ANY);
	myAddress.sin_port = ::htons(port);

	return SOCKET_ERROR != ::bind(socket, reinterpret_cast<const SOCKADDR*>(&myAddress), sizeof(myAddress));
}
```
{% endraw %}



`SocketUtils::BindAnyAddress` 함수는 소켓에 임의의 주소(INADDR_ANY)와 지정된 포트를 바인딩하는 함수입니다.



- **SOCKADDR_IN myAddress;**
	- `SOCKADDR_IN` 구조체를 선언하여 바인딩할 주소 정보를 담는다.
	- `SOCKADDR_IN`은 IPv4 주소와 포트 정보를 담는 구조체
- **myAddress.sin_family = AF_INET;**
	- 주소 체계를 설정한다.
	- `AF_INET`은 IPv4 주소 체계를 의미한다.
- **myAddress.sin_addr.s_addr = ::htonl(INADDR_ANY);**
	- `sin_addr.s_addr`에 `INADDR_ANY`를 할당한다.
	- `INADDR_ANY`는 소켓이 어떤 네트워크 인터페이스에서든 연결을 수락할 수 있도록 한다.
	- 즉, 모든 로컬 인터페이스에서 들어오는 연결을 수락할 수 있게 된다.
- **myAddress.sin_port = ::htons(port);**
	- 포트 번호를 설정
	- `htons` 함수를 사용하여 호스트 바이트 순서를 네트워크 바이트 순서로 변환
- _**return SOCKET_ERROR != ::bind(socket, reinterpret_cast<const SOCKADDR>(&myAddress), sizeof(myAddress));**_
	- `bind` 함수를 호출하여 소켓에 주소를 바인딩

---



### void SocketUtils::Close



{% raw %}
```c++
void SocketUtils::Close(SOCKET& socket)
{
	if (socket != INVALID_SOCKET)
		::closesocket(socket);
	socket = INVALID_SOCKET;
}
```
{% endraw %}







`SocketUtils::Close` 함수는 주어진 소켓을 닫고, 소켓 핸들을 `INVALID_SOCKET`으로 설정하는 함수입니다.


이 함수는 Winsock의 `closesocket` 함수를 호출하여 소켓을 닫습니다.

- **if (socket != INVALID_SOCKET)**
	- 소켓 핸들이 유효한지 확인합니다.
	- `INVALID_SOCKET`은 소켓 핸들의 초기값이며, 유효하지 않은 소켓을 나타냅니다.
- **::closesocket(socket);**
	- `closesocket` 함수를 호출하여 소켓을 닫습니다.
	- 이 함수는 소켓의 리소스를 해제하고 연결을 끊습니다.
- **socket = INVALID_SOCKET;**
	- 소켓 핸들을 `INVALID_SOCKET`으로 설정하여, 이후에 이 소켓 핸들이 다시 사용되지 않도록 합니다.

---



## 참고 자료



#### GUID?

- GUID(Globally Unique Identifier)
- 전 세계적으로 고유한 식별자를 생성하기 위한 표준
- 128비트 값
- 소프트웨어 개발에서 객체, 컴포넌트, 데이터베이스 키 등을 고유하게 식별하기 위해 사용
- 서로 다른 시스템이나 네트워크에서 중복되지 않는 고유한 값을 제공
- GUID는 흔히 하이픈으로 구분된 32개의 16진수 문자로 표현
	- 예) 123e4567-e89b-12d3-a456-426614174000


#### WinSock 확장 함수와 GUID


WinSock 확장 함수의 경우, 각 확장 함수는 고유한 GUID로 식별된다.


예를 들어, `ConnectEx` 함수는 다음과 같은 GUID로 정의될 수 있다:



{% raw %}
```c++
// ConnectEx 함수의 GUID
static const GUID WSAID_CONNECTEX = 
{0x25a207b9, 0xddf3, 0x4660, {0x8e, 0xe9, 0x76, 0xe5, 0xe3, 0xf7, 0x60, 0x7e}};
```
{% endraw %}


