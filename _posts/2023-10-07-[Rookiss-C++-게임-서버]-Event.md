---
layout: post
date: 2023-10-07
title: "[Rookiss C++ 게임 서버] Event"
tags: [cpp, rookiss, ]
categories: [Server, ]
---



{% raw %}
```c++
// 커널 오브젝트
// 1. Usage Count
// 2. Signal / Non-Signal
// 3. Auto / Manual
Handle handle;

int main()
{
	handle = ::CreateEvent(NULL/*보안속성*/, FALSE/*bManualReset*/, FALSE/*bInitialState*/, NULL);

	thread t1(Producer);
	thread t2(Consumer);

	t1.join();
	t2.join();
	
	::CloseHandle(handle);
}
```
{% endraw %}




{% raw %}
```c++
void Producer()
{
	while(true)
	{
		{
			unique_lock<mutex> lock(m);
			q.push(100);
		}
		
		::SetEvent(handle); // Event signal

		this_thread::sleep_for(10000ms);
	}
}
```
{% endraw %}




{% raw %}
```c++
void Consumer()
{
	while(true)
	{
		::WaitForSingleObject(handle, INFINITE); // Wait for event
		
		unique_lock<mutex> lock(m);
		if(q.empty() == false)
		{
			int32 data = q.front();
			q.pop();
		}
	}
}
```
{% endraw %}


