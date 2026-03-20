// No layout wrapper here - admin login should not show AdminNavbar or Footer
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
