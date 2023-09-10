import os
import re

post_dir = './_posts/'
file_name = os.listdir(post_dir)[-5]
file_path = os.path.join(post_dir, file_name)
print(file_path)

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()
print(text)

pattern = r"status:[^\n]*"
status = re.search(pattern, text)
print(status)
if 'Done' in str(status):
    pass
else:
    pass
