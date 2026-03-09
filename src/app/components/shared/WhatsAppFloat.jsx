import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { generateGeneralWAMessage } from '../../../lib/utils';

export const WhatsAppFloat = () => {
  return (
    <a
      href={generateGeneralWAMessage()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-8 z-40"
    >
      <Button
        size="icon"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg animate-pulse hover:animate-none transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </a>
  );
};
