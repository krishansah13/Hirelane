import FooterSection from "@/components/FooterSection";

export default function PublicLayout({children} : {children : React.ReactNode} ) {
    return (
        <>
        {children}
        <FooterSection/>
        </>
    )
}