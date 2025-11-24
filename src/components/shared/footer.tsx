
import { Facebook, Instagram, Mail } from 'lucide-react';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';

export function Footer() {
  return (
    <footer id="page-footer" className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Powered by{' '}
          <span className="font-semibold text-foreground">Kenneth AFANTSAWO</span>
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:kennethafantsawo@gmail.com"
            aria-label="Email"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Mail className="h-6 w-6" />
          </a>
          <a
            href="http://wa.me/22896417270"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <WhatsAppIcon className="h-6 w-6" />
          </a>
          <a
            href="https://www.instagram.com/kennethafantsawo?igsh=MWRhNTU5MHN2cHp0OA=="
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Instagram className="h-6 w-6" />
          </a>
          <a
            href="https://www.facebook.com/kennethafantsawo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Facebook className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}
