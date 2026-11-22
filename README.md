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
- src/shots.js   : the shots (hook, snap [animated bridge break], river, golden, closeup, cast [character lineup]). Each shot is plain code: characters, camera pos/look/fov/roll, blur, animation by time t
- index.html     : exposes window.renderShot(id, t) (t = seconds)
- render.mjs     : stills and video (frames -> ffmpeg)
- tools/make_sound.py : code-made music bed + simple SFX (step, crack, clatter, splash, whoosh, pop) from an events.json
- examples/      : sample frames and a 3 s preview

See PIPELINE.md for how to turn a script into a finished short.

## Characters
makeCharacter options: coat, pants, trim, skin, hat ('shako','cap','hair','top','bowler','straw','none'), hair, hairStyle ('short','long','bun'),
dress, fat (body width), moustache, mood ('smile','smirk','sad','shock','angry'), s (scale). pose() takes walk, arms ('swing','up','side','rope'), legs ('walk','sit','jump'), blink, talk (0-1 mouth open).

## Sound
Best: real music (e.g. VidIQ music generator, or the user's own files) plus real SFX files, mixed with ffmpeg under the voice.
Fallback: tools/make_sound.py (synthesized, simple).
