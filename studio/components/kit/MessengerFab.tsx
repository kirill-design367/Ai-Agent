"use client";

/*
  Floating messenger button (Bible L.156) — the ONE always-present CTA that is
  allowed: РФ audience often prefers writing in Telegram over leaving a form.
  No pressure, no pop-up, no timer. Magnetic for tactility.
*/
export default function MessengerFab() {
  return (
    <a
      href="https://t.me/"
      target="_blank"
      rel="noopener"
      className="msg-fab"
      data-magnetic
      data-cursor="hover"
    >
      <span aria-hidden>✦</span> Написать
    </a>
  );
}
