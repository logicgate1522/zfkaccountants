import CmsSection from "@/components/cms/CmsSection";
import BookingDetails from "@/components/contact/BookingDetails";
import CTASection from "@/components/home/CTASection";
import PageSeo from "@/components/seo/PageSeo";
import { pageMetadata } from "@/lib/seo";

const fallbackMetadata = {
    title: "Book a Free Consultation with Online UK Accountants",
    description:
        "Book a free, no-obligation video consultation with ZFK Accountants. Send your details and get a quote tailored to your business.",
};


export function generateMetadata() {
    return pageMetadata("/contact", fallbackMetadata);
}


// The booking form is the page's main section (H1); the layout's copy of the
// same section steps aside on this route.
export default function ContactPage() {

    return (
        <CmsSection names={["contact-booking"]}>
            <PageSeo path="/contact" />
            <CTASection asPage />
            <BookingDetails />
        </CmsSection>
    );

}
