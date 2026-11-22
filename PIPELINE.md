# Pipeline: script -> finished short

1. Script: one surprising true story, ~3.7 words/s, 55-70 s. Hook, setting, escalation, snap, explanation by everyday analogy, twist.
2. Voice: user supplies voice.wav (or generate one). Get word timings (words.json) with any speech-to-text.
3. Shot plan: one shot per beat in src/shots.js (copy an existing shot). Camera moves are functions of time t. Events land 0-3 frames before their word.
4. Preview first: render a short, half-scale clip (scale 0.5) and show it. Only render the full video after approval.
5. Full render: --video <shot> <seconds> 30 <folder> 1 (software rendering ~5-8 s/frame; a GPU machine is much faster).
6. Sound: ask the user which they want: AI music (VidIQ generator, uses their credits), their own music/SFX files, or the built-in synthesized bed (tools/make_sound.py). Mix soft music under the voice.
7. Join shots and audio: ffmpeg concat + mux voice (and music/SFX) with -map 0:v -map 1:a, loudness -14 LUFS.
8. Captions only if the user asks, timed from the real audio.

Rules: original story, characters and voice only. Never copy another creator's footage, scripts or characters.
