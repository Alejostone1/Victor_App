// TODO(Fase 2): barra inferior en móvil y barra lateral en PC (>= 1024px).
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <main className="flex flex-1 flex-col">{children}</main>;
}
