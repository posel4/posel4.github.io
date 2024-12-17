---
layout: post
date: 2023-10-07
title: "[Rookiss C++ 게임 서버] Mutex"
tags: [cpp, rookiss, ]
categories: [Server, ]
---



### Mutual Exclusive(상호배타적)


꼭 lock(), unlock() 쌍을 맞춰주어야 하는 불편함이 있다.



{% raw %}
```c++
#include <mutex>

mutex m;

m.lock();
m.unlock();
```
{% endraw %}




### RAII (Resource Acquisition Is Initialization)


생성자에서 lock, 소멸자에서 unlock

- lock(), unlock() 쌍 맞추는 것을 신경쓰지 않아도 된다.


#### 1. LockGuard (custom)



{% raw %}
```c++
template<typename T>
class LockGuard
{
public:
	LockGuard(T& m)
	{
		_mutex = &m;
		_mutex->lock();
	}

	~LockGuard()
	{
		_mutex->unlock();
	}

private:
	T* _mutex;
};
```
{% endraw %}




{% raw %}
```c++
#include <mutex>

mutex m;

LockGaurd(std::mutex> lockGuard(m); // 객체가 유효하지 않게 될 때 자동으로 unlock
```
{% endraw %}




#### 2. std::lock_guard


std 표준에도 구현되어있다.



{% raw %}
```c++
#include <mutex>

mutex m;

std::lock_guard<std::mutex> lockGaurd(m);
```
{% endraw %}




#### 3. std::unique_lock


비슷한 게 하나 더 있다.

- 장점: 객체 생성하자마자 바로 lock 거는 게 아니라, lock 거는 시점을 임의로 변경할 수 있다.
	- uniqueLock.lock();
- 단점: std::lock_guard()보다 약간 느리다.


{% raw %}
```c++
#include <mutex>

mutex m;

std::unique_lock<std::mutex> uniqueLock(m, std::defer_lock);

uniqueLock.lock();
```
{% endraw %}


