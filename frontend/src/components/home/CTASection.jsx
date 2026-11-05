"use client";

import {
    FaShieldAlt,
    FaCoins,
    FaCloud,
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
    formEyebrow: "BOOK YOUR",
    formTitle: "Free",
    formTitleHighlight: "Consultation",
    formDescription:
        "Leave your details and we'll be in touch within one working day to arrange your call.",
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
                grid-cols-2
                items-center
                gap-8
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







                    {/* FORM */}


                    <div
                        className="
                    rounded-[36px]
                    bg-white
                    px-8
                    py-5
                    shadow-[0_30px_90px_rgba(0,0,0,.35)]
                    overflow-hidden
                    relative
                    "
                    >


                        <div
                            className="
                        absolute
                        right-[-70px]
                        top-[-70px]
                        h-[200px]
                        w-[200px]
                        rounded-full
                        bg-[#06182F]
                        opacity-10
                        "
                        />




                        <div className="relative z-10">


                            <p
                                className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-[0.35em]
                            text-[#0F9E86]
                            "
                            >
                                <E.Text path="formEyebrow" />
                            </p>



                            <SubHeading
                                className="
                            mt-2
                            font-serif
                            text-[32px] leading-tight
                            font-bold
                            text-[#123A5C]
                            "
                            >

                                <E.Text path="formTitle" />

                                <span
                                    className="
                                text-[#FF6B4A]
                                "
                                >
                                    {" "}<E.Text path="formTitleHighlight" />
                                </span>

                            </SubHeading>




                            <p
                                className="
                            mt-2
                            text-sm
                            leading-6
                            text-[#64748B]
                            "
                            >

                                <E.Text path="formDescription" />

                            </p>




                            <QuoteForm variant="desktop" />


                        </div>


                    </div>



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


                    {/* =========================
            QUOTE FORM
        ========================== */}

                    <div
                        className="
                relative
                mt-7
                w-full
                overflow-hidden
                rounded-[28px]
                bg-white
                px-5
                py-6
                shadow-[0_25px_70px_rgba(0,0,0,.35)]

                sm:mt-9
                sm:rounded-[32px]
                sm:px-7
                sm:py-7
            "
                    >

                        {/* Decorative Circle */}
                        <div
                            className="
                    absolute
                    right-[-65px]
                    top-[-65px]
                    h-[170px]
                    w-[170px]
                    rounded-full
                    bg-[#06182F]
                    opacity-10

                    sm:h-[190px]
                    sm:w-[190px]
                "
                        />


                        <div className="relative z-10">

                            {/* Form Heading */}

                            <p
                                className="
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.30em]
                        text-[#0F9E86]

                        sm:text-xs
                        sm:tracking-[0.35em]
                    "
                            >
                                <E.Text path="formEyebrow" />
                            </p>


                            <SubHeading
                                className="
                        mt-2
                        font-serif
                        text-[28px]
                        font-bold
                        leading-tight
                        text-[#123A5C]

                        sm:text-[32px]
                    "
                            >
                                <E.Text path="formTitle" />{" "}

                                <span className="text-[#FF6B4A]">
                                    <E.Text path="formTitleHighlight" />
                                </span>
                            </SubHeading>


                            <p
                                className="
                        mt-2
                        max-w-[580px]
                        text-[13px]
                        leading-5
                        text-[#64748B]

                        sm:text-sm
                        sm:leading-6
                    "
                            >
                                <E.Text path="formDescription" />
                            </p>


                            {/* =========================
                    FORM FIELDS
                ========================== */}

                            <QuoteForm variant="mobile" />

                        </div>

                    </div>

                </div>

            </section>
        </>
    )

}
