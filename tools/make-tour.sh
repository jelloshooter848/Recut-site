#!/usr/bin/env bash
# Make the silent demo tour (assets/video/tour.mp4 + poster) from ReCut's demo GIFs, with title cards between them.
# Needs ffmpeg with libx264, libwebp and drawtext (freetype), and the Inter font (any bold sans works: set FONT).
#   tools/make-tour.sh /path/to/ReCut
set -euo pipefail
recut="${1:?usage: tools/make-tour.sh /path/to/ReCut}"
src="$recut/docs/screenshots"
here="$(cd "$(dirname "$0")/.." && pwd)"
FONT="${FONT:-/usr/share/fonts/opentype/inter/Inter-Bold.otf}"
FONT_REG="${FONT_REG:-/usr/share/fonts/opentype/inter/Inter-Regular.otf}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
W=960; H=540; FPS=15; BG=0x0e121e
enc=(-an -c:v libx264 -preset veryslow -crf 26 -pix_fmt yuv420p -r $FPS)
n=0

# card <seconds> <title> <subtitle> [small line]
card() {
  n=$((n + 1)); local f="$tmp/$(printf %02d $n).mp4"
  printf '%s' "$2" > "$tmp/t.txt"; printf '%s' "$3" > "$tmp/s.txt"; printf '%s' "${4:-}" > "$tmp/x.txt"
  ffmpeg -v error -y -f lavfi -i "color=c=$BG:s=${W}x${H}:d=$1:r=$FPS" -vf "\
drawbox=x=(iw-56)/2:y=150:w=56:h=4:color=0x4b7bff:t=fill,\
drawtext=fontfile=$FONT:textfile=$tmp/t.txt:fontsize=46:fontcolor=white:x=(w-tw)/2:y=196,\
drawtext=fontfile=$FONT_REG:textfile=$tmp/s.txt:fontsize=26:fontcolor=0xc8d0e1:x=(w-tw)/2:y=272,\
drawtext=fontfile=$FONT_REG:textfile=$tmp/x.txt:fontsize=18:fontcolor=0x8c96ad:x=(w-tw)/2:y=470,\
fade=in:st=0:d=0.4,fade=out:st=$(echo "$1 - 0.4" | bc):d=0.4" "${enc[@]}" "$f"
}

# clip <gif>: the app recording, faded in and out
clip() {
  n=$((n + 1)); local f="$tmp/$(printf %02d $n).mp4"
  local d; d="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")"
  ffmpeg -v error -y -i "$1" -vf "fps=$FPS,scale=$W:$H:flags=lanczos,fade=in:st=0:d=0.3,fade=out:st=$(echo "$d - 0.3" | bc):d=0.3" "${enc[@]}" "$f"
}

card 3.5 "ReCut" "The free video editor made for fan edits" "Recorded in ReCut with Blender open movies"
card 2.5 "Find any line, in any film" "Search a whole franchise's dialogue at once"
clip "$src/demo-transcript-search.gif"
card 2.5 "No subtitles? Transcribe it" "Whisper, built in, entirely on your computer"
clip "$src/demo-whisper.gif"
card 2.5 "Disc subtitles become text" "Built-in OCR reads Blu-ray and DVD subtitles"
clip "$src/demo-ocr.gif"
card 2.5 "What if this subplot were gone?" "Switch a plotline off and see the new runtime"
clip "$src/demo-what-if.gif"
card 2.5 "Compare alternate cuts" "Two versions side by side, on one clock"
clip "$src/demo-compare.gif"
card 2.5 "Compound clips and keyframes" "Fold scenes into one clip; animate it"
clip "$src/demo-nest-keyframes.gif"
card 4.5 "Free and open source" "Windows, macOS and Linux" "Footage: Tears of Steel and Sintel © Blender Foundation, CC BY 3.0"

for f in "$tmp"/[0-9]*.mp4; do echo "file '$f'"; done > "$tmp/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$tmp/list.txt" -c copy -movflags +faststart "$here/assets/video/tour.mp4"
ffmpeg -v error -y -ss 1.8 -i "$here/assets/video/tour.mp4" -frames:v 1 -c:v libwebp -quality 80 "$here/assets/img/tour-poster.webp"
ls -l "$here/assets/video/tour.mp4" "$here/assets/img/tour-poster.webp"
