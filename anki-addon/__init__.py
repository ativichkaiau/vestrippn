# VESTRIPPN Anki Telemetry Sync
# Pushes due / new / reviewed-today / streak from Anki Desktop to your
# VESTRIPPN dashboard automatically — no browser required.
#
# Install: copy this folder into your Anki add-ons directory
#   (Tools -> Add-ons -> View Files), then set "secret" in the config.

import json
import threading
import urllib.request

from aqt import mw, gui_hooks
from aqt.qt import QTimer, QAction
from aqt.utils import tooltip

_timer = None  # keep a single timer across profile loads


def _config():
    cfg = mw.addonManager.getConfig(__name__) or {}
    return {
        "endpoint": (cfg.get("endpoint") or "").strip(),
        "secret": (cfg.get("secret") or "").strip(),
        "interval_minutes": int(cfg.get("interval_minutes", 15) or 15),
        "notify": bool(cfg.get("notify", False)),
    }


def _compute_streak(col, cutoff):
    # Bound the scan to ~1 year so big collections stay fast.
    min_ms = int((cutoff - 366 * 86400) * 1000)
    ids = col.db.list("select id from revlog where id >= ?", min_ms)
    days = set()
    for rid in ids:
        d = int((cutoff - (rid / 1000)) // 86400)  # 0 = today, 1 = yesterday ...
        if d >= 0:
            days.add(d)
    if not days:
        return 0
    d = 0 if 0 in days else 1  # if nothing studied today yet, count from yesterday
    streak = 0
    while d in days:
        streak += 1
        d += 1
    return streak


def _gather_stats():
    col = mw.col
    if not col:
        return None
    cutoff = col.sched.day_cutoff  # epoch seconds, end of the current Anki day
    today_start_ms = int((cutoff - 86400) * 1000)
    reviewed_today = col.db.scalar(
        "select count() from revlog where id >= ?", today_start_ms
    ) or 0
    return {
        "due": len(col.find_cards("is:due")),
        "new": len(col.find_cards("is:new")),
        "reviewedToday": int(reviewed_today),
        "streak": _compute_streak(col, cutoff),
    }


def _post(stats, cfg):
    req = urllib.request.Request(
        cfg["endpoint"],
        data=json.dumps(stats).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + cfg["secret"],
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
        if cfg["notify"]:
            mw.taskman.run_on_main(lambda: tooltip("VESTRIPPN: Anki synced ✓"))
    except Exception as e:
        if cfg["notify"]:
            msg = "VESTRIPPN sync failed: %s" % e
            mw.taskman.run_on_main(lambda: tooltip(msg))


def sync_now(notify_missing=False):
    cfg = _config()
    if not cfg["endpoint"] or not cfg["secret"]:
        if notify_missing:
            tooltip("VESTRIPPN: set 'endpoint' and 'secret' in the add-on config")
        return
    stats = _gather_stats()
    if stats is None:
        return
    threading.Thread(target=_post, args=(stats, cfg), daemon=True).start()


def _on_profile_open():
    global _timer
    sync_now()
    cfg = _config()
    mins = max(1, cfg["interval_minutes"])
    if _timer is None:
        _timer = QTimer(mw)
        _timer.timeout.connect(lambda: sync_now())
    _timer.start(mins * 60 * 1000)


# Sync on launch, after every AnkiWeb sync, and on a recurring timer.
gui_hooks.profile_did_open.append(_on_profile_open)
gui_hooks.sync_did_finish.append(lambda: sync_now())

# Manual trigger: Tools -> Sync to VESTRIPPN now
_action = QAction("Sync to VESTRIPPN now", mw)
_action.triggered.connect(lambda: sync_now(notify_missing=True))
mw.form.menuTools.addAction(_action)
