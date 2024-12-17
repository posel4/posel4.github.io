---
layout: post
date: 2023-10-08
title: "[Rookiss C++ 게임 서버] Future"
tags: [cpp, rookiss, ]
categories: [Server, ]
---


mutex, condition_variable같은 무거운 거 말고 가벼운 건 없나? 한 번만 쓸 건데.. ⇒ future


직원 대신 단기 알바



#### std::async


원하는 함수를 비동기적으로 실행



{% raw %}
```c++
// 1) deferred -> lazy evalutaion 지연해서 실행하세요
//                                (준비만 해놓고 실행 자체는 get() 했을 때 됨)
// 2) async -> 별도의 쓰레드를 만들어서 실행하세요
// 3) deferred | async -> 둘 중 알아서 골라주세요

// 언젠가 미래에 결과물을 뱉어줄거야!
std::future<int64> future = std::async(std::launch::async, Calculate);

int64 sum = future.get(); // 결과물이 이제서야 필요하다!
```
{% endraw %}








#### std::promise


결과물을 promise를 통해 future로 받아줌



{% raw %}
```c++
// 미래(std::future)에 결과물을 반환해줄꺼라 약속(std::promise)해줘~ (계약서?)
std::promise<string> promise;
std::future<string> future = promise.get_future();

thread t(PromiseWorker, std::move(promise);

string message = future.get();
cout << message << endl;

t.join();
```
{% endraw %}




{% raw %}
```c++
void PromiseWorker(std::promise<string>&& promise) 
{
	promise.set_value("Secret Message");
}
```
{% endraw %}




#### std::packaged_task


원하는 함수의 실행 결과를 packaged_task를 통해 future로 받아줌


쓰레드에게 여러 개의 일감을 줄 수 있음

- TaskWorker의 파라미터인 task를 여러 개


{% raw %}
```c++
// std::packaged_task<함수의output타입(함수의input타입)> task(함수)
std::packaged_task<int64(void)> task(Calculate);
std::future<int64> future = task.get_future();

std::thread t(TaskWorker, std::move(task));

int64 sum = future.get();
cout << sum << endl;

t.join();
```
{% endraw %}




{% raw %}
```c++
void TaskWorker(std::packaged_task<int64(void)>&& task)
{
	task();
}
```
{% endraw %}


