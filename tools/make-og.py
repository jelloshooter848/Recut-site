"""Make the 1200 x 630 social preview card from a ReCut screenshot.

usage: python3 tools/make-og.py <screenshot.png> <out.png>
Text uses Inter (SIL OFL) if installed, else DejaVu Sans; it is rendered into the image, nothing is served.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (14, 18, 30)
ACCENT = (75, 123, 255)


def font(names, size):
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main(src, out):
    card = Image.new("RGB", (W, H), BG)
    shot = Image.open(src).convert("RGB")
    # Screenshot on the right, cropped to the editing area, with a soft border.
    sw = 760
    shot = shot.resize((sw, round(shot.height * sw / shot.width)), Image.LANCZOS)
    x, y = 640, 150
    frame = Image.new("RGB", (shot.width + 4, shot.height + 4), ACCENT)
    card.paste(frame, (x - 2, y - 2))
    card.paste(shot, (x, y))
    # Fade the left edge of the screenshot into the background so the text reads.
    fade = Image.new("L", (W, H), 0)
    fd = ImageDraw.Draw(fade)
    for i in range(260):
        fd.line([(x - 2 + i, 0), (x - 2 + i, H)], fill=max(0, 235 - i))
    fd.rectangle([0, 0, x - 2, H], fill=255)
    card.paste(Image.new("RGB", (W, H), BG), (0, 0), fade)

    d = ImageDraw.Draw(card)
    bold = ["Inter-Bold.otf", "/usr/share/fonts/opentype/inter/Inter-Bold.otf", "DejaVuSans-Bold.ttf"]
    reg = ["Inter-Regular.otf", "/usr/share/fonts/opentype/inter/Inter-Regular.otf", "DejaVuSans.ttf"]
    # App-icon mark.
    d.rounded_rectangle([64, 72, 64 + 72, 72 + 72], radius=10, fill=ACCENT)
    d.text((100, 104), "Re", font=font(bold, 34), fill="white", anchor="mm")
    d.rectangle([76, 128, 124, 132], fill=(236, 238, 240))
    d.rectangle([98, 124, 101, 136], fill=(42, 79, 181))
    d.text((156, 108), "ReCut", font=font(bold, 52), fill="white", anchor="lm")
    d.text((64, 230), "The free video editor", font=font(bold, 46), fill="white")
    d.text((64, 286), "made for fan edits.", font=font(bold, 46), fill=(150, 180, 255))
    small = font(reg, 26)
    for i, line in enumerate(["Find any line across a franchise.", "Build and compare alternate cuts.",
                              "Windows, macOS, Linux. Open source."]):
        d.text((64, 380 + i * 40), line, font=small, fill=(200, 208, 225))
    d.text((64, 580), "Footage: Tears of Steel, Sintel © Blender Foundation, CC BY 3.0",
           font=font(reg, 16), fill=(130, 140, 160))
    card.save(out, optimize=True)


if __name__ == "__main__":
    main(*sys.argv[1:3])
