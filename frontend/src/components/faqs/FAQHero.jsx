"use client";

import { useFaqHero } from "@/components/faqs/faqContent";
import { bgImage } from "@/lib/bgImage";

export default function FAQHero() {

    const { data, E, editButton, hidden } = useFaqHero();


    // Hidden by an admin: nothing is rendered for visitors.
    if (hidden) return null;

    return (
        <section
            className="
            relative
            min-h-[270px]
            bg-[#123A5C]
            pb-10
            overflow-hidden
            "
        >
            {editButton}


            {/* background image */}
            <E.Image path="backgroundImage" />
            <div
                className="
                absolute
                inset-0
                bg-cover
                bg-center
                opacity-80
                "
                style={{
                    backgroundImage:
                        bgImage(data.backgroundImage)
                }}
            />


            {/* remove curve effect */}
            <div
                className="
                absolute
                inset-0
                bg-[#123A5C]/70
                "
            />



            <div
                className="
                relative
                max-w-[1400px]
                mx-auto
                px-6
                pt-6
                "
            >


                {/* Space for the site's fixed header. */}
                <div aria-hidden="true" className="h-11" />



                <div className="mt-8">

                    <p
                        className="
                    text-[#0F9E86]
                    uppercase
                    tracking-[6px]
                    text-xs
                    font-bold
                    "
                    >
                        <E.Text path="eyebrow" />
                    </p>


                    <h1
                        className="
                    font-serif
                    text-white
                    text-[48px]
                    font-bold
                    mt-3
                    "
                    >
                        <E.Text path="title" />{" "}
                        <span className="text-[#FF6B4A]">
                            <E.Text path="titleHighlight" />
                        </span>
                    </h1>


                    <p
                        className="
                    text-white/90
                    mt-3
                    max-w-[480px]
                    "
                    >
                        <E.Text path="description" />
                    </p>


                </div>



            </div>


        </section>
    )
}