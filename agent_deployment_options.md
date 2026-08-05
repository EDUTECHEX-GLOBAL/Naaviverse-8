# Naaviverse Monorepo: Agent Deployment Options to Hugging Face

Following our codebase integration (Option 1: Monorepo Approach), we consolidated the React Client, Node.js Backend, and Python AI Agent codebases inside a single `Naaviverse-8` directory. 

Because Hugging Face Spaces expects only the Agent's Python backend code (`navi-agent/code/`) at its root, we cannot push the entire monorepo directly to Hugging Face. Here are three options to handle the deployment.

---

### Option A: Local Script Deployment (Current Setup)
We run a PowerShell script locally on the machine to copy the subfolder contents and push it directly to Hugging Face.

#### How it works:
1. Clones the Hugging Face repository into a temporary workspace folder (`.hf-space-deploy`).
2. Copies local edits from `navi-agent/code` into this deployment folder.
3. Automatically runs `git add`, `git commit`, and `git push` to deploy it live.
4. Safely deletes the temporary deployment folder to keep the workspace clean.

#### Command:
Run this at the root of `Naaviverse-8`:
```powershell
.\deploy-agent.ps1
```

* **Pros**: Simple, fast, and does not require complex setup or external tools.
* **Cons**: Relies on a helper script file in the repository.

---

### Option B: Native Git Subtree
We use Git's built-in `git subtree` command to extract and push the subfolder directly to Hugging Face without using scripts or temporary folders.

#### Setup (One-time):
Add Hugging Face as a secondary Git remote:
```bash
git remote add huggingface https://huggingface.co/spaces/Naaviverse/Naaviverse-Path
```

#### Command to Deploy:
```bash
git subtree push --prefix navi-agent/code huggingface main
```

* **Pros**: Standard Git functionality. No script files or temporary directories are created on your disk.
* **Cons**: Can be slow to calculate diffs on larger commit histories.

---

### Option C: GitHub Actions (Automated CI/CD)
Whenever you push your changes to GitHub (`git push origin main`), GitHub will automatically catch the updates inside `navi-agent/code` and deploy them to Hugging Face in the background.

#### Setup:
1. Add Hugging Face Access Token (`HF_TOKEN`) as a secret key in your GitHub repository settings.
2. Create a workflow file in `.github/workflows/deploy-agent.yml` with the following configuration:

```yaml
name: Deploy Agent to Hugging Face
on:
  push:
    branches: [ main ]
    paths:
      - 'navi-agent/code/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Push to HF
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: |
          git remote add huggingface https://Naaviverse:$HF_TOKEN@huggingface.co/spaces/Naaviverse/Naaviverse-Path
          git subtree push --prefix navi-agent/code huggingface main
```

* **Pros**: 100% automated. You push once to GitHub, and the live Agent updates automatically.
* **Cons**: Requires setting up access credentials inside GitHub.
