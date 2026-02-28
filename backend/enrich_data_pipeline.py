import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT / 'backend'


def run_command(command, env=None):
    print(f"[RUN] {' '.join(command)}")
    process = subprocess.run(command, cwd=str(ROOT), env=env)
    if process.returncode != 0:
        raise RuntimeError(f"Command failed ({process.returncode}): {' '.join(command)}")


def main():
    parser = argparse.ArgumentParser(description='Data enrichment pipeline (GSMArena + optional NanoReview + metrics collect)')
    parser.add_argument('--gsmarena', action='store_true', help='Run GSMArena enrichment')
    parser.add_argument('--gsmarena-limit', type=int, default=30, help='GSMArena max product count per run')
    parser.add_argument('--gsmarena-delay', type=int, default=15, help='GSMArena delay seconds between products')
    parser.add_argument('--nanoreview', action='store_true', help='Run NanoReview enrichment')
    parser.add_argument('--nanoreview-limit', type=int, default=20, help='NanoReview unique model limit')
    parser.add_argument('--collect-metrics', action='store_true', help='Run quality metrics collection script after enrichment')
    args = parser.parse_args()

    env = os.environ.copy()

    if args.gsmarena:
      run_command([
          sys.executable,
          str(BACKEND_DIR / 'gsmarena_scraper.py'),
          '--all',
          '--limit',
          str(max(1, args.gsmarena_limit)),
          '--delay',
          str(max(1, args.gsmarena_delay))
      ], env=env)

    if args.nanoreview:
      run_command([
          sys.executable,
          str(BACKEND_DIR / 'nanoreview_scraper.py'),
          '--all',
          '--limit',
          str(max(1, args.nanoreview_limit))
      ], env=env)

    if args.collect_metrics:
      run_command(['node', str(BACKEND_DIR / 'collect_quality_metrics.js')], env=env)

    print('[DONE] enrichment pipeline completed.')


if __name__ == '__main__':
    main()
