import re

with open('src/components/BrandLogo.tsx', 'r') as f:
    content = f.read()

new_handlers = """  if (bLower.includes('jimmy choo') || bLower.includes('choo')) {
    return (
      <div title="Jimmy Choo" className={`inline-flex items-center justify-center shrink-0 ${logoClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 60" className="h-full w-auto max-h-full max-w-full text-current fill-current block">
          <text x="160" y="38" textAnchor="middle" fontFamily="Playfair Display, Didot, Bodoni MT, Georgia, serif" fontSize="28" fontWeight="600" letterSpacing="0.22em" fill="currentColor">
            JIMMY CHOO
          </text>
          <text x="160" y="52" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="500" letterSpacing="0.35em" fill="currentColor">
            LONDON
          </text>
        </svg>
      </div>
    );
  }

  if (bLower.includes('maison mihara') || bLower.includes('mihara yasuhiro') || bLower.includes('mihara')) {
    return (
      <div title="Maison Mihara Yasuhiro" className={`inline-flex items-center justify-center shrink-0 ${logoClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 80" className="h-full w-auto max-h-full max-w-full text-current fill-current block">
          <rect x="4" y="4" width="352" height="72" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <text x="180" y="34" textAnchor="middle" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="13" fontWeight="500" letterSpacing="0.18em" fill="currentColor">
            Maison
          </text>
          <text x="180" y="58" textAnchor="middle" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="18" fontWeight="800" letterSpacing="0.14em" fill="currentColor">
            MIHARA YASUHIRO
          </text>
        </svg>
      </div>
    );
  }

  if (bLower.includes('hermes') || bLower.includes('hermès')) {
    return (
      <div title="Hermès" className={`inline-flex items-center justify-center shrink-0 ${logoClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 60" className="h-full w-auto max-h-full max-w-full text-current fill-current block">
          <text x="140" y="36" textAnchor="middle" fontFamily="'Times New Roman', Times, 'Playfair Display', Georgia, serif" fontSize="28" fontWeight="700" letterSpacing="0.25em" fill="currentColor">
            HERMÈS
          </text>
          <text x="140" y="52" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" letterSpacing="0.38em" fill="currentColor">
            PARIS
          </text>
        </svg>
      </div>
    );
  }

"""

pattern = r'  return \(\s*<span className=\{`font-semibold tracking-tight text-neutral-800'

match = re.search(pattern, content)
if match:
    idx = match.start()
    updated = content[:idx] + new_handlers + content[idx:]
    with open('src/components/BrandLogo.tsx', 'w') as f:
        f.write(updated)
    print("SUCCESS: BrandLogo.tsx updated.")
else:
    print("ERROR: Pattern not matched.")
