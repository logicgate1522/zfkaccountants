"use client";

import {
    FaShieldAlt,
    FaCoins,
    FaCloud,
    FaRegCalendarCheck,
} from "react-icons/fa";

import { usePathname } from "next/navigation";

import QuoteForm, { THANK_YOU_PATH } from "@/components/contact/QuoteForm";
import { useCms } from "@/components/cms/useCms";
import { bgImage } from "@/lib/bgImage";


const ICONS = {
    shield: FaShieldAlt,
    coins: FaCoins,
    cloud: FaCloud,
};


const defaults = {
    eyebrow: "BOOK A FREE CONSULTATION",
    titleLine1: "Let's make your",
    titleLine2: "accounting",
    titleHighlight: "simpler.",
    // Used instead of the three lines above when this section IS the page
    // (/contact), so the page's H1 names what it is for.
    pageTitleLine1: "Book your free",
    pageTitleLine2: "accountant",
    pageTitleHighlight: "consultation.",
    description:
        "Request a free, no-obligation consultation. Tell us what your business needs and we'll follow up with a clear quote tailored to you.",
    backgroundImage: "/images/home/cta-desk.png",
    // Form card header: "Book Your" + coral "Free Consultation".
    formHeading: "Book Your",
    formHeadingHighlight: "Free Consultation",
    formSubtitle: "Leave your details and we'll be in touch within one working day.",
    benefits: [
        {
            icon: "shield",
            title: "100% Online",
            text: "Wherever you are in the UK",
        },
        {
            icon: "coins",
            title: "Tailored Quotes",
            text: "Priced to your business",
        },
        {
            icon: "cloud",
            title: "Cloud Accounting Support",
            text: "Stay connected anytime, anywhere",
        },
    ],
};


const fields = {
    "benefits[].icon": { type: "select", options: Object.keys(ICONS) },
};


// The booking card: compact header (icon, title, one-line subtitle) over the form.
function FormCard({ E, SubHeading, variant, className = "" }) {
    const desktop = variant === "desktop";
    return (
        <div className={`relative w-full overflow-hidden bg-white shadow-[0_24px_70px_rgba(0,0,0,.32)] ${desktop ? "rounded-[28px] px-8 py-7" : "rounded-[24px] px-5 py-6 sm:rounded-[28px] sm:px-7 sm:py-7"} ${className}`}>
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#0F9E86] opacity-[0.07]" />
            <div className="relative z-10">
                <div className="flex items-center gap-3.5">
                    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#E8F7F4] text-[#0F9E86] ${desktop ? "h-12 w-12 text-[22px]" : "h-11 w-11 text-[20px]"}`}>
                        <FaRegCalendarCheck />
                    </span>
                    <div className="min-w-0">
                        <SubHeading className={`font-serif font-bold leading-tight text-[#123A5C] ${desktop ? "text-[28px]" : "text-[23px] sm:text-[28px]"}`}>
                            <E.Text path="formHeading" />{" "}
                            <span className="text-[#FF6B4A]"><E.Text path="formHeadingHighlight" /></span>
                        </SubHeading>
                        <p className="mt-0.5 text-[13px] leading-5 text-[#64748B] sm:text-sm">
                            <E.Text path="formSubtitle" />
                        </p>
                    </div>
                </div>
                <QuoteForm variant={variant} />
            </div>
        </div>
    );
}


// The layout renders this on every page. /contact renders it itself as the
// page's main section (`asPage`), so the layout copy steps aside there.
export default function CTASection({ asPage = false }) {

    const { data, E, editButton, hidden } = useCms("cta-section", defaults, {
        label: "Book a consultation section",
        excludeFromKeywordAudit: true,
        fields,
    });

    // On /contact this section is the page itself, so its heading is the H1.
    const pathname = usePathname();
    const Heading = asPage ? "h1" : "h2";
    // One level below the section heading, so the outline never skips a level.
    const SubHeading = Heading === "h1" ? "h2" : "h3";

    const benefits = data.benefits.map((item) => ({
        ...item,
        icon: ICONS[item.icon] || FaShieldAlt,
    }));

    // Hidden by an admin: nothing is rendered for visitors.
    if (hidden) return null;
    // ...and right after booking, /thank-you shouldn't offer the form again.
    if (!asPage && (pathname === "/contact" || pathname === THANK_YOU_PATH)) return null;

    return (
        <>
            <section
                className="
        hidden
        lg:block
        py-[96px]
        relative
        overflow-hidden
    "
            >

                {editButton}


                {/* Background */}

                <E.Image path="backgroundImage" />
                <div
                    className="
                absolute
                inset-0
                bg-cover
                bg-center
                "
                    style={{
                        backgroundImage:
                            bgImage(data.backgroundImage),
                    }}
                />



                {/* Overlay */}

                <div
                    className="
                absolute
                inset-0
                bg-[#06182F]/75
                "
                />




                <div
                    className="
                relative
                z-10
                mx-auto
                grid
                h-full
                max-w-[1280px]
                grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]
                items-center
                gap-12
                px-8
                "
                >



                    {/* LEFT SIDE */}

                    <div
                        className="
                    max-w-[540px]
                    "
                    >

                        <p
                            className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.35em]
                        text-[#0F9E86]
                        "
                        >
                            <E.Text path="eyebrow" />
                        </p>




                        <Heading
                            className="
                        mt-4
                        font-serif
                        text-[52px]
                        font-bold
                        leading-[1.05]
                        text-white
                        "
                        >

                            <E.Text path={asPage ? "pageTitleLine1" : "titleLine1"} />

                            <br />

                            <E.Text path={asPage ? "pageTitleLine2" : "titleLine2"} />

                            <span
                                className="
                            text-[#FF6B4A]
                            "
                            >
                                {" "}<E.Text path={asPage ? "pageTitleHighlight" : "titleHighlight"} />
                            </span>

                        </Heading>




                        <p
                            className="
                        mt-5
                        max-w-[480px]
                        text-[16px]
                        leading-7
                        text-[#D7E2EE]
                        "
                        >

                            <E.Text path="description" />

                        </p>





                        <div
                            className="
                        mt-7
                        flex
                        "
                        >

                            {
                                benefits.map((item, index) => {

                                    const Icon = item.icon;


                                    return (

                                        <div
                                            key={index}
                                            className={`relative 
                                        w-[170px]
                                        ${index !== 0
                                                    ?
                                                    "border-l border-white/20 pl-5"
                                                    :
                                                    ""
                                                }
                                        `}
                                        >
<E.Item path="benefits" index={index} />


                                            <div
                                                className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-[#0F9E86]
                                            bg-[#0F9E86]/10
                                            text-[#0F9E86]
                                            "
                                            >
                                                <Icon size={22} />
                                            </div>




                                            <SubHeading
                                                className="
                                            mt-3
                                            text-[15px]
                                            font-bold
                                            leading-5
                                            text-white
                                            "
                                            >
                                                <E.Text path={`benefits.${index}.title`} />
                                            </SubHeading>



                                            <p
                                                className="
                                            mt-2
                                            text-sm
                                            text-[#D5E0EC]
                                            "
                                            >
                                                <E.Text path={`benefits.${index}.text`} />
                                            </p>



                                        </div>

                                    )


                                })
                            }
                            <E.Add path="benefits" label="Add benefit" />


                        </div>



                    </div>







                    <FormCard E={E} SubHeading={SubHeading} variant="desktop" />



                </div>


            </section>

            {/* =========================================================
    MOBILE + TABLET CTA
    Completely separate from desktop version
========================================================= */}

            <section
                className="
        block
        lg:hidden
        relative
        overflow-hidden
        bg-[#06182F]
        pt-2
    "
            >
                {editButton}

                {/* Background */}
                <E.Image path="backgroundImage" />
                <div
                    className="
            absolute
            inset-0
            bg-cover
            bg-center
        "
                    style={{
                        backgroundImage:
                            bgImage(data.backgroundImage),
                    }}
                />

                {/* Dark overlay */}
                <div
                    className="
            absolute
            inset-0
            bg-[#06182F]/75
        "
                />

                {/* Mobile Content */}
                <div
                    className="
            relative
            z-10
            mx-auto
            w-full
            max-w-[720px]
            px-5
            py-12
            sm:px-8
            sm:py-14
        "
                >

                    {/* =========================
            HEADING
        ========================== */}

                    <div className="w-full">

                        <p
                            className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.30em]
                    text-[#0F9E86]

                    sm:text-xs
                    sm:tracking-[0.35em]
                "
                        >
                            <E.Text path="eyebrow" />
                        </p>


                        <div role="heading" aria-level={Heading === "h1" ? 1 : 2}
                            className="
                    mt-3
                    max-w-[680px]
                    font-serif
                    text-[38px]
                    font-bold
                    leading-[1.05]
                    tracking-[-0.02em]
                    text-white

                    xs:text-[42px]
                    sm:text-[50px]
                    sm:leading-[1.04]
                "
                        >
                            <E.Text path={asPage ? "pageTitleLine1" : "titleLine1"} />
                            <br />

                            <E.Text path={asPage ? "pageTitleLine2" : "titleLine2"} />{" "}

                            <span className="text-[#FF6B4A]">
                                <E.Text path={asPage ? "pageTitleHighlight" : "titleHighlight"} />
                            </span>
                        </div>


                        <p
                            className="
                    mt-4
                    max-w-[620px]
                    text-[15px]
                    leading-6
                    text-[#D7E2EE]

                    sm:text-[16px]
                    sm:leading-7
                "
                        >
                            <E.Text path="description" />
                        </p>

                    </div>


                    <FormCard E={E} SubHeading={SubHeading} variant="mobile" className="mt-7 sm:mt-9" />

                </div>

            </section>
        </>
    )

}
