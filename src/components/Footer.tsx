export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-purple-800">
      <p className="mt-4 text-center text-sm">
        © 2023 - {currentYear} Jamal Lyons. All rights reserved.
      </p>
    </footer>
  );
}
