function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white/60 border-t border-slate-200 py-3 px-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          © {currentYear} CRM Mini. All rights reserved.
        </p>
        <p className="text-xs text-slate-400">Version 1.0.0</p>
      </div>
    </footer>
  );
}

export default Footer;
