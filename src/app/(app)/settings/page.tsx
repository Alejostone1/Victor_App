import { Placeholder } from "@/components/ui/Placeholder";
import { buttonClasses } from "@/components/ui/Button";
import { signOut } from "@/lib/auth/actions";
import { UI_STRINGS } from "@/lib/config";

export default function SettingsPage() {
  return (
    <>
      <Placeholder title="Ajustes" phase="Fase 3" />
      <form action={signOut} className="mx-auto w-full max-w-[720px] px-6">
        <button type="submit" className={buttonClasses("secondary")}>
          {UI_STRINGS.signOut}
        </button>
      </form>
    </>
  );
}
