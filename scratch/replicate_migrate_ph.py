import glob
import shutil

src = 'pb_hooks/migrate_ph.pb.js'
for dst in glob.glob('**/migrate_ph.pb.js', recursive=True):
    if dst.replace('\\', '/') != src:
        shutil.copy2(src, dst)
        print("Copied to", dst)
