---
title: "How VMAF Works: Scoring Video Quality Without Watching It"
description: "I had 800 re-encoded videos and nobody to watch them. An intro to VMAF: how it works, how to run it, and the two ways I got it wrong."
date: 2026-07-16
---

At work, the platform I work on re-encodes every video ad into a smaller 480p rendition. There are around 800 of them, and at some point someone asked a very reasonable question: how good do those renditions actually look?

Nobody is watching 800 videos. This is the problem VMAF was built for, and after spending a few weeks using it, I wanted to write the intro I wish I had at the start.

## Understanding VMAF

VMAF (Video Multi-Method Assessment Fusion) is a video quality metric developed by Netflix. It is a *full-reference* metric: you give it the original video and the compressed version, and it predicts how a human would rate the difference, frame by frame, on a scale from 0 to 100.

The interesting part is the word "fusion." Older metrics like PSNR measure pixel error directly, and pixel error correlates surprisingly badly with what people actually perceive. VMAF instead computes several elementary features per frame and feeds them into a machine learning model trained on real human opinion scores.

### Components of VMAF

- **Reference**: the original, pristine video.
- **Distorted**: the compressed version you want to score.
- **Elementary features**: per-frame signals, mainly VIF (visual information fidelity, measured at four scales), DLM (a detail loss metric), and a motion feature that captures how much the frame is changing.
- **Fusion model**: a regression model (an SVM) trained on subjective studies, which combines the features into one score per frame.

The output scale, roughly: 20 is bad, 70 is fair to good, and 93+ means most viewers cannot tell the difference from the original.

## Running It

ffmpeg ships with VMAF built in, so the minimal version is one command. The distorted file is the first input and the reference is the second:

```shell
ffmpeg -i rendition.mp4 -i original.mp4 \
  -lavfi libvmaf=log_path=scores.json:log_fmt=json -f null -
```

This writes a JSON file with one score per frame plus a pooled mean. A 30 second clip at 30fps gives you 900 scores, which brings up the first real question.

## Pooling: The Mean Lies

How do you turn 900 frame scores into one number for the clip?

- **Mean**: hides sustained bad stretches. A clip that looks great for 25 seconds and falls apart for 5 can still post a healthy mean.
- **Min**: too jumpy. One freak frame and the clip looks broken.
- **p05** (the score of the worst 5% of frames): the middle ground. It catches "the last five seconds fall apart" without panicking over a single glitch.

A clip is only as good as its worst sustained stretch, so p05 is what I ended up screening on.

## The Resolution Trap

VMAF compares videos pixel by pixel, so both inputs must be the same resolution. If your rendition is 480p and your original is 1080p, something has to scale, and *which side you scale changes the answer*.

I got this wrong first. I downscaled the 1080p original to 480p and compared there, which conveniently hides all the scaling artifacts. On one test clip this inflated the score by about 12 points: 54.9 measured the wrong way, 43.0 measured correctly. That is the difference between "ship it" and "a human needs to look at this."

The rule that resolved it for me: **compare at the resolution the viewer actually sees.** Netflix upscales the encode to the source resolution because their players upscale to your TV. In my case, the renditions play 1:1 on 480p screens with no upscaling, so the reference is the original downscaled to 480p (lanczos) and the rendition goes in untouched. Different procedure than Netflix's, same principle.

## Results

Scoring the full library took about 17 seconds per clip and produced a boring, happy answer: 770 of 790 clips passed a p05 threshold, and 20 got flagged for review. That is the whole point. The metric did not grade the library; it shrank the eyeball problem from 790 videos to 20.

It is worth being honest about what VMAF is not, though. We evaluated it as a quality *ranker* across different clips and rejected it for that job. On our content it over-penalizes motion (the worst-flagged clip was game footage that swings frame to frame but looks fine at a glance) and it is blind to small-text legibility. Hold the content constant and a low score reliably means "look at this one." Compare scores across different clips and you are reading noise.

## Where VMAF Is Used

VMAF has become the de facto standard for this kind of work. Netflix uses it to build per-title encoding ladders, choosing bitrates per movie instead of one ladder for everything. Codec comparisons ("AV1 is 30% more efficient than H.264") are usually stated in terms of VMAF at equal bitrate. And teams like mine use it as a regression tripwire: encode, score, and flag the tail for human eyes.

This post came out of a larger question about the same video library: [how many of those videos are duplicates that SHA-256 can't see?](/writing/perceptual-hashing) And if you want to know how far the renditions themselves can be squeezed, I also wrote about [how small you can make a 30-second video](/writing/video-compression).

Thanks for reading!
