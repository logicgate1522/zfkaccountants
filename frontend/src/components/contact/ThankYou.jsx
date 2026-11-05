"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FaArrowRight, FaCheck, FaEllipsisH, FaFacebookF, FaGoogle, FaInstagram, FaLinkedinIn,
    FaMapMarkerAlt, FaRobot, FaTiktok, FaUserFriends, FaYoutube,
} from "react-icons/fa";

import { useCms } from "@/components/cms/useCms";
import { clearBookingRef, readBookingRef } from "@/components/contact/bookingHandoff";
import { sendFormEmail } from "@/lib/forms";

/* =========================================
   /thank-you — where the booking form lands.

   The booking is already stored and emailed by
   the time this page shows. "How did you hear
   about us?" is optional and separate: a click
   sends its own short email (FormSubmit, same
   Settings address) that names the booking it
   belongs to. It never changes the booking and
   is not a lead or a conversion.
========================================= */

const ICONS = {
    google: { Icon: FaGoogle, color: "#4285F4" },
    maps: { Icon: FaMapMarkerAlt, color: "#EA4335" },
    facebook: { Icon: FaFacebookF, color: "#1877F2" },
    instagram: { Icon: FaInstagram, color: "#E4405F" },
    linkedin: { Icon: FaLinkedinIn, color: "#0A66C2" },
    tiktok: { Icon: FaTiktok, color: "#111827" },
    youtube: { Icon: FaYoutube, color: "#FF0000" },
    ai: { Icon: FaRobot, color: "#10A37F" },
    referral: { Icon: FaUserFriends, color: "#FF6B4A" },
    other: { Icon: FaEllipsisH, color: "#64748B" },
};

const defaults = {
    eyebrow: "BOOKING RECEIVED",
    title: "Thank you, your consultation is requested",
    message: "We'll be in touch within one working day to arrange your free consultation at a time that suits you.",
    summaryTitle: "Your request",
    questionEyebrow: "ONE QUICK QUESTION",
    questionTitle: "How did you hear about us?",
    questionNote: "Optional. Your booking is already with us; this just helps us know what's working.",
    sendText: "Send",
    thanksTitle: "Thanks for letting us know!",
    thanksText: "That really helps. We'll be in touch about your consultation soon.",
    errorText: "We couldn't send that just now. No problem, your booking is safely with us.",
    homeText: "Back to home",
    servicesText: "Explore our services",
    // `detail` (optional): asks a short follow-up, e.g. who referred them.
    sources: [
        { icon: "google", label: "Google search" },
        { icon: "maps", label: "Google Maps" },
        { icon: "facebook", label: "Facebook" },
        { icon: "instagram", label: "Instagram" },
        { icon: "linkedin", label: "LinkedIn" },
        { icon: "tiktok", label: "TikTok" },
        { icon: "youtube", label: "YouTube" },
        { icon: "ai", label: "ChatGPT / AI" },
        { icon: "referral", label: "Friend or referral", detail: "Who referred you? (optional)" },
        { icon: "other", label: "Somewhere else", detail: "Where did you find us? (optional)" },
    ],
};

const fields = {
    "sources[].icon": { type: "select", options: Object.keys(ICONS) },
    "sources[].detail": { label: "Follow-up question (leave empty to send on click)" },
};

// "2026-11-06" reads as "Friday 6 November".
function readable(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export default function ThankYou() {
    const { data, E, editButton, hidden } = useCms("thank-you", defaults, { label: "Thank-you page", fields });

    const [booking, setBooking] = useState(null);
    // idle → (detail) → sending → sent | failed
    const [state, setState] = useState("idle");
    const [picked, setPicked] = useState(-1);
    const [detail, setDetail] = useState("");

    // Read after mount: the booking lives in this tab, not on the server.
    useEffect(() => setBooking(readBookingRef()), []);

    async function send(index, extra = "") {
        const source = data.sources[index];
        if (!source || state === "sending" || state === "sent") return;
        setState("sending");
        const answer = { heard_about_us: source.label };
        if (extra.trim()) answer.details = extra.trim();
        const linked = booking
            ? { booking_sent_at: booking.sentAt, ...Object.fromEntries(booking.answers.map((a) => [`booking_${a.name}`, a.value])) }
            : { Booking: "Not linked (thank-you page opened without a booking in this tab)" };
        const result = await sendFormEmail("quote", { ...answer, ...linked }, { subjectPrefix: "How they heard about us" });
        setState(result.ok ? "sent" : "failed");
        if (result.ok) clearBookingRef();
    }

    function pick(index) {
        if (state === "sending" || state === "sent") return;
        setPicked(index);
        if (data.sources[index]?.detail) {
            setState("detail");
        } else {
            send(index);
        }
    }

    // Hidden by an admin: nothing is rendered for visitors.
    if (hidden) return null;

    const summary = booking?.answers || [];

    return (
        <section className="relative bg-[#F4F7F8] pb-20 sm:pb-24">
            {editButton}

            {/* Confirmation */}
            <div className="bg-[linear-gradient(180deg,#061120_0%,#0B1F3A_100%)] px-4 pb-28 pt-[128px] text-center text-white sm:px-6 sm:pb-32 sm:pt-[160px]">
                <div className="mx-auto max-w-[680px]">
                    <span aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0F9E86] text-2xl shadow-[0_0_0_10px_rgba(15,158,134,0.18)]">
                        <FaCheck />
                    </span>
                    <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#3FD3B8] sm:text-xs">
                        <E.Text path="eyebrow" />
                    </p>
                    <h1 className="mt-3 font-serif text-[32px] font-bold leading-[1.12] tracking-[-0.02em] sm:text-[44px]">
                        <E.Text path="title" />
                    </h1>
                    <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#D7E2EE] sm:text-[16px]">
                        <E.Text path="message" multiline />
                    </p>
                </div>
            </div>

            <div className="relative mx-auto -mt-20 w-full max-w-[860px] space-y-5 px-4 sm:px-6">
                {/* How did you hear about us? (separate from the booking) */}
                <div className="rounded-3xl bg-white p-5 shadow-[0_20px_50px_rgba(18,58,92,0.12)] sm:p-8">
                    {state === "sent" ? (
                        <div role="status" className="py-6 text-center">
                            <span aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F7F4] text-lg text-[#0F9E86]">
                                <FaCheck />
                            </span>
                            <h2 className="mt-4 font-serif text-[24px] font-bold text-[#123A5C]">
                                <E.Text path="thanksTitle" />
                            </h2>
                            <p className="mx-auto mt-2 max-w-[440px] text-[14px] leading-6 text-[#475569]">
                                <E.Text path="thanksText" />
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0F9E86]">
                                    <E.Text path="questionEyebrow" />
                                </p>
                                <h2 className="mt-2 font-serif text-[26px] font-bold leading-tight text-[#123A5C] sm:text-[30px]">
                                    <E.Text path="questionTitle" />
                                </h2>
                                <p className="mx-auto mt-2 max-w-[460px] text-[13px] leading-6 text-[#64748B] sm:text-[14px]">
                                    <E.Text path="questionNote" />
                                </p>
                            </div>

                            <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-3">
                                {data.sources.map((source, index) => {
                                    const { Icon, color } = ICONS[source.icon] || ICONS.other;
                                    const active = picked === index;
                                    return (
                                        <li key={index} className="relative">
                                            <E.Item path="sources" index={index} />
                                            <button
                                                type="button"
                                                onClick={() => pick(index)}
                                                disabled={state === "sending"}
                                                aria-pressed={active}
                                                className={`group flex h-full min-h-[96px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl border px-2 py-4 text-center text-[13px] font-semibold leading-tight text-[#123A5C] transition hover:-translate-y-0.5 hover:border-[#0F9E86] hover:shadow-[0_10px_22px_rgba(18,58,92,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9E86]/50 disabled:cursor-wait ${
                                                    active ? "border-[#0F9E86] bg-[#E8F7F4]" : "border-[#DCE6F2] bg-white"
                                                }`}
                                            >
                                                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F7F8] text-[18px] transition group-hover:scale-105" style={{ color }}>
                                                    {active && state === "sending" ? (
                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#CBD5E1] border-t-[#0F9E86]" />
                                                    ) : (
                                                        <Icon />
                                                    )}
                                                </span>
                                                <E.Text path={`sources.${index}.label`} />
                                            </button>
                                        </li>
                                    );
                                })}
                                <E.Add path="sources" label="Add source" />
                            </ul>

                            {state === "detail" || (state === "sending" && data.sources[picked]?.detail) ? (
                                <form
                                    className="mt-4 flex flex-col gap-2.5 sm:flex-row"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        send(picked, detail);
                                    }}
                                >
                                    <input
                                        autoFocus
                                        aria-label={data.sources[picked]?.detail}
                                        value={detail}
                                        onChange={(e) => setDetail(e.target.value)}
                                        placeholder={data.sources[picked]?.detail}
                                        maxLength={200}
                                        className="h-12 w-full rounded-xl border border-[#DCE6F2] bg-white px-4 text-base text-[#123A5C] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F9E86] focus:ring-2 focus:ring-[#0F9E86]/20 sm:text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={state === "sending"}
                                        className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF6B4A] px-6 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
                                    >
                                        <E.Text path="sendText" />
                                        <FaArrowRight />
                                    </button>
                                </form>
                            ) : null}

                            {state === "failed" ? (
                                <p role="status" className="mt-4 text-center text-[13px] text-[#64748B]">
                                    <E.Text path="errorText" />
                                </p>
                            ) : null}
                        </>
                    )}
                </div>

                {/* What they asked for, so they can check it */}
                {summary.length ? (
                    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-8">
                        <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0F9E86]">
                            <E.Text path="summaryTitle" />
                        </h2>
                        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                            {summary.map(({ label, value }, index) => (
                                <div key={index} className="min-w-0 border-b border-[#F1F5F9] pb-3">
                                    <dt className="text-[12px] text-[#64748B]">{label}</dt>
                                    <dd className="mt-0.5 break-words text-[14px] font-semibold text-[#123A5C]">{readable(value)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ) : null}

                <div className="flex flex-col justify-center gap-3 pt-3 sm:flex-row">
                    <Link href="/" className="flex h-12 items-center justify-center rounded-xl bg-[#123A5C] px-6 text-[14px] font-semibold text-white transition hover:opacity-90">
                        <E.Text path="homeText" />
                    </Link>
                    <Link href="/services" className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-6 text-[14px] font-semibold text-[#123A5C] transition hover:border-[#0F9E86]">
                        <E.Text path="servicesText" />
                        <FaArrowRight className="text-[12px]" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
