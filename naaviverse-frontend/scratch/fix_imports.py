import os
import re

def main():
    src_dir = r"c:\Users\gtpav\OneDrive\Pictures\Desktop\naaviverse\Naaviverse-8\naaviverse-frontend\src"
    components_dir = os.path.join(src_dir, "components", "LogoutModal")
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                if "import('../../components/LogoutModal/LogoutManager')" in content:
                    # Calculate correct relative path
                    # relative path from root to components_dir
                    rel_path = os.path.relpath(components_dir, root)
                    # convert backslashes to forward slashes
                    rel_path = rel_path.replace("\\", "/")
                    
                    if not rel_path.startswith('.'):
                        rel_path = './' + rel_path
                    
                    import_path = f"{rel_path}/LogoutManager"
                    
                    new_content = content.replace(
                        "import('../../components/LogoutModal/LogoutManager')",
                        f"import('{import_path}')"
                    )
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed {filepath} with {import_path}")

if __name__ == "__main__":
    main()
