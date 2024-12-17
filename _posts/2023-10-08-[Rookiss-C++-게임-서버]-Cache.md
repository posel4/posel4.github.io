---
layout: post
date: 2023-10-08
title: "[Rookiss C++ 게임 서버] Cache"
tags: [cpp, rookiss, ]
categories: [Server, ]
---



{% raw %}
```javascript
// [][][][][]   [][][][][]    [][][][][]

int32 buffer [10000][10000];

int main()
{
	memset(buffer, 0, sizeof(buffer));
	{
		uint64 start = GetTickCount64();
		int64 sum = 0;
		for (int32 i = 0; i < 10000; i++) {
			for (int32 j = 0; j < 10000; j++) {
				sum += buffer[i][j]; // 옆에 있는 걸 순서대로 가져오는 경우 (cash hit)
			}
		}

		uint64 end = GetTickCount64();
		cout << "Elapsed Tick " << (end - start) << endl; // 빠르다
	}

	{
		uint64 start = GetTickCount64();
		int64 sum = 0;
		for (int32 i = 0; i < 10000; i++) {
			for (int32 j = 0; j < 10000; j++) {
				sum += buffer[j][i]; // 건너뛰어가면서 가져오는 경우 (cash hit X)
			}
		}

		uint64 end = GetTickCount64();
		cout << "Elapsed Tick " << (end - start) << endl; // 느리다
}
```
{% endraw %}


