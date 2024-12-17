---
layout: post
date: 2023-10-07
title: "[Rookiss C++ 게임 서버] Conditional Variable"
tags: [cpp, rookiss, ]
categories: [Server, ]
---


user mode.


커널 오브젝트를 사용하는 Event 방식보다 추천되는 방식이다.



{% raw %}
```c++
condition_variable cv; // 이건 std::mutex와 짝꿍. 
											 // 다른 걸 쓰려면 condition_variable_any 사용.

int main()
{
	thread t1(Producer);
	thread t2(Consumer);

	t1.join();
	t2.join();
}
```
{% endraw %}




{% raw %}
```c++
void Producer()
{
	while(true)
	{
		// 1) Lock을 잡고
		// 2) 공유 변수 값을 수정
		// 3) Lock을 풀고
		// 4) 조건변수 통해 다른 쓰레드에게 통지

		{
			unique_lock<mutex> lock(m);
			q.push(100);
		}
		
		cv.notify_one(); // wait중인 쓰레드가 있으면 딱 1개를 깨운다
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
		unique_lock<mutex> lock(m);
		cv.wait(lock, []() { return q.empty() == false; });
		// 1) Lock을 잡고
		// 2) 조건 확인
		// - 만족O => 빠져나와서 이어서 코드를 진행
		// - 만족x => Lock을 풀어주고 대기 상태

		// Q. 그런데 notify_one()을 했으면 항상 조건식을 만족하는 것 아날까?
		// A. notify_one() 후 여기서 깨어나는 사이에 조건이 바뀌었을 수 있다. 따라서 재확인.

		// if(q.empty() == false) // --> 이게 cv.wait() 내부로 이동!	{
			int32 data = q.front();
			q.pop();
		}
	}
}
```
{% endraw %}


