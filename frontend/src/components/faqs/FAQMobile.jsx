"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";

import {
    FaArrowRight,
    FaChevronRight,
    FaSearch,
} from "react-icons/fa";

import { useFaqHelp, useFaqHero, useFaqs } from "@/components/faqs/faqContent";
import { bgImage } from "@/lib/bgImage";

export default function FAQMobile() {
    const { data, E, categories, faqData, editButton, hidden: faqHidden } = useFaqs();
    const { data: hero, E: HeroE, editButton: heroEditButton, hidden: heroHidden } = useFaqHero();
    const { data: help, E: HelpE, editButton: helpEditButton, hidden: helpHidden } = useFaqHelp();
    const heroWords = hero.title.split(" ");
    const [selectedCategory, setSelectedCategory] = useState("General");
    const categoryIndex = categories.findIndex((c) => c.name === selectedCategory);
    const [openQuestion, setOpenQuestion] = useState(null);
    const [search, setSearch] = useState("");

    const questions = useMemo(() => {
        const selectedQuestions = faqData[selectedCategory] || [];
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return selectedQuestions;
        }

        return selectedQuestions.filter(
            (item) =>
                item.q.toLowerCase().includes(searchValue) ||
                item.a.toLowerCase().includes(searchValue)
        );
    }, [faqData, selectedCategory, search]);

    const selectCategory = (category) => {
        setSelectedCategory(category);
        setOpenQuestion(null);
    };

    return (
        <main className="min-h-[var(--ae-vh)] overflow-hidden bg-white lg:hidden">
            {/* ================= MOBILE NAVBAR ================= */}

            {/* Space for the site's fixed header. */}
            <div aria-hidden="true" className="h-[clamp(64px,9svh,78px)] bg-[#061F38]" />

            {/* ================= MOBILE HERO ================= */}

            {!heroHidden ? (
            <section
                className="
                    relative
                    h-[clamp(245px,36svh,330px)]
                    overflow-hidden
                    bg-[#073458]
                "
            >
                {heroEditButton}

                <HeroE.Image path="backgroundImage" />
                <div
                    aria-hidden="true"
                    className="
                        absolute
                        inset-0
                        bg-cover
                        bg-[position:67%_center]
                    "
                    style={{
                        backgroundImage:
                            bgImage(hero.backgroundImage),
                    }}
                />

                {/* Navy image overlay */}
                <div
                    aria-hidden="true"
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-r
                        from-[#06365E]/95
                        via-[#073B65]/88
                        to-[#07375D]/65
                    "
                />

                {/* Bottom decorative wave */}
                <div
                    aria-hidden="true"
                    className="
                        absolute
                        inset-x-0
                        bottom-0
                        h-[30%]
                        bg-[#A9D0E8]/30
                    "
                    style={{
                        clipPath:
                            "polygon(0 38%, 40% 100%, 100% 40%, 100% 100%, 0 100%)",
                    }}
                />

                <div
                    className="
                        relative
                        z-10
                        mx-auto
                        flex
                        h-full
                        w-full
                        max-w-[760px]
                        flex-col
                        justify-center
                        px-5
                        pb-5
                    "
                >
                    <p
                        className="
                            text-[clamp(11px,1.5svh,13px)]
                            font-extrabold
                            uppercase
                            tracking-[0.36em]
                            text-[#13B7A1]
                        "
                    >
                        <HeroE.Text path="eyebrow" />
                    </p>

                    <div role="heading" aria-level={1}
                        className="
                            mt-[clamp(10px,1.5svh,15px)]
                            max-w-[330px]
                            font-serif
                            text-[clamp(38px,11vw,56px)]
                            font-bold
                            leading-[0.94]
                            tracking-[-0.035em]
                            text-white
                        "
                    >
                        {heroWords.slice(0, -1).join(" ")}

                        <span className="block">
                            {heroWords.at(-1)}{" "}
                            <span className="text-[#FF674B]">
                                <HeroE.Text path="titleHighlight" />
                            </span>
                        </span>
                    </div>

                    <p
                        className="
                            mt-[clamp(14px,2.1svh,20px)]
                            max-w-[330px]
                            text-[clamp(14px,2svh,18px)]
                            leading-[1.55]
                            text-white/90
                        "
                    >
                        <HeroE.Text path="mobileDescription" />
                    </p>
                </div>
            </section>
            ) : null}

            {/* ================= MOBILE CATEGORIES ================= */}

            {!faqHidden ? (
            <>
            <section className="relative bg-white px-4 py-[clamp(22px,3.4svh,34px)]">
                {editButton}

                <div className="mx-auto w-full max-w-[760px]">
                    <p
                        className="
                            text-[clamp(11px,1.4svh,13px)]
                            font-extrabold
                            uppercase
                            tracking-[0.34em]
                            text-[#0F9E86]
                        "
                    >
                        <E.Text path="browseEyebrow" />
                    </p>

                    <h2
                        className="
                            mt-2
                            max-w-[360px]
                            font-serif
                            text-[clamp(31px,8.7vw,45px)]
                            font-bold
                            leading-[1.01]
                            tracking-[-0.025em]
                            text-[#0B345B]
                        "
                    >
                        <E.Text path="browseTitle" />
                        <span className="block"><E.Text path="browseTitleSecondLine" /></span>
                    </h2>

                    {/* Search */}
                    <div
                        className="
                            mt-[clamp(18px,2.5svh,24px)]
                            flex
                            h-[clamp(54px,7.5svh,64px)]
                            items-center
                            overflow-hidden
                            rounded-[14px]
                            border
                            border-[#D6E0E7]
                            bg-white
                            pl-4
                            shadow-[0_8px_22px_rgba(18,58,92,0.09)]
                        "
                    >
                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search questions, topics or keywords..."
                            className="
                                min-w-0
                                flex-1
                                bg-transparent
                                text-[clamp(12px,3.5vw,15px)]
                                text-[#123A5C]
                                outline-none
                                placeholder:text-[#8793A7]
                            "
                        />

                        <button
                            type="button"
                            aria-label="Search FAQs"
                            onClick={() =>
                                document
                                    .getElementById("faq-mobile-answers")
                                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                            }
                            className="
                                flex
                                h-full
                                w-[clamp(56px,16vw,70px)]
                                shrink-0
                                items-center
                                justify-center
                                rounded-[13px]
                                bg-[#FF6245]
                                text-[21px]
                                text-white
                                shadow-[0_8px_20px_rgba(255,98,69,0.28)]
                            "
                        >
                            <FaSearch />
                        </button>
                    </div>

                    {/* Category cards */}
                    <div
                        className="
                            mt-[clamp(16px,2.4svh,22px)]
                            grid
                            grid-cols-2
                            gap-[clamp(10px,1.5svh,14px)]
                        "
                    >
                        {categories.map((category, index) => {
                            const Icon = category.Icon;
                            const active =
                                selectedCategory === category.name;
                            const last = index === categories.length - 1;

                            return (
                                <motion.button
                                    type="button"
                                    key={index}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        selectCategory(category.name)
                                    }
                                    className={`
                                        flex
                                        h-[clamp(72px,10.5svh,92px)]
                                        min-w-0
                                        items-center
                                        gap-3
                                        rounded-[14px]
                                        border
                                        px-[clamp(10px,3vw,16px)]
                                        text-left
                                        transition-all
                                        duration-300

                                        ${last
                                            ? "col-span-2"
                                            : "col-span-1"
                                        }

                                        ${active
                                            ? `
                                                    border-[#0BAE95]
                                                    bg-white
                                                    shadow-[0_10px_26px_rgba(15,158,134,0.13)]
                                                `
                                            : `
                                                    border-[#DCE4E9]
                                                    bg-white
                                                    shadow-[0_7px_18px_rgba(18,58,92,0.06)]
                                                `
                                        }
                                    `}
                                >
                                    <span
                                        className="
                                            flex
                                            h-[clamp(42px,6.2svh,54px)]
                                            w-[clamp(42px,6.2svh,54px)]
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#E5F6F3]
                                            text-[clamp(17px,2.5svh,23px)]
                                            text-[#087A9B]
                                        "
                                    >
                                        <Icon />
                                    </span>

                                    <span
                                        className="
                                            min-w-0
                                            flex-1
                                            text-[clamp(12px,3.4vw,16px)]
                                            font-bold
                                            leading-[1.18]
                                            text-[#123A5C]
                                        "
                                    >
                                        {category.name}
                                    </span>

                                    <FaChevronRight
                                        className="
                                            shrink-0
                                            text-[14px]
                                            text-[#0FA58A]
                                        "
                                    />
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ================= MOBILE FAQ LIST ================= */}

            <section
                id="faq-mobile-answers"
                className="
                    relative
                    overflow-hidden
                    bg-white
                    px-4
                    pb-7
                    pt-[clamp(34px,5svh,52px)]
                "
            >
                {/* Decorative background circle */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        -right-28
                        -top-28
                        h-[250px]
                        w-[250px]
                        rounded-full
                        border-[45px]
                        border-[#EAF9F7]/70
                    "
                />

                <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="relative z-10 mx-auto w-full max-w-[760px]"
                >
                    <div
                        className="
                            border-l-[4px]
                            border-[#FF6245]
                            py-1
                            pl-[clamp(16px,4vw,24px)]
                        "
                    >
                        <p
                            className="
                                text-[clamp(11px,1.5svh,13px)]
                                font-extrabold
                                uppercase
                                tracking-[0.32em]
                                text-[#0F9E86]
                            "
                        >
                            {selectedCategory}
                        </p>

                        <h2
                            className="
                                mt-2
                                font-serif
                                text-[clamp(33px,9vw,46px)]
                                font-bold
                                leading-none
                                tracking-[-0.025em]
                                text-[#0B345B]
                            "
                        >
                            {selectedCategory} FAQs
                        </h2>
                    </div>

                    <div
                        className="
                            mt-[clamp(22px,3.2svh,32px)]
                            space-y-[clamp(10px,1.5svh,14px)]
                        "
                    >
                        {questions.length > 0 ? (
                            questions.map((item, index) => {
                                const active =
                                    openQuestion === index;

                                return (
                                    <div
                                        key={index}
                                        className="
                                            overflow-hidden
                                            rounded-[14px]
                                            border
                                            border-[#CAD7E0]
                                            bg-white
                                        "
                                    >
                                        <button
                                            type="button"
                                            aria-expanded={active}
                                            data-track-faq-topic={selectedCategory || undefined}
                                            onClick={() =>
                                                setOpenQuestion(
                                                    active ? null : index
                                                )
                                            }
                                            className={`
                                                flex
                                                min-h-[clamp(72px,10svh,92px)]
                                                w-full
                                                items-center
                                                justify-between
                                                gap-4
                                                px-[clamp(16px,4.5vw,24px)]
                                                py-4
                                                text-left
                                                transition-colors
                                                duration-300

                                                ${active
                                                    ? "bg-[#123A5C] text-white"
                                                    : "bg-white text-[#0B345B]"
                                                }
                                            `}
                                        >
                                            <span
                                                className="
                                                    text-[clamp(15px,4.2vw,20px)]
                                                    font-bold
                                                    leading-[1.28]
                                                "
                                            >
                                                {search.trim() ? item.q : <E.Text path={`categories.${categoryIndex}.questions.${index}.q`} />}
                                            </span>

                                            <span
                                                className={`
                                                    flex
                                                    h-[clamp(38px,5.8svh,50px)]
                                                    w-[clamp(38px,5.8svh,50px)]
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    text-[24px]
                                                    font-light

                                                    ${active
                                                        ? "bg-[#FF6245] text-white"
                                                        : "bg-[#E6F7F4] text-[#0FA58A]"
                                                    }
                                                `}
                                            >
                                                {active ? "−" : "+"}
                                            </span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {active && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.28,
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <p
                                                        className="
                                                            border-t
                                                            border-[#DCE5EB]
                                                            bg-[#F5F8FA]
                                                            px-[clamp(16px,4.5vw,24px)]
                                                            py-4
                                                            text-[clamp(13px,3.6vw,16px)]
                                                            leading-[1.65]
                                                            text-[#4B6680]
                                                        "
                                                    >
                                                        {search.trim() ? item.a : <E.Text path={`categories.${categoryIndex}.questions.${index}.a`} multiline />}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        ) : (
                            <div
                                className="
                                    rounded-[14px]
                                    border
                                    border-[#DCE4E9]
                                    bg-[#F7FAFB]
                                    px-5
                                    py-8
                                    text-center
                                    text-sm
                                    text-[#536B87]
                                "
                            >
                                No matching questions were found.
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>
            </>
            ) : null}

            {/* ================= MOBILE HELP CARD ================= */}

            {!helpHidden ? (
            <section className="relative bg-white px-4 pb-8">
                {helpEditButton}

                <HelpE.Image path="backgroundImage" />
                <div
                    className="
                        relative
                        mx-auto
                        h-[clamp(300px,43svh,390px)]
                        w-full
                        max-w-[760px]
                        overflow-hidden
                        rounded-[clamp(22px,6vw,32px)]
                        bg-cover
                        bg-[position:65%_center]
                        shadow-[0_14px_35px_rgba(18,58,92,0.10)]
                    "
                    style={{
                        backgroundImage:
                            bgImage(help.backgroundImage),
                    }}
                >
                    {/* Keeps text readable without hiding the mug */}
                    <div
                        aria-hidden="true"
                        className="
                            absolute
                            inset-y-0
                            left-0
                            w-[68%]
                            bg-gradient-to-r
                            from-[#EAFBFC]/95
                            via-[#EAFBFC]/78
                            to-transparent
                        "
                    />

                    <div
                        className="
                            relative
                            z-10
                            flex
                            h-full
                            flex-col
                            px-[clamp(20px,6vw,34px)]
                            py-[clamp(24px,4svh,38px)]
                        "
                    >
                        <p
                            className="
                                text-[clamp(11px,1.5svh,13px)]
                                font-extrabold
                                uppercase
                                tracking-[0.32em]
                                text-[#0F9E86]
                            "
                        >
                            <HelpE.Text path="eyebrow" />
                        </p>

                        <h3
                            className="
                                mt-[clamp(12px,1.8svh,18px)]
                                max-w-[72%]
                                font-serif
                                text-[clamp(28px,7.5vw,40px)]
                                font-bold
                                leading-[1.04]
                                tracking-[-0.02em]
                                text-[#0B345B]
                            "
                        >
                            {help.title.replace(/\n/g, " ")}
                        </h3>

                        <p
                            className="
                                mt-[clamp(14px,2svh,20px)]
                                max-w-[65%]
                                text-[clamp(14px,3.8vw,18px)]
                                leading-[1.5]
                                text-[#536B87]
                            "
                        >
                            <HelpE.Text path="mobileDescription" />
                        </p>

                        <Link
                            href={help.buttonHref}
                            className="
                                mt-auto
                                flex
                                h-[clamp(52px,7svh,62px)]
                                w-[clamp(170px,52vw,220px)]
                                items-center
                                justify-center
                                gap-3
                                rounded-[15px]
                                bg-[#FF6245]
                                text-[clamp(15px,4vw,18px)]
                                font-semibold
                                text-white
                                shadow-[0_12px_25px_rgba(255,98,69,0.25)]
                                transition
                                active:scale-[0.98]
                            "
                        >
                            <HelpE.Text path="buttonText" />
                            <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
            ) : null}
        </main>
    );
}