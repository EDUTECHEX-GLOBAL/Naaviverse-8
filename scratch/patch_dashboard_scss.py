with open('navi-agent/frontend/src/pages/Dashboard.scss', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''.db-accuracy-card-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}'''

replacement = '''.db-accuracy-card-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.db-eval-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border);

  &.human-reviewed {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }

  &.not-reviewed {
    background: #f8fafc;
    color: #64748b;
    border-style: dashed;
    border-color: #cbd5e1;
  }

  &.ai-verified {
    background: #eff6ff;
    color: #1e40af;
    border-color: #bfdbfe;
  }

  &.diff {
    background: #fffbeb;
    color: #92400e;
    border-color: #fde68a;

    &.match {
      background: #f0fdf4;
      color: #166534;
      border-color: #bbf7d0;
    }
  }
}'''

if target in content:
    content = content.replace(target, replacement, 1)
    with open('navi-agent/frontend/src/pages/Dashboard.scss', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Dashboard.scss updated successfully.")
else:
    print("Target not found in Dashboard.scss!")

