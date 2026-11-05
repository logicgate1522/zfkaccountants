"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Fragment } from "react";

import { useCms } from "@/components/cms/useCms";
import { mediaUrl } from "@/lib/api";

const defaults = {
    eyebrow: "Our Story",
    titleLine1: "At the heart",
    titleLine2: "of your",
    titleHighlight: "success.",
    paragraph1:
        "Everything we do is built around helping people, businesses and communities thrive.",
    paragraph2:
        "From supporting ambitious startups to guiding established businesses, we combine expertise, technology and a personal approach to make accounting simpler.",
    buttonText: "Get to Know Us",
    buttonHref: "#our-team",
    tagline: "People. Compliance. Progress.",
    image: "/images/about/story-design-zfk.png",
    imageAlt: "ZFK Accountants supporting businesses, individuals and communities",
};

export default function AboutStory() {
    const { data, E, editButton, hidden } = useCms("about-story", defaults, { label: "Our story" });
    const taglineParts = data.tagline.split(/(?<=\.)\s+/);

    // Hidden by an admin: nothing is rendered for visitors.
    if (hidden) return null;

    return (
        <>
            {/* =========================================
                MOBILE AND TABLET VIEW
            ========================================== */}

            <section
                className="
                    relative
                    overflow-hidden
                    bg-white
                    pb-8
                    pt-6
                    lg:hidden
                "
            >
            {editButton}

                <div className="mx-auto w-full max-w-[680px]">
                    {/* Mobile text */}
                    <div className="px-5 sm:px-8">
                        <p
                            className="
                                m-0
                                text-[clamp(11px,3.1vw,15px)]
                                font-bold
                                uppercase
                                tracking-[0.36em]
                                text-[#0F9E86]
                            "
                        >
                            <E.Text path="eyebrow" />
                        </p>

                        <h2
                            className="
                                mb-0
                                mt-3
                                font-serif
                                text-[clamp(32px,9.6vw,56px)]
                                font-bold
                                leading-[1.02]
                                tracking-[-0.035em]
                                text-[#123A5C]
                            "
                        >
                            <E.Text path="titleLine1" />
                            <br />
                            <E.Text path="titleLine2" />{" "}
                            <span className="text-[#0F9E86]">
                                <E.Text path="titleHighlight" />
                            </span>
                        </h2>

                        {/* Green underline */}
                        <div
                            aria-hidden="true"
                            className="
                                mt-3
                                h-[3px]
                                w-10
                                bg-[#0F9E86]
                                sm:w-14
                            "
                        />

                        {/* Two paragraphs, matching the reference */}
                        <div
                            className="
                                mt-4
                                space-y-2
                                text-[clamp(14px,3.8vw,18px)]
                                font-normal
                                leading-[1.55]
                                text-[#334B65]
                            "
                        >
                            <p className="m-0">
                                <E.Text path="paragraph1" />
                            </p>

                            <p className="m-0">
                                <E.Text path="paragraph2" />
                            </p>
                        </div>

                        <Link
                href={data.buttonHref}
                            className="
                                mt-4
                                inline-flex
                                min-h-[44px]
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                bg-[#FF6B4A]
                                px-5
                                py-3
                                text-[clamp(14px,4vw,18px)]
                                font-semibold
                                leading-tight
                                text-white
                                shadow-[0_8px_20px_rgba(18,58,92,0.12)]
                                transition-transform
                                active:scale-[0.98]
                                sm:px-7
                            "
                        >
                            <E.Text path="buttonText" /><E.Link path="buttonHref" />
                            <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    {/* =====================================
                        MOBILE DESIGN IMAGE
                        The complete design is already
                        included in story-design-zfk.png.
                    ====================================== */}

                    <div className="mt-2 px-2 sm:px-4">
                        <div className="relative aspect-square w-full">
                            <E.Image path="image" />
                            <Image
                                src={mediaUrl(data.image)}
                                alt={data.imageAlt}
                                fill
                                sizes="(max-width: 700px) 100vw, 680px"
                                className="
                                    object-contain
                                    object-center
                                "
                            />
                        </div>
                    </div>

                    {/* Mobile tagline below the image */}
                    <div className="mt-2 px-3 text-center">
                        <p
                            className="
                                m-0
                                whitespace-nowrap
                                font-serif
                                text-[clamp(19px,5.3vw,32px)]
                                italic
                                leading-tight
                                tracking-[-0.025em]
                                text-[#123A5C]
                            "
                        >
                            <E.Text path="tagline" />
                        </p>

                        <div
                            aria-hidden="true"
                            className="
                                mx-auto
                                mt-3
                                h-[3px]
                                w-20
                                bg-[#0F9E86]
                            "
                        />
                    </div>
                </div>
            </section>

            {/* =========================================
                DESKTOP VIEW
                Existing layout preserved
            ========================================== */}

            <section
                className="
                    relative
                    hidden
                    min-h-[700px]
                    items-center
                    py-20
                    overflow-hidden
                    bg-white
                    lg:flex
                "
            >
            {editButton}

                <div
                    className="
                        mx-auto
                        grid
                        w-full
                        max-w-[1400px]
                        grid-cols-[40%_60%]
                        items-center
                        px-10
                    "
                >
                    {/* Desktop left content */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -40,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{
                            once: true,
                        }}
                        transition={{
                            duration: 0.7,
                        }}
                    >
                        <p
                            className="
                                text-sm
                                font-bold
                                uppercase
                                tracking-[7px]
                                text-[#0F9E86]
                            "
                        >
                            <E.Text path="eyebrow" />
                        </p>

                        <h2
                            className="
                                mt-6
                                font-serif
                                text-[56px]
                                font-bold
                                leading-[1.05]
                                text-[#123A5C]
                            "
                        >
                            <E.Text path="titleLine1" />
                            <br />
                            <E.Text path="titleLine2" />{" "}
                            <span className="text-[#0F9E86]">
                                <E.Text path="titleHighlight" />
                            </span>
                        </h2>

                        <div
                            className="
                                mt-5
                                h-[3px]
                                w-14
                                bg-[#0F9E86]
                            "
                        />

                        <p
                            className="
                                mt-6
                                max-w-[450px]
                                text-[17px]
                                leading-8
                                text-[#334B65]
                            "
                        >
                            <E.Text path="paragraph1" />
                            <br />
                            <E.Text path="paragraph2" />
                        </p>

                        <Link
                href={data.buttonHref}
                            className="inline-block 
                                mt-8
                                rounded-xl
                                bg-[#FF6B4A]
                                px-9
                                py-4
                                text-lg
                                font-semibold
                                text-white
                                shadow-lg
                                transition
                                hover:scale-105
                            "
                        >
                            <E.Text path="buttonText" /><E.Link path="buttonHref" /> →
                        </Link>

                        <div
                            className="
                                mt-8
                                font-serif
                                text-3xl
                                italic
                                leading-tight
                                text-[#123A5C]
                            "
                        >
                            {taglineParts.map((part, index) => (
                                <Fragment key={index}>
                                    {index > 0 ? <br /> : null}
                                    {part}
                                </Fragment>
                            ))}

                            <div
                                className="
                                    mt-2
                                    h-[3px]
                                    w-24
                                    bg-[#0F9E86]
                                "
                            />
                        </div>
                    </motion.div>

                    {/* Desktop right image */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.95,
                        }}
                        whileInView={{
                            opacity: 1,
                            scale: 1,
                        }}
                        viewport={{
                            once: true,
                        }}
                        transition={{
                            duration: 0.8,
                        }}
                        className="
                            relative
                            mt-5
                            h-[700px]
                            translate-x-20
                        "
                    >
                        <E.Image path="image" />
                        <Image
                            src={mediaUrl(data.image)}
                            fill
                            sizes="620px"
                            alt={data.imageAlt}
                            className="object-contain"
                        />
                    </motion.div>
                </div>
            </section>
        </>
    );
}