# GoldenMayhem Video Creation

Original toon-3D short-video renderer (three.js in headless Chrome). Painted textures, ink outlines,
toon lighting with sun shadows, lens blur, colour grade. No Remotion, no AI video generator.
Code is original; the look was informed by general style research only, no third-party footage is included.

## Setup
    npm install          # Node 18+ and Chrome/Chromium (set CHROME=/path if not auto-found), ffmpeg for video

## Render
    node render.mjs out                       # one 1080x1920 PNG per shot
    node render.mjs out hook golden           # only some shots
    node render.mjs --video hook 3 10 vid_hook 0.5    # shot, seconds, fps, folder, scale (0.5 = fast preview)

## Files
- src/toonkit.js : textures, toon materials, ink outlines, characters + poses, light presets (day/golden), sky, post stack
- src/world.js   : houses, bridge, trees, props, river, banks, town builder
- src/shots.js   : the shots. Each shot is plain code: characters, camera pos/look/fov/roll, blur, animation by time t
- index.html     : exposes window.renderShot(id, t) (t = seconds)
- render.mjs     : stills and video (frames -> ffmpeg)
- examples/      : sample frames and a 3 s preview

See PIPELINE.md for how to turn a script into a finished short.
