import { Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Resources: ['Help Center', 'Community', 'Templates', 'API Docs'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-foreground text-background py-10 md:py-14">
      <div className="container mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Logo & Social */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="font-display text-xl font-bold mb-4 block">
              LOUDIO
            </a>
            <p className="font-body text-xs text-background/60 mb-4">
              Transform your voice into crystal-clear text.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 bg-background text-foreground flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-bold text-xs mb-3">{category}</h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-xs text-background/60 hover:text-background transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-background/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="font-body text-xs text-background/60">
              © {new Date().getFullYear()} LOUDIO. All rights reserved.
            </p>
            <p className="font-body text-xs text-background/60">
              Made with ♥ for creators everywhere
            </p>
          </div>
        </div>

        {/* Large watermark logo */}
        <div className="mt-10 md:mt-14 overflow-hidden">
          <span className="font-display text-6xl md:text-8xl lg:text-[12rem] font-bold opacity-10 select-none block text-center">
            LOUDIO
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;