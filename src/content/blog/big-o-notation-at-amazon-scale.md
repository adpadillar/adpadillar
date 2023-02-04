---
title: An overview of Big O Notation and an example at Amazon scale
publishDate: February 3, 2023
description: In computer science, Big O Notation describes how the runtime of an algorithm scales as it's input size gets bigger. This matters a lot, speacially when you're dealing with the scale of a company like Amazon.
---

**In computer science, Big O Notation describes how the runtime of an algorithm scales as it's input size gets bigger. This matters a lot, speacially when you're dealing with the scale of a company like Amazon.**

## What is Big O Notation

Big O Notation is a tool used in fields like mathematics and computer science to describe how a function scales according to it's input. In software development, it is normally used to describe how the runtime of an algorithm will scale as it's input size grows. Take the following function for example:

```python
def printNumber(n: int):
    print(f"The number you entered is ${n}")
```

This function takes a number `n` as it's input and prints it to the screen. This algorithm runs in **constant time**, because while `n` grows in value aproaching infinity, the runtime of this algorithm will stay the same, because it always makes the same amount of work. We can say this algorithm has a time complexity of $O(1)$.

Now let's consider the following algorithm:

```python
def printNumbers(n: int):
    for i in range(n):
        print(i)
```

This algorithm runs in **linear time**, because it's runtime increases linearly as `n` grows up to infinity. To put it simply, if it takes 1 ms to run this function when $n=1$, it will take roughly 1000 ms to run when $n = 1000$. We can say this algorithm has a time complexity of $O(n)$.

If we plot both a linear function $f(x)$ and a constant function $g(x)$, there will always be a value $x$ from where $f(x) > g(x)$.

![338ea838-bac8-46c8-b0dd-5709c1311466.png](https://storage.googleapis.com/blog-axelpadilla.appspot.com/marktext%2Fimg%2F338ea838-bac8-46c8-b0dd-5709c1311466.png)

As you can see, no matter how separate the initial points of the functions are, eventually the value of $g(x)$, the constant function, will be lower than the value of $f(x)$, the linear function. Remember this functions are representing an algorithms runtime, so lower is better.

## What does Amazon have to do with this?

Amazon is a Cloud Company first, with AWS accounting for most of it's revenue. They sometimes need to transfer huge amounts of data from a customer to it's servers, a process which you can imagine takes $O(n)$ time. The more data there is, the more time it will take for it to be sent to Amazon's datacenters. When you're working with petabytes and petabytes of data, $O(n)$ may still be too slow.

Amazon found a way around this problem, a way to transfer data at $O(1)$ time! How did they do this? What was the clever algorithm they discovered to transfer data in constant time? The answer may be a little bit surprising: *trucks*.

## AWS Snowball

Yes, you read right, trucks. Amazon sends a truck and physically loads the customer's data all at once. It takes the drives from the customer to it's datacenters with a service they call [AWS Snowball](https://aws.amazon.com/snowball/), and it takes (roughly) the same amount of time regardless of how much data you move, aka $O(1)$. 

I found this very clever and funny, moving the drives physically would have to be faster at some point, and Amazon has clearly found themeselves past the point in the previous graph, where physically moving the drives is now faster than transfering the data through the internet.

![](https://d1.awsstatic.com/cloud-storage/Storage/aws-snow-family-snowcone-snowball-snowmobile.a25e546daeb034621917b5350229456e525a1461.png)
