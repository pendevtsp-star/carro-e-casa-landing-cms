import { Footer } from "@/components/public/footer";
import { Header } from "@/components/public/header";
import { getSiteSetting } from "@/lib/content";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSetting();

  return (
    <>
      <Header
        logoUrl={settings.logoUrl}
        businessName={settings.businessName}
        whatsappNumber={settings.whatsappNumber}
        whatsappMessage={settings.whatsappMessage}
        instagramUrl={settings.instagramUrl}
        appAccessEnabled={settings.appAccessEnabled}
        appAccessUrl={settings.appAccessUrl}
        appAccessLabel={settings.appAccessLabel}
      />
      {children}
      <Footer
        logoUrl={settings.logoUrl}
        businessName={settings.businessName}
        description={settings.institutionalText}
        whatsappNumber={settings.whatsappNumber}
        whatsappMessage={settings.whatsappMessage}
        instagramUrl={settings.instagramUrl}
        appAccessEnabled={settings.appAccessEnabled}
        appAccessUrl={settings.appAccessUrl}
        appAccessLabel={settings.appAccessLabel}
      />
    </>
  );
}
