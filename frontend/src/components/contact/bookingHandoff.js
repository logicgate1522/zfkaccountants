/* =========================================
   Booking → /thank-you hand-off.

   After a booking is stored (and emailed), the form keeps a short summary
   in memory, so the "How did you hear about us?" answer can name the
   booking it belongs to. Client-side navigation keeps it; nothing is
   written to the device (R32). The answer is sent on its own afterwards:
   the booking never waits for it or depends on it.
========================================= */

let current = null;

export function saveBookingRef(ref) {
    current = ref;
}

export function readBookingRef() {
    return current;
}

export function clearBookingRef() {
    current = null;
}
