#!/usr/bin/env bash
# Rebuild assets/ from a checkout of ReCut (https://github.com/jelloshooter848/ReCut).
# Needs ffmpeg (with libx264 and libwebp) and python3 with Pillow.
#   tools/build-assets.sh /path/to/ReCut
set -euo pipefail
recut="${1:?usage: tools/build-assets.sh /path/to/ReCut}"
src="$recut/docs/screenshots"
here="$(cd "$(dirname "$0")/.." && pwd)"
img="$here/assets/img"; vid="$here/assets/video"; ico="$here/assets/icons"
mkdir -p "$img" "$vid" "$ico"

webp() { # webp <in> <out> <width>
  ffmpeg -v error -y -i "$1" -vf "scale=$3:-2:flags=lanczos" -c:v libwebp -quality 80 -compression_level 6 "$2"
}

# Stills: full width (1600) and half width (800) for srcset.
for f in "$src"/*.png; do
  n="$(basename "$f" .png)"
  webp "$f" "$img/$n.webp" 1600
  webp "$f" "$img/$n-800.webp" 800
done

# Demo GIFs become short silent MP4s (H.264, plays everywhere) plus a WebP poster.
for f in "$src"/demo-*.gif; do
  n="$(basename "$f" .gif)"
  ffmpeg -v error -y -i "$f" -an -movflags +faststart -pix_fmt yuv420p \
    -vf "scale=960:-2:flags=lanczos,fps=15" -c:v libx264 -preset veryslow -crf 27 -tune animation "$vid/$n.mp4"
  ffmpeg -v error -y -ss 6 -i "$f" -frames:v 1 -vf "scale=960:-2:flags=lanczos" \
    -c:v libwebp -quality 78 "$img/$n-poster.webp"
done

# Icons from the app icon.
icon="$recut/build/icon.png"
for s in 16 32 48 180 192 512; do
  ffmpeg -v error -y -i "$icon" -vf "scale=$s:$s:flags=lanczos" "$ico/icon-$s.png"
done
ffmpeg -v error -y -i "$ico/icon-48.png" "$here/favicon.ico"

# Social preview card (1200 x 630).
python3 "$here/tools/make-og.py" "$src/project.png" "$here/assets/og-image.png"
