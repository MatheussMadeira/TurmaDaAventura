'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { trackWhatsappClick } from '@/lib/analytics';
import { setQuoteVisible } from '@/lib/quoteVisibility';
import { buildQuoteMessage, whatsappUrl } from '@/lib/whatsapp';
import { dur } from '@/motion/tokens';
import { useInView } from '@/motion/useInView';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Select } from '../../atoms/Select';
import { TextField } from '../../atoms/TextField';
import { Alert, Check, Form, Full, Grid, Head, Note, Steps, SubmitWrap } from './QuoteForm.styles';

export interface QuoteFormValues {
  nome: string;
  tipo: string;
  data: string;
  criancas: string;
  idades: string;
  cidade: string;
  msg: string;
}

export interface QuoteFormProps {
  /** só dígitos com DDI; padrão NEXT_PUBLIC_WHATSAPP */
  phone?: string;
  title?: string;
  description?: string;
  eventTypes?: string[];
  /** tipo pré-selecionado (ex.: "Oficina" na página da Oficina) */
  defaultType?: string;
  /** rótulo do campo de nome (ex.: "Seu nome e empresa") */
  nameLabel?: string;
  /** recebe a URL wa.me já montada; sem ele o form abre o WhatsApp numa nova aba */
  onSubmit?: (whatsappUrl: string, values: QuoteFormValues) => void;
  className?: string;
  /** Só documentação (/_dev/componentes): valores e erros iniciais. */
  defaultValues?: Partial<QuoteFormValues>;
  defaultErrors?: Partial<Record<'nome' | 'tipo', string>>;
}

export const EVENT_TYPES = [
  'Restaurante (recreação fixa)',
  'Evento corporativo',
  'Oficina',
  'Festa ou evento particular',
  'Outro',
];

const EMPTY: QuoteFormValues = {
  nome: '',
  tipo: '',
  data: '',
  criancas: '',
  idades: '',
  cidade: '',
  msg: '',
};
type Errors = Partial<Record<'nome' | 'tipo', string>>;
type Status = 'idle' | 'sending' | 'done';

export function QuoteForm({
  phone,
  title = 'Monte seu orçamento',
  description = 'Preencha o básico e a conversa abre no WhatsApp com tudo pronto. Respondemos em horário comercial.',
  eventTypes = EVENT_TYPES,
  defaultType,
  nameLabel = 'Seu nome',
  onSubmit,
  className,
  defaultValues,
  defaultErrors,
}: QuoteFormProps) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const formRef = useRef<HTMLFormElement>(null);
  const timers = useRef<number[]>([]);

  const [values, setValues] = useState<QuoteFormValues>({
    ...EMPTY,
    tipo: defaultType && eventTypes.includes(defaultType) ? defaultType : '',
    ...defaultValues,
  });
  const [errors, setErrors] = useState<Errors>(defaultErrors ?? {});
  const [tries, setTries] = useState(0);
  /* Cada envio inválido remonta só os campos com erro para o chacoalho tocar de novo.
     Limpar o erro ao digitar NÃO muda a key (senão o input perderia o foco). */
  const [shake, setShake] = useState({ nome: 0, tipo: 0 });
  const [status, setStatus] = useState<Status>('idle');

  /* O WhatsAppFloat some enquanto o formulário estiver ≥ 25% visível. */
  const inView = useInView(formRef, { amount: 0.25, once: false });
  useEffect(() => {
    setQuoteVisible(uid, inView);
    return () => setQuoteVisible(uid, false);
  }, [inView, uid]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  /* Depois de um envio inválido, foca o primeiro campo com erro. */
  useEffect(() => {
    if (tries > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [tries]);

  const on =
    (key: keyof QuoteFormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (key === 'nome' || key === 'tipo') setErrors((er) => ({ ...er, [key]: undefined }));
    };

  const later = (fn: () => void, ms: number) => {
    if (reduce || ms === 0) return fn();
    timers.current.push(window.setTimeout(fn, ms));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (!values.nome.trim()) found.nome = 'Conta pra gente seu nome.';
    if (!values.tipo) found.tipo = 'Escolha o tipo de evento.';
    setErrors(found);
    if (Object.keys(found).length) {
      setTries((t) => t + 1);
      setShake((s) => ({
        nome: s.nome + (found.nome ? 1 : 0),
        tipo: s.tipo + (found.tipo ? 1 : 0),
      }));
      return;
    }

    const url = whatsappUrl(
      buildQuoteMessage(values, nameLabel === 'Seu nome' ? 'Nome' : nameLabel),
      phone,
    );
    trackWhatsappClick({ page: pathname ?? '/', placement: 'form' });
    setStatus('sending');
    /* pegadas (700ms) → check carimbado (dur-medium) → abre o wa.me; com reduced-motion vai direto */
    later(() => {
      setStatus('done');
      later(() => {
        setStatus('idle');
        if (onSubmit) onSubmit(url, values);
        else window.open(url, '_blank', 'noopener');
      }, dur.medium * 1000);
    }, 700);
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const busy = status !== 'idle';

  return (
    <Form
      ref={formRef}
      className={className}
      onSubmit={submit}
      noValidate
      aria-busy={busy || undefined}
      data-quote-form
    >
      <Head>
        <h3 className="h3">{title}</h3>
        <p className="body-sm">{description}</p>
      </Head>

      {errorCount > 0 ? (
        <Alert role="alert">
          <Icon name="flag" size={18} />
          Revise {errorCount} {errorCount === 1 ? 'campo' : 'campos'}
        </Alert>
      ) : null}

      <Grid>
        <TextField
          key={`nome${shake.nome}`}
          label={nameLabel}
          required
          value={values.nome}
          onChange={on('nome')}
          error={errors.nome}
          autoComplete="name"
        />
        <Select
          key={`tipo${shake.tipo}`}
          label="Tipo de evento"
          required
          value={values.tipo}
          onChange={on('tipo')}
          options={eventTypes}
          placeholder="Escolha uma opção"
          error={errors.tipo}
        />
        <TextField
          label="Data (se já souber)"
          type="date"
          value={values.data}
          onChange={on('data')}
        />
        <TextField
          label="Nº de crianças"
          type="number"
          min={1}
          inputMode="numeric"
          value={values.criancas}
          onChange={on('criancas')}
          hint="Uma estimativa já ajuda."
        />
        <TextField
          label="Idades"
          value={values.idades}
          onChange={on('idades')}
          placeholder="Ex.: 4 a 10 anos"
        />
        <TextField
          label="Cidade ou local"
          value={values.cidade}
          onChange={on('cidade')}
          autoComplete="address-level2"
        />
        <Full>
          <TextField label="Quer contar mais?" multiline value={values.msg} onChange={on('msg')} />
        </Full>
      </Grid>

      <SubmitWrap data-busy={busy}>
        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={busy}
          iconLeft={status === 'idle' ? 'whatsapp' : undefined}
        >
          {status === 'sending' ? (
            <>
              <Steps aria-hidden>
                <i />
                <i />
                <i />
              </Steps>
              Abrindo o WhatsApp…
            </>
          ) : status === 'done' ? (
            <>
              <Check aria-hidden>
                <Icon name="check" size={22} />
              </Check>
              Pronto, abrindo a conversa
            </>
          ) : (
            'Continuar no WhatsApp'
          )}
        </Button>
      </SubmitWrap>

      <Note className="caption">
        Não divulgamos preços no site: cada aventura é montada sob medida.
      </Note>
    </Form>
  );
}
