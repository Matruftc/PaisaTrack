import os
from PIL import Image, ImageDraw

res_dir = "/Users/matruprasadmishra/Desktop/CODEX/paisatrack/android/app/src/main/res"

densities = {
    'mipmap-mdpi': (48, 108),
    'mipmap-hdpi': (72, 162),
    'mipmap-xhdpi': (96, 216),
    'mipmap-xxhdpi': (144, 324),
    'mipmap-xxxhdpi': (192, 432),
}

def draw_paisatrack_logo_exact(size, is_foreground=False, is_round=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(size * 0.08)
    w, h = size, size

    if not is_foreground:
        # Background dark card #0c0d12
        if is_round:
            draw.ellipse([margin, margin, w - margin, h - margin], fill=(12, 13, 18, 255))
        else:
            corner_radius = int(size * 0.22)
            draw.rounded_rectangle([margin, margin, w - margin, h - margin], radius=corner_radius, fill=(12, 13, 18, 255))

    # Normalize coordinates based on 100x100 SVG viewport
    def sx(x): return (x / 100.0) * w
    def sy(y): return (y / 100.0) * h

    # 1. Shield Outline (stroke M50 8 L85 24 V50 C85 71.5 69.8 90.8 50 96 C30.2 90.8 15 71.5 15 50 V24 L50 8 Z)
    shield_pts = [
        (sx(50), sy(10)),
        (sx(83), sy(25)),
        (sx(83), sy(50)),
        (sx(50), sy(92)),
        (sx(17), sy(50)),
        (sx(17), sy(25)),
    ]
    draw.polygon(shield_pts, outline=(52, 211, 153, 255), width=max(2, int(size * 0.04)))

    # 2. Top Bar 1: M32 30 H68
    draw.line([(sx(32), sy(30)), (sx(68), sy(30))], fill=(52, 211, 153, 255), width=max(2, int(size * 0.06)))

    # 3. Top Bar 2: M32 42 H62
    draw.line([(sx(32), sy(42)), (sx(62), sy(42))], fill=(45, 212, 191, 255), width=max(2, int(size * 0.055)))

    # 4. Main Rupee Loop: M36 30 V54 C36 54 58 54 58 42 C58 30 36 30 36 30 Z
    # Vertical line M36 30 -> 54
    draw.line([(sx(36), sy(30)), (sx(36), sy(54))], fill=(16, 185, 129, 255), width=max(2, int(size * 0.055)))
    # Semi-circle loop arc from Y 30 to Y 54
    loop_box = [sx(36) - sx(10), sy(30), sx(58) + sx(2), sy(54)]
    draw.arc(loop_box, start=270, end=90, fill=(16, 185, 129, 255), width=max(2, int(size * 0.055)))

    # 5. Ascent Leg: M36 54 L64 78
    draw.line([(sx(36), sy(54)), (sx(64), sy(78))], fill=(56, 189, 248, 255), width=max(2, int(size * 0.06)))

    # 6. Spark Diamond: M72 26 L76 32 L82 36 L76 40 L72 46 L68 40 L62 36 L68 32 Z
    spark_pts = [
        (sx(72), sy(26)),
        (sx(76), sy(32)),
        (sx(82), sy(36)),
        (sx(76), sy(40)),
        (sx(72), sy(46)),
        (sx(68), sy(40)),
        (sx(62), sy(36)),
        (sx(68), sy(32)),
    ]
    draw.polygon(spark_pts, fill=(56, 189, 248, 255))

    return img

for folder, (icon_size, fg_size) in densities.items():
    target_dir = os.path.join(res_dir, folder)
    os.makedirs(target_dir, exist_ok=True)

    # Standard ic_launcher.png
    icon_img = draw_paisatrack_logo_exact(icon_size, is_foreground=False, is_round=False)
    icon_img.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")

    # Round ic_launcher_round.png
    round_img = draw_paisatrack_logo_exact(icon_size, is_foreground=False, is_round=True)
    round_img.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")

    # Foreground ic_launcher_foreground.png
    fg_img = draw_paisatrack_logo_exact(fg_size, is_foreground=True, is_round=False)
    fg_img.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")

print("Exact PaisaTrack logo PNGs generated successfully!")
