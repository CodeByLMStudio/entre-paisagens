'use client';

import { useState } from 'react';
import { z } from 'zod';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { issuesToRecord } from '@/lib/zodUtils';
import { useUiStore } from '@/stores/uiStore';

/**
 * Número de WhatsApp de destino (apenas dígitos, com DDI 55 + DDD).
 * Configurável via `NEXT_PUBLIC_WHATSAPP_NUMBER`.
 */
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5585912345678';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.'),
  email: z.string().trim().min(1, 'Informe seu e-mail.').email('E-mail inválido.'),
  subject: z.string().trim().min(1, 'Informe o assunto.'),
  message: z.string().trim().min(5, 'Escreva uma mensagem com pelo menos 5 caracteres.'),
});

type ContactErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

const EMPTY = { name: '', email: '', subject: '', message: '' };

/** Monta o texto da mensagem e o link `wa.me` com os dados do formulário. */
function buildWhatsAppUrl(values: typeof EMPTY): string {
  const lines = [
    'Contato via "Entre Paisagens"',
    `Assunto: ${values.subject}`,
    `Nome: ${values.name}`,
    `E-mail: ${values.email}`,
    '',
    values.message,
  ];
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function ContactModal() {
  const open = useUiStore((s) => s.contactOpen);
  const setOpen = useUiStore((s) => s.setContactOpen);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});

  const handleChange = (field: keyof typeof EMPTY, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      setErrors(issuesToRecord(result.error.issues) as ContactErrors);
      return;
    }
    setErrors({});

    // Abre o WhatsApp com a mensagem pré-preenchida.
    window.open(buildWhatsAppUrl(values), '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setOpen(false);
    setValues(EMPTY);
    setErrors({});
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <MessageSquare size={18} className="text-clay" />
          FALE CONOSCO
        </span>
      }
      className="max-w-lg"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <p className="text-xs font-medium leading-relaxed text-inkMuted">
            Tem alguma dúvida, sugestão ou contribuição sobre a plataforma? Envie uma
            mensagem para nossa equipe pelo WhatsApp.
          </p>

          <Field label="Seu Nome" required htmlFor="contact-name" error={errors.name}>
            <input
              id="contact-name"
              type="text"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nome completo"
              className={inputClass}
            />
          </Field>

          <Field label="E-mail" required htmlFor="contact-email" error={errors.email}>
            <input
              id="contact-email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="seuemail@exemplo.com"
              className={inputClass}
            />
          </Field>

          <Field label="Assunto" required htmlFor="contact-subject" error={errors.subject}>
            <input
              id="contact-subject"
              type="text"
              value={values.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Ex: Dúvida sobre mapeamento"
              className={inputClass}
            />
          </Field>

          <Field label="Mensagem" required htmlFor="contact-message" error={errors.message}>
            <textarea
              id="contact-message"
              rows={4}
              value={values.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Escreva sua mensagem aqui..."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Send size={16} /> Enviar pelo WhatsApp
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
