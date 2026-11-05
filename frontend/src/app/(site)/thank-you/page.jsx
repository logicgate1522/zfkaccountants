import CmsSection from "@/components/cms/CmsSection";
import ThankYou from "@/components/contact/ThankYou";

// Reached only after booking, so it stays out of search and the sitemap.
export const metadata = {
    title: "Thank You",
    robots: { index: false, follow: true },
};


export default function ThankYouPage() {

    return (
        <CmsSection names={["thank-you"]}>
            <ThankYou />
        </CmsSection>
    );

}
