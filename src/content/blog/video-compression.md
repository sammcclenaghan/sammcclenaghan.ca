---
title: "How Small Can You Make a 30-Second Video?"
description: "I spent two weeks trying to compress 20MB video ads to 1MB with no visible artifacts. The answer is 'sometimes', and the reasons taught me video encoding."
date: 2026-07-16
---

At work, a question came up that sounded simple: can we take a ~20MB video ad and get it down to 1MB with no visible artifacts?

My gut said yes. Compression keeps getting better, streaming services do magic all the time, surely 20x is doable. I spent a couple of weeks actually testing it, and the answer turned out to be "sometimes," for reasons that taught me most of what I now know about video encoding.

## Understanding the Problem

Start with the arithmetic. A 1MB file over 30 seconds is about 270 kbps. The source ads are 1080p at 30fps, encoded around 6 Mbps. So the question is really: can you describe the same picture with roughly 1/20th of the bits?

A video encoder has three jobs:

- **Spatial compression**: within a frame, spend bits on structure and skip what the eye won't notice (this is the DCT-and-quantize machinery JPEG uses).
- **Temporal compression**: between frames, don't re-send what didn't change; describe motion instead.
- **Rate control**: decide, second by second, where the limited bit budget goes.

The key consequence: compressibility depends entirely on the content. A mostly-static illustrated ad barely changes between frames, so temporal compression eats it for free. A casino ad with confetti, camera motion, and film grain changes *everywhere, every frame*, and there is no shortcut. Grain is especially cruel because it is literally noise: incompressible by definition, and the encoder wastes bits trying to reproduce it.

To measure "no visible artifacts" I used [VMAF](/writing/vmaf) (a perceptual quality metric, 0 to 100), with 93+ as the bar for "viewers can't tell."

## Lever 1: The Codec (and Why I Couldn't Use It)

The single biggest lever is the codec generation. At the same 270 kbps on the same hard clip:

```
x264 (H.264):  VMAF 48
x265 (HEVC):   VMAF 61
AV1:           VMAF 74
```

AV1 at 1MB looked like H.264 at 2 to 2.5MB. If I could flip one switch, that was it.

I couldn't flip it. The videos play on a fleet of embedded devices running ancient browser builds that can only decode H.264. AV1 needs roughly Chrome 70+, HEVC needs newer still or Apple hardware. No per-device codec selection either. So: H.264, the 2003-vintage codec, is the constraint everything else lives under. This was the first big lesson: in real systems, the best-known technique and the available technique are different things.

## Lever 2: Rate Control (Set the Size, Let Quality Float)

Within H.264, the next question is how you *ask* for a size. The two classic modes:

- **CRF (constant quality)**: "keep quality at level N, use whatever bits that takes." Great quality, unpredictable file size.
- **Capped CRF / QVBR**: the same, but with a hard bitrate ceiling: "quality N, but never exceed X kbps."

Since the actual requirement was a byte budget (a hard cap, above which CDN bandwidth costs jump), capped mode is the right shape: easy content floats well under the cap, hard content clamps at it. One subtlety that took me embarrassingly long to internalize: the cap must be computed *per duration*. A fixed kbps means a 15 second ad gets half the file size of a 30 second one for no reason; the right cap is `budget_bytes * 8 / duration`.

And an experimental result that surprised me: once a clip is pinned at the cap, the quality level does nothing. I ran the same hard clip at quality levels 7, 8, and 9 and got identical file sizes at the same VMAF, because the ceiling was doing all the work. Only lowering the level far enough to come *off* the cap changed anything. The cap is the size lever; the level is not.

## Lever 3: Resolution (Fewer Pixels, Better Picture)

Here is the counterintuitive one. At a fixed byte budget, hard content looks *better* encoded at 360p than at 480p, by 11 to 14 VMAF points in my tests.

The logic falls out of bits per pixel. At 270 kbps, a 480p frame gets so few bits per pixel that the encoder shreds it into blocky artifacts. Drop to 360p and the same bits cover half as many pixels, so each pixel is described far better; the screen upscales the result, and mild softness beats heavy blocking every time. Lowering the resolution raised the quality.

## The Trap: Don't Touch the Frame Rate

The obvious next idea is dropping 30fps to 15fps: half the frames, half the bits, right? This was the worst thing I tried. Mean scores dipped a little, but the *worst-moment* scores collapsed (one motion-heavy clip went from a p05 of 55 to 34; the grainy one fell off a cliff). The reason is judder: motion becomes a visible stutter, and viewers notice a stutter far more than uniform softness. Frame-rate reduction is only safe on content that barely moves, which is exactly the content that didn't need the bits anyway.

## Results

So, 20MB to 1MB with no visible artifacts?

- **Easy content** (illustrated, low motion): yes, comfortably. Pristine scores at or under 1MB, and most of the library is like this.
- **Hard content** (motion, grain, busy detail): no. Even the best-case tuning at the budget lands around "acceptable but soft," and going truly clean needs 2 to 3.5MB. With AV1 it would have been close; with H.264 it is out of reach.

The honest final answer is that information theory sets the floor. High-entropy content *contains* more information, and no encoder can transmit it in fewer bits than it holds. What you can do is stop spending bits uniformly: cap by duration, drop resolution on hard content, keep the frame rate, and let easy content come in under budget for free.

I ended up thinking of it like a triage system rather than a compression setting, which is not where I expected a "just make the files smaller" task to end up.

If you're curious how the quality numbers in this post were measured, I wrote about [VMAF and how to use it without fooling yourself](/writing/vmaf). Thanks for reading!
