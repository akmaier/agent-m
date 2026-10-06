# Module: none — the site's brand files (src/brand/), outside every module's code (THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK)
# Guards: THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK
# Level: unit
"""The icon a phone puts on its Home Screen (`apple-touch-icon`). iOS rounds the icon's corners, which cut a sign that reaches
the edges; so the lab's sign is shrunk to 80 % and stands on a white square, with a white frame of a tenth of the width on each
side (PO A. Maier, 2026-10-06: "It needs a white frame which allows the icon to be shrunk by 20%"). The square is opaque, so
the frame is white in the icon itself, whatever a platform draws for a transparent pixel.

Expected, stated before the run: both pages declare src/brand/apple-touch-icon.png; it is a PNG of 180 × 180 pixels without
an alpha channel; every pixel of its outer frame, 18 pixels wide, is white; the sign — every pixel that is not white — lies
inside the central 144 × 144 and fills most of it. Counter-proofs, on images built here: the sign at full size, a transparent
background, and a sign shrunk to half are each named.
"""
import pathlib
import re
import struct
import unittest
import zlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICON = ROOT / "src" / "brand" / "apple-touch-icon.png"
SIZE, FRAME = 180, 18  # the sign at 80 %: a tenth of the width on each side


def png_pixels(data: bytes):
    """A non-interlaced 8-bit PNG -> (width, height, colour type, rows of pixel tuples), with the standard library only."""
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG")
    pos, idat = 8, b""
    while pos < len(data):
        length, kind = struct.unpack(">I4s", data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            width, height, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", body)
        elif kind == b"IDAT":
            idat += body
        elif kind == b"IEND":
            break
    if depth != 8 or interlace != 0 or ctype not in (0, 2, 4, 6):
        raise ValueError(f"an 8-bit, non-interlaced PNG is read here: depth {depth}, colour type {ctype}, interlace {interlace}")
    n = {0: 1, 2: 3, 4: 2, 6: 4}[ctype]
    raw, stride, rows, prev, i = zlib.decompress(idat), width * n, [], bytearray(width * n), 0
    for _ in range(height):
        kind, line = raw[i], bytearray(raw[i + 1:i + 1 + stride])
        i += 1 + stride
        for x in range(stride):
            a, b = (line[x - n] if x >= n else 0), prev[x]
            c = prev[x - n] if x >= n else 0
            if kind == 1:
                line[x] = (line[x] + a) & 255
            elif kind == 2:
                line[x] = (line[x] + b) & 255
            elif kind == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif kind == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append([tuple(line[x * n:(x + 1) * n]) for x in range(width)])
        prev = line
    return width, height, ctype, rows


def icon_problems(data: bytes) -> list:
    """What keeps an image from being the Home Screen icon of the expected result above; [] when nothing does."""
    width, height, ctype, rows = png_pixels(data)
    if (width, height) != (SIZE, SIZE):
        return [f"{width} × {height}, not {SIZE} × {SIZE}"]
    if ctype not in (0, 2):
        return ["it has an alpha channel: the frame must be white in the icon itself"]
    white = lambda p: min(p[:3] if len(p) >= 3 else p * 3) >= 245
    problems = []
    frame = [(x, y) for y in range(SIZE) for x in range(SIZE)
             if x < FRAME or y < FRAME or x >= SIZE - FRAME or y >= SIZE - FRAME]
    if any(not white(rows[y][x]) for x, y in frame):
        problems.append(f"the outer frame of {FRAME} pixels is not white all round")
    ink = [(x, y) for y in range(SIZE) for x in range(SIZE) if not white(rows[y][x])]
    if not ink:
        return problems + ["no sign"]
    span = max(max(x for x, _ in ink) - min(x for x, _ in ink), max(y for _, y in ink) - min(y for _, y in ink)) + 1
    if span < (SIZE - 2 * FRAME) * 0.9:
        problems.append(f"the sign spans {span} pixels, not about {SIZE - 2 * FRAME}")
    return problems


def png_bytes(rows, alpha=False) -> bytes:
    """Rows of (r, g, b[, a]) tuples -> a PNG, for the counter-proofs."""
    chunk = lambda kind, body: struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body))
    raw = b"".join(b"\x00" + bytes(v for p in row for v in p) for row in rows)
    head = struct.pack(">IIBBBBB", len(rows[0]), len(rows), 8, 6 if alpha else 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", head) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")


def square(sign_from, sign_to, background=(255, 255, 255), alpha=False):
    """A test image: a blue square from sign_from to sign_to on the background."""
    blue = (4, 49, 106, 255) if alpha else (4, 49, 106)
    back = background + ((0,) if alpha else ())
    return [[blue if sign_from <= x < sign_to and sign_from <= y < sign_to else back for x in range(SIZE)] for y in range(SIZE)]


class HomeScreenIcon(unittest.TestCase):
    def test_both_pages_declare_the_icon(self):
        for page, href in ((ROOT / "index.html", "src/brand/apple-touch-icon.png"),
                           (ROOT / "docs" / "index.html", "../src/brand/apple-touch-icon.png")):
            self.assertRegex(page.read_text(encoding="utf-8"), rf'<link rel="apple-touch-icon" href="{re.escape(href)}">', page.name)

    def test_the_sign_stands_at_80_percent_on_a_white_square(self):
        self.assertEqual(icon_problems(ICON.read_bytes()), [])

    def test_counter_proofs_full_size_transparent_and_too_small_are_named(self):
        self.assertEqual(icon_problems(png_bytes(square(FRAME, SIZE - FRAME))), [], "the expected icon passes")
        self.assertIn("the outer frame of 18 pixels is not white all round", icon_problems(png_bytes(square(0, SIZE))))
        self.assertEqual(icon_problems(png_bytes(square(FRAME, SIZE - FRAME, (0, 0, 0), alpha=True), alpha=True)),
                         ["it has an alpha channel: the frame must be white in the icon itself"])
        self.assertIn("the sign spans 72 pixels, not about 144", icon_problems(png_bytes(square(54, 126))))


if __name__ == "__main__":
    unittest.main()
