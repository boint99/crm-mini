function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-200 py-2 px-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          © {currentYear} CRM Mini. All rights reserved.
        </p>
        <p className="text-sm text-gray-500">Version 1.0.0</p>
      </div>
    </footer>
  );
}

export default Footer;
