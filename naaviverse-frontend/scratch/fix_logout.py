import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already imported triggerLogout to avoid double modifying
    if 'triggerLogout' in content:
        return

    # Find the handleLogout arrow function declaration
    # e.g., const handleLogout = () => { ... };
    # or    const handleLogout = (e) => { ... };
    # we need to replace the inside of the function block.

    pattern = re.compile(r'(const\s+handleLogout\s*=\s*\([^)]*\)\s*=>\s*\{)(.*?)(^\s*\};)', re.DOTALL | re.MULTILINE)
    
    match = pattern.search(content)
    if not match:
        return

    # Extract parts
    start = match.group(1)
    body = match.group(2)
    end = match.group(3)

    # Indent the body a bit more if possible, or just wrap it
    new_body = f"\n    import('../../components/LogoutModal/LogoutManager').then(({{ triggerLogout }}) => {{\n      triggerLogout(() => {{{body}}});\n    }});"

    new_content = content[:match.start()] + start + new_body + end + content[match.end():]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated {filepath}")

def main():
    src_dir = r"c:\Users\gtpav\OneDrive\Pictures\Desktop\naaviverse\Naaviverse-8\naaviverse-frontend\src"
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
