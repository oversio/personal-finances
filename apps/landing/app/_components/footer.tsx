import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/omaf-light.png"
              alt="OMA Finance"
              width={100}
              height={32}
              className="h-6 w-auto"
            />
          </div>

          <div className="flex items-center gap-8">
            <a
              href="#"
              className="cursor-pointer text-sm text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              Privacidad
            </a>
            <a
              href="#"
              className="cursor-pointer text-sm text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              Términos
            </a>
            <a
              href="#"
              className="cursor-pointer text-sm text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              Contacto
            </a>
          </div>

          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} OMA Finance. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
