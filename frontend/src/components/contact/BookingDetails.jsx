"use client";

import Link from "next/link";
import { FaArrowRight, FaCheck } from "react-icons/fa";

import { useCms } from "@/components/cms/useCms";

/* =========================================
   /contact, below the booking form:
   what happens after booking, how remote
   working works, and what to have ready.
========================================= */

const defaults = {
    eyebrow: "WHAT HAPPENS NEXT",
    title: "How your free consultation works",
    description:
        "We work with clients right across the UK, entirely online. Booking takes a minute, and there's no obligation at any point.",
    steps: [
        {
            title: "Send your details",
            text: "Leave your name, email and phone number, and tell us which services you're interested in.",
        },
        {
            title: "We get in touch",
            text: "We'll contact you within one working day, by email, phone or WhatsApp, to arrange a time that suits you.",
        },
        {
            title: "Your free consultation",
            text: "A short, friendly call about your business, your deadlines and what you need from an accountant.",
        },
        {
            title: "Your tailored quote",
            text: "We send a clear quote based on your needs. If you're happy, we take care of onboarding online.",
        },
    ],
    remoteEyebrow: "100% ONLINE",
    remoteTitle: "Working with us remotely",
    remotePoints: [
        "Video calls at times that suit you, with no office visits",
        "Records and documents shared securely online",
        "Cloud accounting software supported",
        "Clear reminders before every deadline",
        "Clients supported anywhere in the UK",
    ],
    readyTitle: "Helpful to have ready",
    readyPoints: [
        "Your company number or UTR, if you have one",
        "The accounting software you use, if any",
        "Recent VAT returns, payslips or tax returns",
        "Any upcoming deadlines or letters from HMRC",
    ],
    servicesTitle: "Not sure what you need? Explore our services",
    services: [
        { name: "Quarterly VAT Returns", href: "/services/vat-returns" },
        { name: "Monthly Payroll", href: "/services/payroll" },
        { name: "Annual Accounts & Corporation Tax", href: "/services/annual-accounts" },
        { name: "Self Assessment Tax Returns", href: "/services/self-assessment" },
    ],
};

export default function BookingDetails() {
    const { data, hidden, E, editButton } = useCms("contact-booking", defaults, { label: "Booking: what happens next" });

    // Hidden by an admin: nothing is rendered for visitors.
    if (hidden) return null;

    return (
        <section className="relative bg-[#F4F7F8] py-16 sm:py-20 lg:py-24">
            {editButton}

            <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[760px] text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#0F9E86] sm:text-xs">
                        <E.Text path="eyebrow" />
                    </p>
                    <h2 className="mt-3 font-serif text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-[#123A5C] sm:text-[40px] lg:text-[46px]">
                        <E.Text path="title" />
                    </h2>
                    <p className="mt-4 text-[15px] leading-7 text-[#475569] sm:text-[16px]">
                        <E.Text path="description" multiline />
                    </p>
                </div>

                {/* Steps */}
                <div className="relative mt-12">
                <div className="pointer-events-none absolute left-[12%] right-[12%] top-[46px] hidden h-px bg-[linear-gradient(90deg,transparent,#0F9E86_15%,#0F9E86_85%,transparent)] opacity-40 lg:block" aria-hidden="true" />
                <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {data.steps.map((step, index) => (
                        <li key={index} className="relative rounded-[22px] bg-white p-6 shadow-[0_12px_32px_rgba(18,58,92,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(18,58,92,0.12)]">
                            <E.Item path="steps" index={index} />
                            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#123A5C] text-[14px] font-bold text-white ring-4 ring-[#F4F7F8]">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="mt-5 font-serif text-[21px] font-bold text-[#123A5C]">
                                <E.Text path={`steps.${index}.title`} />
                            </h3>
                            <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
                                <E.Text path={`steps.${index}.text`} multiline />
                            </p>
                        </li>
                    ))}
                    <E.Add path="steps" label="Add step" />
                </ol>
                </div>

                {/* Remote working + what to have ready */}
                <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="relative overflow-hidden rounded-[28px] bg-[#06182F] p-8 text-white shadow-[0_30px_80px_rgba(6,24,47,0.25)] sm:p-10">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full bg-[#0F9E86]/20 blur-3xl" aria-hidden="true" />
                        <p className="relative text-[11px] font-semibold uppercase tracking-[0.32em] text-[#5EEAD4] sm:text-xs">
                            <E.Text path="remoteEyebrow" />
                        </p>
                        <h2 className="relative mt-3 font-serif text-[28px] font-bold leading-tight sm:text-[34px]">
                            <E.Text path="remoteTitle" />
                        </h2>
                        <ul className="relative mt-6 space-y-4">
                            {data.remotePoints.map((point, index) => (
                                <li key={index} className="relative flex items-start gap-3 text-[15px] leading-6 text-[#D7E2EE]">
                                    <E.Item path="remotePoints" index={index} />
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F9E86]/20 text-[#5EEAD4]" aria-hidden="true">
                                        <FaCheck size={11} />
                                    </span>
                                    <E.Text path={`remotePoints.${index}`} />
                                </li>
                            ))}
                            <E.Add path="remotePoints" label="Add point" />
                        </ul>
                    </div>

                    <div className="rounded-[28px] border border-[#E2E6E5] bg-white p-8 shadow-[0_12px_32px_rgba(18,58,92,0.06)] sm:p-10">
                        <h2 className="font-serif text-[26px] font-bold leading-tight text-[#123A5C] sm:text-[30px]">
                            <E.Text path="readyTitle" />
                        </h2>
                        <ul className="mt-6 space-y-4">
                            {data.readyPoints.map((point, index) => (
                                <li key={index} className="relative flex items-start gap-3 text-[15px] leading-6 text-[#475569]">
                                    <E.Item path="readyPoints" index={index} />
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F9E86]/10 text-[#0F9E86]" aria-hidden="true">
                                        <FaCheck size={11} />
                                    </span>
                                    <E.Text path={`readyPoints.${index}`} />
                                </li>
                            ))}
                            <E.Add path="readyPoints" label="Add item" />
                        </ul>
                    </div>
                </div>

                {/* Service links */}
                <div className="mt-12 text-center">
                    <p className="text-[15px] font-semibold text-[#123A5C]">
                        <E.Text path="servicesTitle" />
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                        {data.services.map((service, index) => (
                            <Link
                                key={index}
                                href={service.href}
                                className="relative inline-flex items-center gap-2 rounded-full border border-[#D9E4EC] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#123A5C] shadow-[0_6px_18px_rgba(18,58,92,0.06)] transition hover:border-[#0F9E86] hover:text-[#0F9E86]"
                            >
                                <E.Item path="services" index={index} />
                                <E.Text path={`services.${index}.name`} /><E.Link path={`services.${index}.href`} />
                                <FaArrowRight size={11} aria-hidden="true" />
                            </Link>
                        ))}
                        <E.Add path="services" label="Add service link" />
                    </div>
                </div>
            </div>
        </section>
    );
}
