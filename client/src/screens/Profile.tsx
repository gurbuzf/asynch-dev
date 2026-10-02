import { Button, Callout, Card, PageHeader, SectionTitle } from "../components/ui.tsx";
import { useBaby } from "../lib/baby.ts";
import { back, navigate } from "../lib/router.ts";
import { actions } from "../lib/store.ts";
import { ProfileForm } from "./Onboarding.tsx";

export function ProfileScreen() {
  const baby = useBaby()!;
  return (
    <div className="pb-6">
      <PageHeader onBack={() => back("/")} emoji="👶" title="Profil" subtitle="Bilgileri güncelleyin; tüm öneriler anında uyarlanır." />
      <div className="mt-4">
        <ProfileForm
          initial={baby.profile}
          submitLabel="Kaydet"
          onSave={(p) => {
            actions.saveProfile(p);
            navigate("/");
          }}
        />
      </div>

      <SectionTitle emoji="ℹ️">Hakkında</SectionTitle>
      <Card className="space-y-2 text-[15px] font-semibold leading-relaxed">
        <p>
          <b>Minik Tabak</b>, ek gıda dönemini kolaylaştırmak için WHO (2023), AAP, ESPGHAN, CDC, NHS ve T.C. Sağlık Bakanlığı önerileri temel alınarak hazırlanmıştır.
        </p>
        <p className="text-muted">Verileriniz bu cihazın tarayıcısında saklanır. Günlük plan için sunucuya yalnızca yaş, besleme yöntemi, alerjen ve denenen besin bilgisi gönderilir — isim ve doğum tarihi gönderilmez, sunucu hiçbir şey saklamaz.</p>
        <Button variant="soft" size="sm" onClick={() => navigate("/rehber?tab=kaynaklar")}>Kaynakları gör</Button>
      </Card>

      <Callout tone="warn" className="mt-4">
        Bu uygulama tıbbi tavsiye yerine geçmez. Prematüre doğum, kronik hastalık, büyüme geriliği veya bilinen alerji gibi durumlarda beslenme planını çocuk doktorunuz ve diyetisyeninizle yapın.
      </Callout>

      <SectionTitle emoji="⚠️">Tehlikeli bölge</SectionTitle>
      <Button
        variant="danger"
        className="w-full"
        onClick={() => {
          if (confirm("Tüm veriler (profil, tadım günlüğü, alerjenler, favoriler) silinecek. Emin misiniz?")) actions.resetAll();
        }}
      >
        Tüm verileri sil
      </Button>
    </div>
  );
}
