'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { countLabel } from '@/lib/bag';
import { Button } from '../../atoms/Button';
import { Icon, type IconName } from '../../atoms/Icon';
import { Media } from '../../atoms/Media';
import { Stepper } from '../../atoms/Stepper';
import { TextField } from '../../atoms/TextField';
import { VisuallyHidden } from '../../atoms/VisuallyHidden';
import { useBag } from './BagContext';
import {
  Body,
  Close,
  Drawer,
  Empty,
  Fields,
  Foot,
  Head,
  Item,
  ItemImg,
  ItemMeta,
  ItemName,
  ItemRow,
  List,
  Note,
  Over,
  Remove,
  Scrim,
  Title,
} from './Bag.styles';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Gaveta da sacola (lateral no desktop, folha inferior no celular). Modal acessível: Esc fecha,
 * o foco fica preso dentro, volta para o botão que abriu e o resto da página fica inerte.
 */
export function BagDrawer() {
  const { items, count, setQty, remove, form, setForm, send, close } = useBag();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const root = ref.current;
    if (!root) return;
    (root.querySelector<HTMLElement>(FOCUSABLE) ?? root).focus();

    const siblings = [...document.body.children].filter(
      (el) => !el.contains(root) && el instanceof HTMLElement,
    ) as HTMLElement[];
    siblings.forEach((el) => el.setAttribute('inert', ''));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!focusable.length) {
        e.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);

    return () => {
      document.removeEventListener('keydown', onKey, true);
      siblings.forEach((el) => el.removeAttribute('inert'));
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  const empty = items.length === 0;

  return createPortal(
    <div data-theme={document.documentElement.dataset.theme}>
      <Scrim onMouseDown={close} />
      <Drawer ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <Head>
          <div>
            <Over className="overline">{countLabel(count)}</Over>
            <Title id={titleId}>Sua sacola</Title>
          </div>
          <Close type="button" aria-label="Fechar sacola (Esc)" onClick={close}>
            <Icon name="close" size={22} />
          </Close>
        </Head>

        <Body>
          {empty ? (
            <Empty>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/simbolo-pegadas.svg"
                alt=""
                aria-hidden="true"
                width={80}
                height={80}
              />
              <h3 className="h4">Sua sacola está vazia</h3>
              <p className="body-sm">
                Escolha lembrancinhas e kits. A gente confirma tudo pelo WhatsApp.
              </p>
            </Empty>
          ) : (
            <>
              <List>
                {items.map((i) => (
                  <Item key={i.slug}>
                    <ItemImg>
                      <Media
                        src={i.image}
                        alt=""
                        icon={i.icon as IconName}
                        rounded={false}
                        sizes="64px"
                        placeholderId={`bag-${i.slug}`}
                      />
                    </ItemImg>
                    <div>
                      <ItemName>{i.name}</ItemName>
                      <ItemMeta>{i.meta}</ItemMeta>
                    </div>
                    <ItemRow>
                      <Stepper
                        label={`Quantidade de ${i.name}`}
                        value={i.qty}
                        onDecrease={() => setQty(i.slug, i.qty - 1)}
                        onIncrease={() => setQty(i.slug, i.qty + 1)}
                      />
                      <Remove type="button" onClick={() => remove(i.slug)}>
                        Remover
                        <VisuallyHidden> {i.name}</VisuallyHidden>
                      </Remove>
                    </ItemRow>
                  </Item>
                ))}
              </List>
              <Fields>
                <TextField
                  label="Seu nome"
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                  value={form.name ?? ''}
                  onChange={(e) => setForm({ name: e.target.value })}
                />
                <TextField
                  label="Para quando? (se for festa)"
                  type="date"
                  value={form.when ?? ''}
                  onChange={(e) => setForm({ when: e.target.value })}
                />
                <TextField
                  label="Personalização e observações"
                  multiline
                  rows={3}
                  placeholder="Ex.: nome da criança nas lembrancinhas, tema e cores da festa"
                  value={form.notes ?? ''}
                  onChange={(e) => setForm({ notes: e.target.value })}
                />
                <Note>
                  <Icon name="shield" size={18} />
                  <span>
                    Sem pagamento no site. Valores, disponibilidade e entrega são combinados no
                    WhatsApp.
                  </span>
                </Note>
              </Fields>
            </>
          )}
        </Body>

        <Foot>
          <Button iconLeft="whatsapp" size="lg" fullWidth disabled={empty} onClick={send}>
            Enviar pedido no WhatsApp
          </Button>
          {empty ? (
            <Button variant="ghost" fullWidth href="/produtos" onClick={close}>
              Ver produtos
            </Button>
          ) : (
            <Button variant="ghost" fullWidth onClick={close}>
              Continuar escolhendo
            </Button>
          )}
        </Foot>
      </Drawer>
    </div>,
    document.body,
  );
}
