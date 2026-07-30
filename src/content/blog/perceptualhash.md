---
title: "Finding Duplicate Videos with Perceptual Hashing"
description: ""
date: "2026-07-09"
---

Recently, at a platform I work on, I encountered an interesting problem. We handle a large amount of video content, and as an attempt to lower our bandwidth, we were looking into ways we could deduplicate video files so we don't send the same video multiple times. This worked great, until we still had duplicate videos in our system. What was going on? Why were there duplicates? Well, after some investigation, we found that these duplicates were actually different versions of the same video, just encoded with different compression settings or metadata.

I was sent on an experiment to figure out how we can handle the deduplication of these kinds of videos. Ultimately, I ended up learning about perceptual hashing, a fundamental fingerprinting technique.

## Understanding Perceptual Hashing

There are several perceptual hashing algorithms in widespread use. Each algorithm
