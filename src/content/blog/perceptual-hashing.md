---
title: "Finding Duplicate Videos with Perceptual Hashing"
description: "SHA-256 can't see that two videos look identical. How DCT perceptual hashes work, and the false positives that taught me the real rules."
date: 2026-07-16
---

The platform I work on deduplicates video ads by content hash: same bytes, same SHA-256, stored once. That works right up until the same ad arrives re-encoded at a different bitrate or resolution. Now the bytes are completely different, the SHA-256 is completely different, and the videos are visually identical.

I wanted to know how many of those hidden duplicates we had. That meant learning about perceptual hashing: fingerprinting what a video *looks like* instead of what its bytes are.

## Understanding Perceptual Hashing

Cryptographic hashes are designed so that flipping one input bit scrambles the whole output (the avalanche effect). For dedup by appearance, that property is exactly the enemy. A perceptual hash is the opposite: similar-looking inputs should produce similar (or identical) hashes.

The classic image algorithm is the DCT-based pHash, and it fits in four steps:

1. **Normalize**: shrink the image to 32x32 grayscale. This throws away resolution, aspect ratio, and color, which are exactly the things re-encoding changes.
2. **Transform**: run a 2D discrete cosine transform (the same transform JPEG uses), converting the image into frequency coefficients.
3. **Reduce**: keep only the top-left 8x8 block of coefficients, the lowest frequencies. These represent the coarse structure of the image; compression noise lives in the high frequencies you just discarded.
4. **Threshold**: compare each of the 64 coefficients to their median. Above the median is a 1, below is a 0. That is your 64-bit hash.

Similarity between two hashes is the **Hamming distance**: XOR them and count the bits.

```ruby
(a ^ b).to_s(2).count("1")
```

Distance 0 means visually identical, small distances mean similar, and unrelated images land far apart.

### Extending It to Video

A video is just a lot of images, so the natural extension is: sample N frames evenly across the video, pHash each one, and compare two videos by the mean Hamming distance over aligned frames.

## Implementation

I used libpHash for the actual math. Like every project of this kind, I did not want to own a DCT; I wanted to own the decisions around it.

### The Hasher

libpHash has a built-in video hash, but its scene-detection keyframe picker emitted too few frames for 15-30 second ads. So I wrote a thin C++ wrapper (~100 lines) that drives its frame extractor directly: pull ~10 evenly spaced 32x32 grayscale frames, hash each with the canonical `ph_dct_imagehash`, and print hex to stdout.

```
$ ./VideoHash https://cdn.example.com/some-ad.mp4 10
# duration=30.000
d1e3a5c2f0b49688
d1e3a5c2f0b49688
...
```

It accepts URLs directly since ffmpeg streams HTTP, so creatives can be hashed straight off the CDN without downloading first. Profiling had one clear message: the DCT hash is ~2ms per frame while decoding is ~500-800ms per video. The hash is free; decode is everything.

### Comparing Videos

The Ruby side compares two videos by averaging the per-frame distances:

```ruby
def distance_from(other)
  length = [hashes.length, other.hashes.length].min
  return Float::INFINITY if length < MIN_COMPARABLE_FRAMES

  hashes.first(length).zip(other.hashes.first(length)).sum do |a, b|
    (a ^ b).to_s(2).count("1")
  end.to_f / length
end
```

Then a clustering pass groups videos transitively: if A matches B and B matches C, they are one cluster, and any cluster spanning two or more SHA hashes is a duplicate that exact dedup missed.

## Everything Interesting Was a False Positive

The first run found real duplicates. It also found garbage, and each piece of garbage became a rule.

**The threshold.** I started at a distance threshold of 21 and got mega-clusters: generic-looking videos acted as "bridges," chaining unrelated ads together through transitive matching. Measuring the actual distribution fixed it. Genuine re-encodes land near distance 0, unrelated ads sit around 19+, so a threshold of 10 keeps a wide margin on both sides. 21 was sitting right in the false-match zone.

**The slideshow bug.** Some ads are 1fps slideshows with 15 total frames. With a fixed sampling step, those decode to a single frame, and a one-frame "match" is pure noise. The fix was deriving the step from the actual frame count, plus refusing to compare at all below 3 overlapping frames (that is the `MIN_COMPARABLE_FRAMES` guard above).

**The trailer problem.** A 15 second cut of a 30 second ad opens with the same frames, so front-loaded sampling cannot tell them apart. But re-encodes of the same ad keep near-identical duration, so a cheap length gate settles it:

```ruby
def similar_length?(other)
  a, b = duration, other.duration
  [a, b].min / [a, b].max >= 0.85
end
```

Two videos only count as duplicates if their durations are within 15% *and* their frames agree.

## Results

With the tuned threshold and gates, the script found real clusters: visually identical creatives hiding behind different content hashes, exactly the thing SHA-256 structurally cannot see. Clustering is O(n²) pairwise, which is fine for hundreds of videos; at real scale you would bucket hashes with locality-sensitive hashing so only nearby candidates get compared.

## Where Perceptual Hashing Is Used

This technique is everywhere once you know to look for it. Reverse image search engines use it to find visually similar images at scale. Content platforms use it for copyright matching, where a re-upload is cropped, re-encoded, or watermarked but still the same video. Microsoft's PhotoDNA applies the same idea to detect known harmful imagery. In all of these, the hash algorithm is the settled part; the judgment calls (how many frames, what threshold, what gets a veto) are where the actual work lives.

The other half of this project was the measurement side: scoring how *good* those video renditions look, [using VMAF](/writing/vmaf).

Thanks for reading!
